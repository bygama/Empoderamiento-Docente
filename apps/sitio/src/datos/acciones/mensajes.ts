"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { SIN_PERMISO, puede } from "@ed/auth";
import { capacidadDe, esBandeja } from "@/config/mensajes";
import { auth } from "@/datos/auth";
import { almacenDeCV } from "@/datos/formularios/cv";
import { borrarMensajeEnBase, moverMensaje, type Resultado } from "./mover-mensajes";

// Las acciones de la ficha de un mensaje (work/mensajes/SPEC.md §6): tomarlo,
// cerrarlo, marcarlo como spam o borrarlo. Cada una empieza por la sesión y
// sigue con la capacidad de su bandeja, que llega de la pantalla; lo que
// hacen en la base está en mover-mensajes.ts. Después se redibuja el admin:
// el número de la sidebar y de las pestañas cambia.

const SIN_SESION: Resultado = { ok: false, detalle: "Hay que entrar al admin." };

function fallo(accion: string, e: unknown): Resultado {
  // Sin el mensaje del error: el de Prisma puede traer lo que se intentó guardar.
  console.error(`${accion}:`, e instanceof Error ? e.name : "error");
  return { ok: false, detalle: "No se pudo guardar; probá de nuevo en un rato." };
}

function listo(r: Resultado): Resultado {
  if (r.ok) revalidatePath("/admin", "layout");
  return r;
}

/** «Lo tomo yo»: pasa a En curso, tomado por quien lo tocó. Desde Cerrado lo reabre; desde Spam, no era spam. */
export async function tomarMensaje(bandeja: string, id: string): Promise<Resultado> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return SIN_SESION;
    if (!esBandeja(bandeja) || !puede(sesion.user.rol, capacidadDe(bandeja))) return { ok: false, detalle: SIN_PERMISO };
    return listo(await moverMensaje(sesion.user.id, { bandeja, id }, "tomar"));
  } catch (e) {
    return fallo("tomarMensaje", e);
  }
}

export async function cerrarMensaje(bandeja: string, id: string): Promise<Resultado> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return SIN_SESION;
    if (!esBandeja(bandeja) || !puede(sesion.user.rol, capacidadDe(bandeja))) return { ok: false, detalle: SIN_PERMISO };
    return listo(await moverMensaje(sesion.user.id, { bandeja, id }, "cerrar"));
  } catch (e) {
    return fallo("cerrarMensaje", e);
  }
}

export async function marcarComoSpam(bandeja: string, id: string): Promise<Resultado> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return SIN_SESION;
    if (!esBandeja(bandeja) || !puede(sesion.user.rol, capacidadDe(bandeja))) return { ok: false, detalle: SIN_PERMISO };
    return listo(await moverMensaje(sesion.user.id, { bandeja, id }, "spam"));
  } catch (e) {
    return fallo("marcarComoSpam", e);
  }
}

/** «Borrar ahora», con su archivo si es un CV. */
export async function borrarMensaje(bandeja: string, id: string): Promise<Resultado> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return SIN_SESION;
    if (!esBandeja(bandeja) || !puede(sesion.user.rol, capacidadDe(bandeja))) return { ok: false, detalle: SIN_PERMISO };
    return listo(await borrarMensajeEnBase(sesion.user.id, { bandeja, id }, () => almacenDeCV()));
  } catch (e) {
    return fallo("borrarMensaje", e);
  }
}
