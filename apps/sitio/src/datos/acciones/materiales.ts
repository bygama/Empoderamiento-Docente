"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { SIN_PERMISO, puede } from "@ed/auth";
import { registrarActividad } from "@/datos/actividad";
import { auth } from "@/datos/auth";
import { base } from "@/datos/cliente";
import type { Fallo } from "./choque";
import { borrarMaterialEnBase, crearMaterialEnBase, guardarMaterialEnBase, type ResultadoDeGuardar } from "./editar-materiales";
import { refrescarAdmin, revalidarSitio } from "./revalidar-materiales";

// Crear, guardar y borrar un material desde su ficha (SPEC §7 de
// `work/biblioteca/`); publicar, ocultar y descartar están en
// ciclo-de-materiales.ts, buscar los datos de afuera en buscar-datos.ts y la
// vista previa en vista-previa.ts. Toda acción empieza por la sesión y sigue
// con `editarBiblioteca` (AGENTS.md §12), y contesta en llano si algo falla.
// Agregar y borrar quedan en la actividad; guardar un borrador, no (no cambia
// el sitio). Guardar tampoco revalida: las pantallas del admin se piden de
// nuevo al navegar.

const SIN_SESION = { ok: false as const, detalle: "Hay que entrar al admin." };
const esquemaPedido = z.object({ id: z.uuid(), borradorEnVisto: z.string().nullable() });

function fallo(accion: string, e: unknown): Fallo {
  // Sin el mensaje del error: el de Prisma puede traer lo que se intentó guardar.
  console.error(`${accion}:`, e instanceof Error ? e.name : "error");
  return { ok: false, detalle: "No se pudo guardar; probá de nuevo en un rato." };
}

/** El primer guardado de un material nuevo: crea la fila y devuelve su id, para que la ficha pase a `/admin/biblioteca/[id]`. */
export async function crearMaterial(pedido: { contenido: unknown }): Promise<ResultadoDeGuardar> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return SIN_SESION;
    if (!puede(sesion.user.rol, "editarBiblioteca")) return { ok: false, detalle: SIN_PERMISO };
    const r = await crearMaterialEnBase(base, { contenido: pedido?.contenido, quien: sesion.user.name });
    if (!r.ok) return r;
    refrescarAdmin();
    await registrarActividad({ tipo: "agrego-un-material", quien: sesion.user.id, sobre: r.titulo, sobreId: r.id });
    return r;
  } catch (e) {
    return fallo("crearMaterial", e);
  }
}

export async function guardarMaterial(pedido: { id: string; contenido: unknown; borradorEnVisto: string | null }): Promise<ResultadoDeGuardar> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return SIN_SESION;
    if (!puede(sesion.user.rol, "editarBiblioteca")) return { ok: false, detalle: SIN_PERMISO };
    const valido = esquemaPedido.safeParse(pedido);
    if (!valido.success) return { ok: false, detalle: "El pedido no tiene la forma esperada." };
    return await guardarMaterialEnBase(base, { ...valido.data, contenido: pedido.contenido, quien: sesion.user.name });
  } catch (e) {
    return fallo("guardarMaterial", e);
  }
}

export async function borrarMaterial(pedido: { id: string; borradorEnVisto: string | null }): Promise<{ ok: true } | Fallo> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return SIN_SESION;
    if (!puede(sesion.user.rol, "editarBiblioteca")) return { ok: false, detalle: SIN_PERMISO };
    const valido = esquemaPedido.safeParse(pedido);
    if (!valido.success) return { ok: false, detalle: "El pedido no tiene la forma esperada." };
    const r = await borrarMaterialEnBase(base, valido.data);
    if (!r.ok) return r;
    if (r.estabaPublicado || r.novedades.length) revalidarSitio(valido.data.id, r.novedades);
    else refrescarAdmin();
    await registrarActividad({ tipo: "borro-un-material", quien: sesion.user.id, sobre: r.titulo, sobreId: valido.data.id });
    return { ok: true };
  } catch (e) {
    return fallo("borrarMaterial", e);
  }
}
