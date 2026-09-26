"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { SLUGS } from "@/contenido/paginas";
import { auth } from "@/datos/auth";
import { base } from "@/datos/cliente";
import type { Fallo } from "./choque";
import { descartarBorradorEnBase, guardarBorradorEnBase, type ResultadoDeGuardar } from "./editar-paginas";
import { publicarEnBase, type ResultadoDePublicar } from "./publicar-paginas";

// Las tres acciones del editor (SPEC §7). Toda acción del admin empieza por
// `auth.api.getSession` y contesta en llano si no hay sesión: el layout
// protegido no las cubre y el proxy las deja pasar (AGENTS.md §12). Todo
// va adentro del `try`, la sesión incluida: si la base no responde, la acción
// contesta en llano en vez de tirar y llevarse el editor (como
// actualizar-metricas.ts). El contenido lo valida editar-paginas.ts contra el
// esquema de la sección. Las tres llevan el `borradorEn` que vio la pantalla:
// si otra persona guardó mientras tanto, contestan el choque (choque.ts).

const esquemaSlug = z.enum(SLUGS);
const esquemaDeLaPagina = z.object({ slug: esquemaSlug, borradorEnVisto: z.string().nullable() });
const esquemaPedido = esquemaDeLaPagina.extend({ seccion: z.string().min(1) });

// El layout protegido, que dibuja la sidebar con el punto de «cambios sin
// publicar» (admin/armazon/BarraLateral). El layout no se vuelve a pedir al
// navegar: sin esta revalidación, el punto quedaría viejo hasta recargar.
// Desde una Server Function, además, la pantalla se actualiza en el acto.
const ARMAZON_DEL_ADMIN = "/(admin)/admin/(protegido)";

export async function guardarBorrador(pedido: { slug: string; seccion: string; contenido: unknown; borradorEnVisto: string | null }): Promise<ResultadoDeGuardar> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return { ok: false, detalle: "Hay que entrar al admin para guardar." };
    const valido = esquemaPedido.safeParse(pedido);
    if (!valido.success) return { ok: false, detalle: "El pedido no tiene la forma esperada." };
    const resultado = await guardarBorradorEnBase(base, { ...valido.data, contenido: pedido.contenido, quien: sesion.user.name });
    if (resultado.ok) revalidatePath(ARMAZON_DEL_ADMIN, "layout");
    return resultado;
  } catch (e) {
    console.error("guardarBorrador:", e);
    return { ok: false, detalle: "No se pudo guardar; probá de nuevo en un rato." };
  }
}

export async function publicar(pedido: { slug: string; borradorEnVisto: string | null }): Promise<ResultadoDePublicar> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return { ok: false, detalle: "Hay que entrar al admin para publicar." };
    const valido = esquemaDeLaPagina.safeParse(pedido);
    if (!valido.success) return { ok: false, detalle: "Esa página no existe." };
    const resultado = await publicarEnBase(base, { ...valido.data, quien: sesion.user.name });
    // La página del sitio es estática: esto la regenera en la próxima visita (spec del admin §4).
    if (resultado.ok) {
      revalidatePath(resultado.ruta);
      revalidatePath(ARMAZON_DEL_ADMIN, "layout");
    }
    return resultado;
  } catch (e) {
    console.error("publicar:", e);
    return { ok: false, detalle: "No se pudo publicar; probá de nuevo en un rato." };
  }
}

export async function descartarBorrador(pedido: { slug: string; borradorEnVisto: string | null }): Promise<{ ok: true; detalle: string } | Fallo> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return { ok: false, detalle: "Hay que entrar al admin para descartar." };
    const valido = esquemaDeLaPagina.safeParse(pedido);
    if (!valido.success) return { ok: false, detalle: "Esa página no existe." };
    const resultado = await descartarBorradorEnBase(base, valido.data);
    if (resultado.ok) revalidatePath(ARMAZON_DEL_ADMIN, "layout");
    return resultado;
  } catch (e) {
    console.error("descartarBorrador:", e);
    return { ok: false, detalle: "No se pudo descartar; probá de nuevo en un rato." };
  }
}
