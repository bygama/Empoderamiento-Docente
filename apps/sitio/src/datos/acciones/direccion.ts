"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { ROL_AL_DEJAR_LA_DIRECCION, ROL_DE_LA_DIRECCION, puede } from "@ed/auth";
import { confirmarContrasena } from "@ed/auth/servidor";
import { registrarActividad } from "@/datos/actividad";
import { auth } from "@/datos/auth";
import { almacenDeBloqueos } from "@/datos/bloqueos-de-acceso";
import { base } from "@/datos/cliente";
import { ponerRol } from "@/datos/roles";
import { NO_PUEDE, SIN_SESION, fallo, sobreLaCuenta, type Resultado } from "@/datos/sobre-cuentas";

/**
 * Pasarle la dirección a otra persona (SPEC de work/cuentas §4.3): solo quien
 * dirige, y pidiendo otra vez su contraseña, que cuenta en el bloqueo por
 * cuenta como un intento de entrar (`confirmarContrasena`). Quien dirigía
 * pasa a administra.
 */
export async function pasarLaDireccion(idDeCuenta: string, contrasena: string): Promise<Resultado> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return SIN_SESION;
    if (!puede(sesion.user.rol, "pasarLaDireccion")) return NO_PUEDE;
    return await sobreLaCuenta(sesion, idDeCuenta, "pasarleLaDireccion", async (cuenta) => {
      const confirmacion = await confirmarContrasena(auth, {
        headers: await headers(),
        correo: sesion.user.email,
        contrasena: String(contrasena),
        bloqueos: almacenDeBloqueos,
      });
      if (confirmacion === "frenada") return { ok: false, detalle: "Probaste demasiadas veces. Esperá unos minutos y volvé a intentar." };
      if (confirmacion === "mal") return { ok: false, detalle: "Esa no es tu contraseña." };
      await base.$transaction(async (tx) => {
        // Primero baja una y después sube la otra: dirige es una, y el índice
        // `user_una_sola_dirige` no deja dos ni por un instante.
        await ponerRol(sesion.user.id, ROL_AL_DEJAR_LA_DIRECCION, tx);
        await ponerRol(cuenta.id, ROL_DE_LA_DIRECCION, tx);
      });
      await registrarActividad({ tipo: "paso-la-direccion", quien: sesion.user.id, sobre: cuenta.nombre, sobreId: cuenta.id });
      revalidatePath("/admin", "layout");
      return { ok: true, detalle: `Listo: ahora dirige ${cuenta.nombre}, y vos pasaste a ${ROL_AL_DEJAR_LA_DIRECCION}.` };
    });
  } catch (e) {
    return fallo("pasarLaDireccion", e);
  }
}
