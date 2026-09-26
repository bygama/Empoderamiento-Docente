"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { puede, seAsigna } from "@ed/auth";
import { mandarCorreo } from "@/correos/mandar";
import { tuCorreoCambio } from "@/correos/tu-correo-cambio";
import { registrarActividad } from "@/datos/actividad";
import { auth } from "@/datos/auth";
import { base } from "@/datos/cliente";
import { esquemaDelCorreo } from "@/datos/esquemas";
import { ponerRol } from "@/datos/roles";
import { NO_PUEDE, SIN_SESION, cerrarSesiones, fallo, sobreLaCuenta, type Resultado } from "@/datos/sobre-cuentas";

// Lo que se le cambia a otra cuenta desde Cuentas (SPEC de work/cuentas §4.3):
// el rol, el correo y sus sesiones. Quién puede qué lo dice `queSePuede`.

export async function cambiarElRol(idDeCuenta: string, rol: string): Promise<Resultado> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return SIN_SESION;
    if (!puede(sesion.user.rol, "usarCuentas")) return NO_PUEDE;
    if (!seAsigna(rol)) return { ok: false, detalle: "Elegí administra o edita." };
    return await sobreLaCuenta(sesion, idDeCuenta, "cambiarElRol", async (cuenta) => {
      if (cuenta.rol === rol) return { ok: true, detalle: `${cuenta.nombre} ya tenía ese rol.` };
      // Si el rol nuevo pide el segundo factor y no lo tenía, se lo prende y le cierra las sesiones.
      const { cerroSesiones } = await ponerRol(cuenta.id, rol);
      await registrarActividad({ tipo: "cambio-el-rol", quien: sesion.user.id, sobre: `${cuenta.nombre}, de ${cuenta.rol} a ${rol}`, sobreId: cuenta.id });
      revalidatePath("/admin", "layout");
      const cerradas = cerroSesiones ? " Su rol pide el segundo factor: le cerramos las sesiones y la próxima vez entra con un código." : "";
      return { ok: true, detalle: `Listo: el rol de ${cuenta.nombre} ahora es ${rol}.${cerradas}` };
    });
  } catch (e) {
    return fallo("cambiarElRol", e);
  }
}

/**
 * El correo con que entra. Le cierra las sesiones (si es la propia, las
 * otras) y avisa a la dirección vieja y a la nueva (DECISIONS de work/cuentas).
 */
export async function cambiarElCorreo(idDeCuenta: string, correo: string): Promise<Resultado> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return SIN_SESION;
    if (!puede(sesion.user.rol, "usarCuentas")) return NO_PUEDE;
    const nuevo = esquemaDelCorreo.safeParse(correo);
    if (!nuevo.success) return { ok: false, detalle: nuevo.error.issues[0]?.message ?? "Ese correo no sirve." };
    return await sobreLaCuenta(sesion, idDeCuenta, "cambiarElCorreo", async (cuenta) => {
      if (cuenta.correo === nuevo.data) return { ok: true, detalle: "Ese ya era su correo." };
      if (await base.user.findUnique({ where: { email: nuevo.data }, select: { id: true } })) return { ok: false, detalle: `Ya hay otra cuenta con ${nuevo.data}.` };
      await base.user.update({ where: { id: cuenta.id }, data: { email: nuevo.data } });
      const propia = cuenta.id === sesion.user.id;
      await cerrarSesiones(cuenta.id, propia ? sesion.session.id : undefined);
      const contenido = tuCorreoCambio({ nombre: cuenta.nombre, anterior: cuenta.correo, nuevo: nuevo.data, cuando: new Date() });
      const salidas = await Promise.all([cuenta.correo, nuevo.data].map((para) => mandarCorreo({ para, contenido }).catch(() => "no-salio" as const)));
      await registrarActividad({ tipo: "cambio-el-correo", quien: sesion.user.id, sobre: cuenta.nombre, sobreId: cuenta.id });
      revalidatePath("/admin", "layout");
      const sesiones = propia ? "Cerramos tus otras sesiones" : "Le cerramos las sesiones";
      const aviso = salidas.includes("no-salio") ? ", pero el aviso por correo no salió." : " y avisamos por correo a las dos direcciones.";
      return { ok: true, detalle: `Listo: ahora entra con ${nuevo.data}. ${sesiones}${aviso}` };
    });
  } catch (e) {
    return fallo("cambiarElCorreo", e);
  }
}

export async function cerrarSusSesiones(idDeCuenta: string): Promise<Resultado> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return SIN_SESION;
    if (!puede(sesion.user.rol, "usarCuentas")) return NO_PUEDE;
    return await sobreLaCuenta(sesion, idDeCuenta, "cerrarSusSesiones", async (cuenta) => {
      await cerrarSesiones(cuenta.id);
      await registrarActividad({ tipo: "cerro-las-sesiones", quien: sesion.user.id, sobre: cuenta.nombre, sobreId: cuenta.id });
      revalidatePath("/admin/cuentas", "layout");
      return { ok: true, detalle: `Listo: cerramos las sesiones de ${cuenta.nombre}.` };
    });
  } catch (e) {
    return fallo("cerrarSusSesiones", e);
  }
}
