"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { puede, seAsigna, segundoFactorObligatorio, type Rol } from "@ed/auth";
import { crearEnlaceDeInvitacion } from "@ed/auth/servidor";
import { elegiTuContrasena } from "@/correos/elegi-tu-contrasena";
import { mandarCorreo } from "@/correos/mandar";
import { registrarActividad } from "@/datos/actividad";
import { auth } from "@/datos/auth";
import { base } from "@/datos/cliente";
import { esquemaDelCorreo, esquemaDelNombre } from "@/datos/esquemas";
import { HORAS_DE_LA_INVITACION as HORAS, NO_PUEDE, SIN_SESION, borrarEnlaces, borrarSiNuncaHizoNada, fallo, sobreLaCuenta, type Resultado } from "@/datos/sobre-cuentas";

// Invitar, reenviar y cancelar una invitación (SPEC de work/cuentas §4.2): la
// invitación es «Elegí tu contraseña», que vence a las 72 horas.

const esquemaDeInvitacion = z.object({
  correo: esquemaDelCorreo,
  nombre: esquemaDelNombre,
  // Dirige no se invita: se pasa.
  rol: z.custom<Rol>(seAsigna, "Elegí administra o edita."),
});

/** Arma el enlace, guarda cuándo vence y manda el correo. Contesta si salió. */
async function mandarInvitacion(cuenta: { id: string; nombre: string; correo: string; rol: Rol }, quienInvita: string): Promise<boolean> {
  const { enlace, vence } = await crearEnlaceDeInvitacion(auth, { idDeCuenta: cuenta.id, horas: HORAS, volverA: "/admin/nueva-contrasena" });
  await base.user.update({ where: { id: cuenta.id }, data: { invitacionVence: vence } });
  const contenido = elegiTuContrasena({ nombre: cuenta.nombre, enlace, minutosDeVigencia: HORAS * 60, invitacion: { quienInvita, rol: cuenta.rol } });
  const salida = await mandarCorreo({ para: cuenta.correo, contenido }).catch((e: unknown) => {
    console.error("La invitación no salió:", e instanceof Error ? e.message : e);
    return "no-salio" as const;
  });
  return salida !== "no-salio";
}

export type ResultadoDeInvitar = Resultado & { id?: string; correoSalio?: boolean };

/** Crea la cuenta sin contraseña, con el segundo factor si su rol lo pide, y le manda la invitación. */
export async function invitar(entrada: { correo: string; nombre: string; rol: string }): Promise<ResultadoDeInvitar> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return SIN_SESION;
    if (!puede(sesion.user.rol, "usarCuentas")) return NO_PUEDE;
    const datos = esquemaDeInvitacion.safeParse(entrada);
    if (!datos.success) return { ok: false, detalle: datos.error.issues[0]?.message ?? "Revisá los datos." };
    const { correo, nombre, rol } = datos.data;
    if (await base.user.findUnique({ where: { email: correo }, select: { id: true } })) return { ok: false, detalle: `Ya hay una cuenta con ${correo}.` };
    const ctx = await auth.$context;
    const { id } = await ctx.internalAdapter.createUser(
      { email: correo, name: nombre, emailVerified: false, rol, twoFactorEnabled: segundoFactorObligatorio(rol) },
      { method: "admin" },
    );
    const correoSalio = await mandarInvitacion({ id, nombre, correo, rol }, sesion.user.name);
    await registrarActividad({ tipo: "invito", quien: sesion.user.id, sobre: nombre, sobreId: id });
    revalidatePath("/admin/cuentas", "layout");
    return { ok: true, id, correoSalio, detalle: correoSalio ? `Le mandamos la invitación a ${correo}.` : "La cuenta quedó creada, pero la invitación no salió." };
  } catch (e) {
    return fallo("invitar", e);
  }
}

/** Borra el enlace que tenía y le manda uno nuevo, de otras 72 horas. */
export async function reenviarInvitacion(idDeCuenta: string): Promise<Resultado> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return SIN_SESION;
    if (!puede(sesion.user.rol, "usarCuentas")) return NO_PUEDE;
    return await sobreLaCuenta(sesion, idDeCuenta, "reenviarLaInvitacion", async (cuenta) => {
      await borrarEnlaces(cuenta.id);
      const salio = await mandarInvitacion(cuenta, sesion.user.name);
      await registrarActividad({ tipo: "reenvio-la-invitacion", quien: sesion.user.id, sobre: cuenta.nombre, sobreId: cuenta.id });
      revalidatePath("/admin/cuentas", "layout");
      return salio
        ? { ok: true, detalle: `Le mandamos la invitación a ${cuenta.correo}. Vence en ${HORAS} horas.` }
        : { ok: false, detalle: "La invitación no salió: el envío de correos no está andando. Probá de nuevo cuando ande." };
    });
  } catch (e) {
    return fallo("reenviarInvitacion", e);
  }
}

/** Una invitación cancelada es una cuenta que nunca entró: se borra, con sus enlaces. */
export async function cancelarInvitacion(idDeCuenta: string): Promise<Resultado> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return SIN_SESION;
    if (!puede(sesion.user.rol, "usarCuentas")) return NO_PUEDE;
    return await sobreLaCuenta(sesion, idDeCuenta, "cancelarLaInvitacion", async (cuenta) => {
      if ((await borrarSiNuncaHizoNada(cuenta.id)) === "tiene-historia") return { ok: false, detalle: "Esta cuenta ya hizo cosas en el admin: suspendela." };
      await registrarActividad({ tipo: "cancelo-la-invitacion", quien: sesion.user.id, sobre: cuenta.nombre, sobreId: cuenta.id });
      revalidatePath("/admin/cuentas", "layout");
      return { ok: true, detalle: `Cancelamos la invitación de ${cuenta.nombre}.` };
    });
  } catch (e) {
    return fallo("cancelarInvitacion", e);
  }
}
