"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { SIN_PERMISO, puede } from "@ed/auth";
import { registrarActividad } from "@/datos/actividad";
import { auth } from "@/datos/auth";
import { base } from "@/datos/cliente";
import type { Fallo } from "./choque";
import { borrarNovedadEnBase, crearNovedadEnBase, guardarNovedadEnBase, type ResultadoDeGuardar } from "./editar-novedades";
import { refrescarAdmin, revalidarSitio } from "./revalidar-novedades";

// Crear, guardar y borrar una novedad desde su ficha (SPEC §5.3 de
// `work/novedades-y-kit/`); publicar, despublicar y descartar están en
// ciclo-de-novedades.ts, y la vista previa en vista-previa.ts. Toda acción
// empieza por la sesión y sigue con `editarNovedades` (AGENTS.md §12), y
// contesta en llano si algo falla. Guardar un borrador no queda en la
// actividad: no cambia el sitio (SPEC padre §5.8); borrar, sí. Guardar tampoco
// revalida: las pantallas del admin se piden de nuevo al navegar, y un refresco
// del primer guardado de `/nueva`, que ya pasó a `/[id]`, rearmaría la ficha.

const SIN_SESION = { ok: false as const, detalle: "Hay que entrar al admin." };
const esquemaPedido = z.object({ id: z.uuid(), borradorEnVisto: z.string().nullable() });

function fallo(accion: string, e: unknown) {
  // Sin el mensaje del error: el de Prisma puede traer lo que se intentó guardar.
  console.error(`${accion}:`, e instanceof Error ? e.name : "error");
  return { ok: false as const, detalle: "No se pudo guardar; probá de nuevo en un rato." };
}

/** El primer guardado de una novedad nueva: crea la fila y devuelve su id, para que la ficha pase a `/admin/novedades/[id]`. */
export async function crearNovedad(pedido: { contenido: unknown }): Promise<ResultadoDeGuardar> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return SIN_SESION;
    if (!puede(sesion.user.rol, "editarNovedades")) return { ok: false, detalle: SIN_PERMISO };
    return await crearNovedadEnBase(base, { contenido: pedido?.contenido, quien: sesion.user.name });
  } catch (e) {
    return fallo("crearNovedad", e);
  }
}

export async function guardarNovedad(pedido: { id: string; contenido: unknown; borradorEnVisto: string | null }): Promise<ResultadoDeGuardar> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return SIN_SESION;
    if (!puede(sesion.user.rol, "editarNovedades")) return { ok: false, detalle: SIN_PERMISO };
    const valido = esquemaPedido.safeParse(pedido);
    if (!valido.success) return { ok: false, detalle: "El pedido no tiene la forma esperada." };
    return await guardarNovedadEnBase(base, { ...valido.data, contenido: pedido.contenido, quien: sesion.user.name });
  } catch (e) {
    return fallo("guardarNovedad", e);
  }
}

export async function borrarNovedad(pedido: { id: string; borradorEnVisto: string | null }): Promise<{ ok: true } | Fallo> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return SIN_SESION;
    if (!puede(sesion.user.rol, "editarNovedades")) return { ok: false, detalle: SIN_PERMISO };
    const valido = esquemaPedido.safeParse(pedido);
    if (!valido.success) return { ok: false, detalle: "El pedido no tiene la forma esperada." };
    const r = await borrarNovedadEnBase(base, valido.data);
    if (!r.ok) return r;
    if (r.estabaPublicada && r.slug) revalidarSitio([r.slug]);
    else refrescarAdmin();
    await registrarActividad({ tipo: "borro-una-novedad", quien: sesion.user.id, sobre: r.titulo, sobreId: valido.data.id });
    return { ok: true };
  } catch (e) {
    return fallo("borrarNovedad", e);
  }
}
