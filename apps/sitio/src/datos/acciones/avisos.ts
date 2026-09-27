"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { SIN_PERMISO, puede } from "@ed/auth";
import { AVISOS, esAviso } from "@/config/avisos";
import { registrarActividad } from "@/datos/actividad";
import { auth } from "@/datos/auth";
import { avisosDe, guardarAviso, ponerQuienRecibe } from "@/datos/avisos";

// Los avisos de Mi cuenta (work/mensajes/SPEC.md §9): cuáles de los del
// registro (`config/avisos.ts`) le mandan un correo a quien tiene la sesión.
// Es la cuenta propia, así que no pide una capacidad propia (SIN_CAPACIDAD de
// acciones-con-sesion.test.ts); lo que sí mira es que cada aviso sea de los que
// su rol recibe: el que no, no se toca.

const esquema = z.array(z.string().max(40)).max(10);

export async function guardarMisAvisos(activas: string[]): Promise<{ ok: boolean; detalle: string }> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return { ok: false, detalle: "Hay que entrar al admin para cambiar tus avisos." };
    const pedidas = esquema.safeParse(activas);
    if (!pedidas.success) return { ok: false, detalle: "No entendimos qué avisos querés." };
    const elegidas = new Set(pedidas.data);
    const suyas = await avisosDe(sesion.user.id, sesion.user.rol);
    await Promise.all(suyas.map(({ aviso }) => guardarAviso(sesion.user.id, aviso, elegidas.has(aviso))));
    revalidatePath("/admin/mi-cuenta");
    return { ok: true, detalle: "Listo: tus avisos quedaron así." };
  } catch (e) {
    console.error("guardarMisAvisos:", e instanceof Error ? e.name : "error");
    return { ok: false, detalle: "No se pudieron guardar tus avisos; probá de nuevo en un rato." };
  }
}

// Ajustes › Avisos (work/ajustes/SPEC.md §2.4): quién recibe un aviso, visto
// desde las cuentas. Es la misma preferencia que Mi cuenta › Avisos, así que
// escribe con la misma función; esta sí pide `usarAjustes`, porque toca las
// cuentas de otras personas.

const esquemaDeQuienRecibe = z.object({ aviso: z.string().max(40), cuentas: z.array(z.string().max(100)).max(200) });

export async function guardarQuienRecibe(pedido: { aviso: string; cuentas: string[] }): Promise<{ ok: boolean; detalle: string }> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return { ok: false, detalle: "Hay que entrar al admin para cambiar quién recibe los avisos." };
    if (!puede(sesion.user.rol, "usarAjustes")) return { ok: false, detalle: SIN_PERMISO };
    const valido = esquemaDeQuienRecibe.safeParse(pedido);
    if (!valido.success || !esAviso(valido.data.aviso)) return { ok: false, detalle: "Ese aviso no existe." };
    const { aviso, cuentas } = valido.data;
    const { reciben, cambiaron } = await ponerQuienRecibe(aviso, cuentas);
    // Guardar sin tocar nada no es un cambio: no va a la actividad.
    if (cambiaron) {
      revalidatePath("/admin/ajustes", "layout");
      await registrarActividad({ tipo: "cambio-quien-recibe-un-aviso", quien: sesion.user.id, sobre: AVISOS[aviso].nombre });
    }
    const { cada } = AVISOS[aviso];
    if (!reciben) return { ok: true, detalle: `Nadie va a recibir un correo con cada ${cada}: se va a ver solo al entrar al admin.` };
    return { ok: true, detalle: `Listo: ${reciben === 1 ? "1 persona recibe" : `${reciben} personas reciben`} un correo con cada ${cada}.` };
  } catch (e) {
    console.error("guardarQuienRecibe:", e instanceof Error ? e.name : "error");
    return { ok: false, detalle: "No se pudo guardar quién recibe los avisos; probá de nuevo en un rato." };
  }
}
