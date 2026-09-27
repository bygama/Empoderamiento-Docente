"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { SIN_PERMISO, puede } from "@ed/auth";
import { registrarActividad } from "@/datos/actividad";
import { auth } from "@/datos/auth";
import { borrarMarca as borrarEnBase, crearMarca, fechaDeMarcaValida, LARGO_DE_UNA_MARCA } from "@/datos/marcas";

// Las marcas a mano de la curva del Resumen (work/metricas-completas/SPEC.md
// §6.1.1): sesión, `verMetricas`, Zod y la actividad. Las de publicar salen
// solas de la actividad y no pasan por acá.

const PANTALLA = "/admin/metricas";

const esquemaDeAgregar = z.object({
  fecha: z.string().refine((f) => fechaDeMarcaValida(f), "Elegí un día de hoy para atrás."),
  texto: z
    .string()
    .trim()
    .min(1, "Escribí qué pasó ese día.")
    .max(LARGO_DE_UNA_MARCA, `Hasta ${LARGO_DE_UNA_MARCA} caracteres.`),
});
const esquemaDeBorrar = z.object({ id: z.string().min(1).max(100) });

export type ResultadoDeMarca = { ok: boolean; detalle: string };

export async function agregarMarca(pedido: { fecha: string; texto: string }): Promise<ResultadoDeMarca> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return { ok: false, detalle: "Hay que entrar al admin para agregar una marca." };
    if (!puede(sesion.user.rol, "verMetricas")) return { ok: false, detalle: SIN_PERMISO };
    const valido = esquemaDeAgregar.safeParse(pedido);
    if (!valido.success) return { ok: false, detalle: valido.error.issues[0]?.message ?? "Revisá la fecha y el texto." };
    const { fecha, texto } = valido.data;
    await crearMarca({ fecha, texto, creadaPor: sesion.user.name });
    revalidatePath(PANTALLA);
    await registrarActividad({ tipo: "agrego-una-marca", quien: sesion.user.id, sobre: texto });
    return { ok: true, detalle: "Listo: la marca quedó en la curva." };
  } catch (e) {
    console.error("agregarMarca:", e instanceof Error ? e.message : e);
    return { ok: false, detalle: "No se pudo agregar la marca; probá de nuevo en un rato." };
  }
}

export async function borrarMarca(pedido: { id: string }): Promise<ResultadoDeMarca> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return { ok: false, detalle: "Hay que entrar al admin para borrar una marca." };
    if (!puede(sesion.user.rol, "verMetricas")) return { ok: false, detalle: SIN_PERMISO };
    const valido = esquemaDeBorrar.safeParse(pedido);
    if (!valido.success) return { ok: false, detalle: "El pedido no tiene la forma esperada." };
    const borrada = await borrarEnBase(valido.data.id);
    if (!borrada) return { ok: false, detalle: "Esa marca ya no estaba." };
    revalidatePath(PANTALLA);
    await registrarActividad({ tipo: "borro-una-marca", quien: sesion.user.id, sobre: borrada.texto });
    return { ok: true, detalle: "Se borró la marca." };
  } catch (e) {
    console.error("borrarMarca:", e instanceof Error ? e.message : e);
    return { ok: false, detalle: "No se pudo borrar la marca; probá de nuevo en un rato." };
  }
}
