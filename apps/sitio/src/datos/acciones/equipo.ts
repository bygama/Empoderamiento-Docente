"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { SIN_PERMISO, puede } from "@ed/auth";
import { registrarActividad } from "@/datos/actividad";
import { auth } from "@/datos/auth";
import { base } from "@/datos/cliente";
import type { Fallo } from "./choque";
import { borrarPersonaEnBase, crearPersonaEnBase, guardarPersonaEnBase, type ResultadoDeGuardar } from "./editar-equipo";
import { moverPersonaEnBase } from "./mover-equipo";
import { refrescarAdmin, revalidarSitio } from "./revalidar-equipo";

// Crear, guardar, borrar y mover un perfil del Equipo (SPEC §6 de
// `work/equipo/`); publicar, despublicar y descartar están en
// ciclo-de-equipo.ts, y la vista previa en vista-previa.ts. Toda acción
// empieza por la sesión y sigue con `editarContenido` (AGENTS.md §12), y
// contesta en llano si algo falla. Guardar un borrador no queda en la
// actividad ni revalida: no cambia el sitio, como en Novedades.

const SIN_SESION: Fallo = { ok: false, detalle: "Hay que entrar al admin." };
const MAL_PEDIDO: Fallo = { ok: false, detalle: "El pedido no tiene la forma esperada." };
const esquemaPedido = z.object({ id: z.uuid(), borradorEnVisto: z.string().nullable() });

function fallo(accion: string, e: unknown): Fallo {
  // Sin el mensaje del error: el de Prisma puede traer lo que se intentó guardar.
  console.error(`${accion}:`, e instanceof Error ? e.name : "error");
  return { ok: false, detalle: "No se pudo guardar; probá de nuevo en un rato." };
}

/** El primer guardado de un perfil nuevo: crea la fila y devuelve su id, para que la ficha pase a `/admin/contenido/equipo/[id]`. */
export async function crearPersona(pedido: { contenido: unknown }): Promise<ResultadoDeGuardar> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return SIN_SESION;
    if (!puede(sesion.user.rol, "editarContenido")) return { ok: false, detalle: SIN_PERMISO };
    return await crearPersonaEnBase(base, { contenido: pedido?.contenido, quien: sesion.user.name });
  } catch (e) {
    return fallo("crearPersona", e);
  }
}

export async function guardarPersona(pedido: { id: string; contenido: unknown; borradorEnVisto: string | null }): Promise<ResultadoDeGuardar> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return SIN_SESION;
    if (!puede(sesion.user.rol, "editarContenido")) return { ok: false, detalle: SIN_PERMISO };
    const valido = esquemaPedido.safeParse(pedido);
    if (!valido.success) return MAL_PEDIDO;
    return await guardarPersonaEnBase(base, { ...valido.data, contenido: pedido.contenido, quien: sesion.user.name });
  } catch (e) {
    return fallo("guardarPersona", e);
  }
}

export async function borrarPersona(pedido: { id: string; borradorEnVisto: string | null }): Promise<{ ok: true } | Fallo> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return SIN_SESION;
    if (!puede(sesion.user.rol, "editarContenido")) return { ok: false, detalle: SIN_PERMISO };
    const valido = esquemaPedido.safeParse(pedido);
    if (!valido.success) return MAL_PEDIDO;
    const r = await borrarPersonaEnBase(base, valido.data);
    if (!r.ok) return r;
    // Sus autorías quedaron de afuera: la Biblioteca también cambia en el admin.
    if (r.estabaPublicada) revalidarSitio();
    else refrescarAdmin();
    await registrarActividad({ tipo: "borro-un-perfil", quien: sesion.user.id, sobre: r.nombre, sobreId: valido.data.id });
    return { ok: true };
  } catch (e) {
    return fallo("borrarPersona", e);
  }
}

/** Sube o baja un lugar dentro de su nivel. Cambia el sitio en el momento y queda en la actividad (SPEC §10). */
export async function moverPersona(pedido: { id: string; hacia: "antes" | "despues" }): Promise<{ ok: true; movio: boolean } | Fallo> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return SIN_SESION;
    if (!puede(sesion.user.rol, "editarContenido")) return { ok: false, detalle: SIN_PERMISO };
    const valido = z.object({ id: z.uuid(), hacia: z.enum(["antes", "despues"]) }).safeParse(pedido);
    if (!valido.success) return MAL_PEDIDO;
    const r = await moverPersonaEnBase(base, valido.data);
    if (!r.ok) return r;
    if (r.movio) {
      revalidarSitio();
      await registrarActividad({ tipo: "movio-un-perfil", quien: sesion.user.id, sobre: r.nombre, sobreId: valido.data.id });
    }
    return { ok: true, movio: r.movio };
  } catch (e) {
    return fallo("moverPersona", e);
  }
}
