"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { SIN_PERMISO, puede } from "@ed/auth";
import { PAGINAS, SLUGS } from "@/contenido/paginas";
import { auth } from "@/datos/auth";
import { base } from "@/datos/cliente";
import { publicadoDe } from "@/datos/consultas/novedades";
import { encenderVistaPrevia } from "@/datos/vista-previa";
import { esquemaCaso } from "@/features/investigacion/contenido/caso";
import { IDS_DE_CASOS } from "@/features/investigacion/contenido/modelo-de-casos";
import { comoDocumento } from "@/lib/contenido/documento";

// La vista previa (SPEC §6) es el Draft Mode de Next: con la cookie puesta,
// el sitio saltea lo prerenderizado y `contenidoDe()` devuelve el borrador.
// La cookie solo la pone esta acción (o la de una novedad), y solo con
// sesión: cómo se enciende está en datos/vista-previa.ts. Salir vive en
// salir-de-vista-previa.ts: lo importa el layout del sitio y no puede
// arrastrar `datos/auth` (que arma el cliente de Prisma al cargarse).

const esquemaSlug = z.enum(SLUGS);

/** Habilita el Draft Mode para quien edita y devuelve adónde ir; el botón abre esa URL en otra pestaña. */
export async function abrirVistaPrevia(slug: string): Promise<{ ok: true; url: string } | { ok: false; detalle: string }> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return { ok: false, detalle: "Hay que entrar al admin para ver la vista previa." };
    if (!puede(sesion.user.rol, "editarContenido")) return { ok: false, detalle: SIN_PERMISO };
    const valido = esquemaSlug.safeParse(slug);
    if (!valido.success) return { ok: false, detalle: "Esa página no existe." };
    await encenderVistaPrevia();
    return { ok: true, url: PAGINAS[valido.data].ruta };
  } catch (e) {
    console.error("abrirVistaPrevia:", e);
    return { ok: false, detalle: "No se pudo abrir la vista previa; probá de nuevo en un rato." };
  }
}

/**
 * Enciende la vista previa de un caso y dice adónde ir: `/investigacion` con
 * su expediente abierto (`#slug`), como quedaría al publicarlo. Si el
 * borrador todavía no se puede publicar, el sitio muestra lo publicado, y el
 * ancla es la de lo publicado. Muestra lo guardado: la ficha guarda antes.
 */
export async function abrirVistaPreviaDeCaso(id: string): Promise<{ ok: true; url: string } | { ok: false; detalle: string }> {
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

/**
 * Enciende la vista previa y dice adónde ir: la ficha de la novedad como
 * quedaría al publicarla, o el listado si no tiene cuerpo o URL todavía.
 * Muestra lo guardado: la ficha guarda antes de llamar.
 */
export async function abrirVistaPreviaDeNovedad(id: string): Promise<{ ok: true; url: string } | { ok: false; detalle: string }> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return { ok: false, detalle: "Hay que entrar al admin para ver la vista previa." };
    if (!puede(sesion.user.rol, "editarNovedades")) return { ok: false, detalle: SIN_PERMISO };
    const valido = z.uuid().safeParse(id);
    const fila = valido.success ? await base.novedad.findUnique({ where: { id: valido.data } }) : null;
    if (!fila) return { ok: false, detalle: "Esa novedad no existe." };
    const documento = comoDocumento(fila.borrador ?? publicadoDe(fila));
    const conFicha = typeof documento.slug === "string" && documento.slug !== "" && Array.isArray(documento.cuerpo) && documento.cuerpo.length > 0;
    await encenderVistaPrevia();
    return { ok: true, url: conFicha ? `/novedades/${documento.slug}` : "/novedades#ultimas" };
  } catch (e) {
    console.error("abrirVistaPreviaDeNovedad:", e);
    return { ok: false, detalle: "No se pudo abrir la vista previa; probá de nuevo en un rato." };
  }
}

/**
 * Enciende la vista previa y lleva al catálogo de la Biblioteca, donde cada
 * material se ve como quedaría al publicarlo (work/biblioteca/). Muestra lo
 * guardado: la ficha guarda antes de llamar.
 */
export async function abrirVistaPreviaDeMaterial(id: string): Promise<{ ok: true; url: string } | { ok: false; detalle: string }> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return { ok: false, detalle: "Hay que entrar al admin para ver la vista previa." };
    if (!puede(sesion.user.rol, "editarBiblioteca")) return { ok: false, detalle: SIN_PERMISO };
    const valido = z.uuid().safeParse(id);
    const fila = valido.success ? await base.material.findUnique({ where: { id: valido.data }, select: { id: true } }) : null;
    if (!fila) return { ok: false, detalle: "Ese material no existe." };
    await encenderVistaPrevia();
    return { ok: true, url: "/biblioteca#materiales" };
  } catch (e) {
    console.error("abrirVistaPreviaDeMaterial:", e);
    return { ok: false, detalle: "No se pudo abrir la vista previa; probá de nuevo en un rato." };
  }
}
