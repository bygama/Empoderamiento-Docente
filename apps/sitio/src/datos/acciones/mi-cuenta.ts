"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { registrarActividad } from "@/datos/actividad";
import { auth } from "@/datos/auth";
import { esquemaDelNombre } from "@/datos/esquemas";

// Lo que cada persona cambia de su propia cuenta. No pide capacidad: la
// cuenta propia es de todo rol con sesión (SPEC de work/roles-y-actividad §3).
// La contraseña y las sesiones no pasan por acá sino por el cliente de
// better-auth, que es quien pone la cookie nueva y aplica el rate limit.

/** Cambia el nombre de quien tiene la sesión, lo anota y redibuja el armazón, que lo muestra abajo en la sidebar. */
export async function cambiarMiNombre(nombre: string): Promise<{ ok: boolean; detalle: string }> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return { ok: false, detalle: "Hay que entrar al admin para cambiar el nombre." };
    const valido = esquemaDelNombre.safeParse(nombre);
    if (!valido.success) return { ok: false, detalle: valido.error.issues[0]?.message ?? "Ese nombre no sirve." };
    if (valido.data === sesion.user.name) return { ok: true, detalle: "Tu nombre ya era ese." };
    await auth.api.updateUser({ headers: await headers(), body: { name: valido.data } });
    await registrarActividad({ tipo: "cambio-su-nombre", quien: sesion.user.id, sobre: valido.data });
    revalidatePath("/admin", "layout");
    return { ok: true, detalle: `Listo: ahora figurás como ${valido.data}.` };
  } catch (e) {
    console.error("cambiarMiNombre:", e);
    return { ok: false, detalle: "No se pudo guardar el nombre; probá de nuevo en un rato." };
  }
}
