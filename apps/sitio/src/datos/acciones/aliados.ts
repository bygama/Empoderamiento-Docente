"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { SIN_PERMISO, puede } from "@ed/auth";
import { registrarActividad } from "@/datos/actividad";
import { auth } from "@/datos/auth";
import { base } from "@/datos/cliente";
import { moverAliadoEnBase } from "./autorizar-aliados";
import type { Fallo } from "./choque";
import { borrarAliadoEnBase, crearAliadoEnBase, guardarAliadoEnBase, type ResultadoDeGuardarAliado } from "./editar-aliados";
import { revalidarTira } from "./revalidar-aliados";

// Crear, guardar, borrar y mover un aliado (SPEC §6 de
// `work/casos-aliados-fotos/`); publicar, despublicar, descartar y la marca
// están en ciclo-de-aliados.ts, y la vista previa en vista-previa.ts. Toda
// acción empieza por la sesión y sigue con `editarContenido` (AGENTS.md §12).
// Guardar no queda en la actividad ni revalida: no cambia el sitio.

const SIN_SESION: Fallo = { ok: false, detalle: "Hay que entrar al admin." };
const MAL_PEDIDO: Fallo = { ok: false, detalle: "El pedido no tiene la forma esperada." };
const esquemaPedido = z.object({ id: z.uuid(), borradorEnVisto: z.string().nullable() });

function fallo(accion: string, e: unknown): Fallo {
  // Sin el mensaje del error: el de Prisma puede traer lo que se intentó guardar.
  console.error(`${accion}:`, e instanceof Error ? e.name : "error");
  return { ok: false, detalle: "No se pudo hacer; probá de nuevo en un rato." };
}

/** El primer guardado de un aliado nuevo: crea la fila y devuelve su id. */
export async function crearAliado(pedido: { contenido: unknown }): Promise<ResultadoDeGuardarAliado> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return SIN_SESION;
    if (!puede(sesion.user.rol, "editarContenido")) return { ok: false, detalle: SIN_PERMISO };
    return await crearAliadoEnBase(base, { contenido: pedido?.contenido, quien: sesion.user.name });
  } catch (e) {
    return fallo("crearAliado", e);
  }
}

export async function guardarAliado(pedido: { id: string; contenido: unknown; borradorEnVisto: string | null }): Promise<ResultadoDeGuardarAliado> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return SIN_SESION;
    if (!puede(sesion.user.rol, "editarContenido")) return { ok: false, detalle: SIN_PERMISO };
    const valido = esquemaPedido.safeParse(pedido);
    if (!valido.success) return MAL_PEDIDO;
    return await guardarAliadoEnBase(base, { ...valido.data, contenido: pedido.contenido, quien: sesion.user.name });
  } catch (e) {
    return fallo("guardarAliado", e);
  }
}

export async function borrarAliado(pedido: { id: string; borradorEnVisto: string | null }): Promise<{ ok: true } | Fallo> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return SIN_SESION;
    if (!puede(sesion.user.rol, "editarContenido")) return { ok: false, detalle: SIN_PERMISO };
    const valido = esquemaPedido.safeParse(pedido);
    if (!valido.success) return MAL_PEDIDO;
    const r = await borrarAliadoEnBase(base, valido.data);
    if (!r.ok) return r;
    revalidarTira();
    await registrarActividad({ tipo: "borro-un-aliado", quien: sesion.user.id, sobre: r.nombre, sobreId: valido.data.id });
    return { ok: true };
  } catch (e) {
    return fallo("borrarAliado", e);
  }
}

/** Sube o baja un lugar en la tira. Cambia el sitio en el momento, pero no queda en la actividad (SPEC §9). */
export async function moverAliado(pedido: { id: string; hacia: "antes" | "despues" }): Promise<{ ok: true; movio: boolean } | Fallo> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return SIN_SESION;
    if (!puede(sesion.user.rol, "editarContenido")) return { ok: false, detalle: SIN_PERMISO };
    const valido = z.object({ id: z.uuid(), hacia: z.enum(["antes", "despues"]) }).safeParse(pedido);
    if (!valido.success) return MAL_PEDIDO;
    const r = await moverAliadoEnBase(base, valido.data);
    if (r.ok && r.movio) revalidarTira();
    return r;
  } catch (e) {
    return fallo("moverAliado", e);
  }
}
