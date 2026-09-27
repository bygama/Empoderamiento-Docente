"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { SIN_PERMISO, puede } from "@ed/auth";
import { auth } from "@/datos/auth";
import { base } from "@/datos/cliente";
import { encenderVistaPrevia } from "@/datos/vista-previa";
import { esquemaCaso } from "@/features/investigacion/contenido/caso";
import { IDS_DE_CASOS } from "@/features/investigacion/contenido/modelo-de-casos";

// La vista previa de un caso y de un aliado (SPEC §6 de
// `work/casos-aliados-fotos/`): el Draft Mode de las páginas y las novedades
// (vista-previa.ts), que solo se enciende con sesión y `editarContenido`.
// Muestra lo guardado: la ficha guarda antes de llamar.

type Resultado = { ok: true; url: string } | { ok: false; detalle: string };

/**
 * `/investigacion` con el expediente del caso abierto (`#slug`), como quedaría
 * al publicarlo. Si el borrador todavía no se puede publicar, el sitio
 * muestra lo publicado, y el ancla es la de lo publicado.
 */
export async function abrirVistaPreviaDeCaso(id: string): Promise<Resultado> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return { ok: false, detalle: "Hay que entrar al admin para ver la vista previa." };
    if (!puede(sesion.user.rol, "editarContenido")) return { ok: false, detalle: SIN_PERMISO };
    const valido = z.enum(IDS_DE_CASOS).safeParse(id);
    const fila = valido.success ? await base.caso.findUnique({ where: { id: valido.data } }) : null;
    if (!fila) return { ok: false, detalle: "Ese caso no existe." };
    const borrador = fila.borrador === null ? null : esquemaCaso.safeParse(fila.borrador);
    await encenderVistaPrevia();
    return { ok: true, url: `/investigacion#${borrador?.success ? borrador.data.slug : fila.slug}` };
  } catch (e) {
    console.error("abrirVistaPreviaDeCaso:", e);
    return { ok: false, detalle: "No se pudo abrir la vista previa; probá de nuevo en un rato." };
  }
}

/** El Inicio, con la tira como quedaría al publicar el aliado. Sin la autorización, ni en la vista previa. */
export async function abrirVistaPreviaDeAliado(id: string): Promise<Resultado> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return { ok: false, detalle: "Hay que entrar al admin para ver la vista previa." };
    if (!puede(sesion.user.rol, "editarContenido")) return { ok: false, detalle: SIN_PERMISO };
    const valido = z.uuid().safeParse(id);
    const fila = valido.success ? await base.aliado.findUnique({ where: { id: valido.data }, select: { autorizado: true } }) : null;
    if (!fila) return { ok: false, detalle: "Ese aliado no existe." };
    if (!fila.autorizado) return { ok: false, detalle: "Sin la autorización, el logo no se ve ni en la vista previa." };
    await encenderVistaPrevia();
    return { ok: true, url: "/" };
  } catch (e) {
    console.error("abrirVistaPreviaDeAliado:", e);
    return { ok: false, detalle: "No se pudo abrir la vista previa; probá de nuevo en un rato." };
  }
}
