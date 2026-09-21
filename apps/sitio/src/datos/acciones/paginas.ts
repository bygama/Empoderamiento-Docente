"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { SLUGS } from "@/contenido/paginas";
import { auth } from "@/datos/auth";
import { base } from "@/datos/cliente";
import { descartarBorradorEnBase, guardarBorradorEnBase, publicarEnBase, type ResultadoDeGuardar, type ResultadoDePublicar } from "./editar-paginas";

// Las tres acciones del editor (SPEC §7). Toda acción del admin empieza por
// `auth.api.getSession` y contesta en llano si no hay sesión: el layout
// protegido no las cubre y el middleware las deja pasar (AGENTS.md §12). Todo
// va adentro del `try`, la sesión incluida: si la base no responde, la acción
// contesta en llano en vez de tirar y llevarse el editor (como
// actualizar-metricas.ts). El contenido lo valida editar-paginas.ts contra el
// esquema de la sección.

const esquemaSlug = z.enum(SLUGS);
const esquemaPedido = z.object({ slug: esquemaSlug, seccion: z.string().min(1), borradorEnVisto: z.string().nullable() });

export async function guardarBorrador(pedido: { slug: string; seccion: string; contenido: unknown; borradorEnVisto: string | null }): Promise<ResultadoDeGuardar> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return { ok: false, detalle: "Hay que entrar al admin para guardar." };
    const valido = esquemaPedido.safeParse(pedido);
    if (!valido.success) return { ok: false, detalle: "El pedido no tiene la forma esperada." };
    return await guardarBorradorEnBase(base, { ...valido.data, contenido: pedido.contenido, quien: sesion.user.name });
  } catch (e) {
    console.error("guardarBorrador:", e);
    return { ok: false, detalle: "No se pudo guardar; probá de nuevo en un rato." };
  }
}

export async function publicar(slug: string): Promise<ResultadoDePublicar> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return { ok: false, detalle: "Hay que entrar al admin para publicar." };
    const valido = esquemaSlug.safeParse(slug);
    if (!valido.success) return { ok: false, detalle: "Esa página no existe." };
    const resultado = await publicarEnBase(base, { slug: valido.data, quien: sesion.user.name });
    // La página del sitio es estática: esto la regenera en la próxima visita (spec del admin §4).
    if (resultado.ok) revalidatePath(resultado.ruta);
    return resultado;
  } catch (e) {
    console.error("publicar:", e);
    return { ok: false, detalle: "No se pudo publicar; probá de nuevo en un rato." };
  }
}

export async function descartarBorrador(slug: string): Promise<{ ok: boolean; detalle: string }> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return { ok: false, detalle: "Hay que entrar al admin para descartar." };
    const valido = esquemaSlug.safeParse(slug);
    if (!valido.success) return { ok: false, detalle: "Esa página no existe." };
    return await descartarBorradorEnBase(base, valido.data);
  } catch (e) {
    console.error("descartarBorrador:", e);
    return { ok: false, detalle: "No se pudo descartar; probá de nuevo en un rato." };
  }
}
