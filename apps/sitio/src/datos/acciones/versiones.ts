"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { SLUGS } from "@/contenido/paginas";
import { auth } from "@/datos/auth";
import { base } from "@/datos/cliente";
import { restaurarVersionEnBase, type ResultadoDeRestaurar } from "./versiones-de-paginas";

// «Restaurar como borrador» desde la pestaña Versiones (SPEC §3 de
// `work/paginas-inicio/`). Como toda acción del admin, empieza por la sesión y
// contesta en llano si algo falla (paginas.ts cuenta por qué).

const esquemaPedido = z.object({ slug: z.enum(SLUGS), version: z.uuid(), borradorEnVisto: z.string().nullable() });

// El layout protegido, con el punto de «cambios sin publicar» de la sidebar.
const ARMAZON_DEL_ADMIN = "/(admin)/admin/(protegido)";

export async function restaurarVersion(pedido: { slug: string; version: string; borradorEnVisto: string | null }): Promise<ResultadoDeRestaurar> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return { ok: false, detalle: "Hay que entrar al admin para restaurar una versión." };
    const valido = esquemaPedido.safeParse(pedido);
    if (!valido.success) return { ok: false, detalle: "Esa versión no existe." };
    const resultado = await restaurarVersionEnBase(base, { ...valido.data, quien: sesion.user.name });
    if (resultado.ok) revalidatePath(ARMAZON_DEL_ADMIN, "layout");
    return resultado;
  } catch (e) {
    console.error("restaurarVersion:", e);
    return { ok: false, detalle: "No se pudo restaurar; probá de nuevo en un rato." };
  }
}
