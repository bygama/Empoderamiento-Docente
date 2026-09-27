"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/datos/auth";
import { avisosDe, guardarAviso } from "@/datos/avisos";

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
