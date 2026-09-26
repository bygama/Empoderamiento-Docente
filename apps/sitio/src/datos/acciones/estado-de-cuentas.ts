"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { puede } from "@ed/auth";
import { registrarActividad } from "@/datos/actividad";
import { auth } from "@/datos/auth";
import { base } from "@/datos/cliente";
import { NO_PUEDE, SIN_SESION, borrarSiNuncaHizoNada, cerrarSesiones, fallo, sobreLaCuenta, type Resultado } from "@/datos/sobre-cuentas";

// Suspender en vez de borrar (SPEC de work/cuentas §4.3): una cuenta
// suspendida ya no entra, pero su nombre queda en la historia. Borrar, solo
// si nunca hizo nada, y eso lo decide la base.

export async function suspender(idDeCuenta: string): Promise<Resultado> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return SIN_SESION;
    if (!puede(sesion.user.rol, "usarCuentas")) return NO_PUEDE;
    return await sobreLaCuenta(sesion, idDeCuenta, "suspender", async (cuenta) => {
      await base.user.update({ where: { id: cuenta.id }, data: { suspendida: true } });
      // Las que tenía abiertas, al instante: una suspendida no abre otras (`@ed/auth`, suspendidas.ts).
      await cerrarSesiones(cuenta.id);
      await registrarActividad({ tipo: "suspendio", quien: sesion.user.id, sobre: cuenta.nombre, sobreId: cuenta.id });
      revalidatePath("/admin/cuentas", "layout");
      return { ok: true, detalle: `Listo: ${cuenta.nombre} ya no puede entrar. Su nombre sigue en la historia.` };
    });
  } catch (e) {
    return fallo("suspender", e);
  }
}

export async function reactivar(idDeCuenta: string): Promise<Resultado> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return SIN_SESION;
    if (!puede(sesion.user.rol, "usarCuentas")) return NO_PUEDE;
    return await sobreLaCuenta(sesion, idDeCuenta, "reactivar", async (cuenta) => {
      await base.user.update({ where: { id: cuenta.id }, data: { suspendida: false } });
      await registrarActividad({ tipo: "reactivo", quien: sesion.user.id, sobre: cuenta.nombre, sobreId: cuenta.id });
      revalidatePath("/admin/cuentas", "layout");
      return { ok: true, detalle: `Listo: ${cuenta.nombre} puede volver a entrar.` };
    });
  } catch (e) {
    return fallo("reactivar", e);
  }
}

export async function borrarCuenta(idDeCuenta: string): Promise<Resultado> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return SIN_SESION;
    if (!puede(sesion.user.rol, "usarCuentas")) return NO_PUEDE;
    return await sobreLaCuenta(sesion, idDeCuenta, "borrar", async (cuenta) => {
      if ((await borrarSiNuncaHizoNada(cuenta.id)) === "tiene-historia") {
        return { ok: false, detalle: `${cuenta.nombre} ya hizo cosas en el admin y su nombre queda en la historia: suspendela.` };
      }
      await registrarActividad({ tipo: "borro-una-cuenta", quien: sesion.user.id, sobre: cuenta.nombre, sobreId: cuenta.id });
      revalidatePath("/admin/cuentas", "layout");
      return { ok: true, detalle: `Listo: borramos la cuenta de ${cuenta.nombre}.` };
    });
  } catch (e) {
    return fallo("borrarCuenta", e);
  }
}
