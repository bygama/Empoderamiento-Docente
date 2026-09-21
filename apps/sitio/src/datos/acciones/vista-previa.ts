"use server";

import { draftMode, headers } from "next/headers";
import { z } from "zod";
import { PAGINAS, SLUGS } from "@/contenido/paginas";
import { auth } from "@/datos/auth";

// La vista previa (SPEC §6) es el Draft Mode de Next: con la cookie puesta,
// el sitio saltea lo prerenderizado y `contenidoDe()` devuelve el borrador.
// La cookie solo la pone esta acción, y solo con sesión. Salir vive en
// salir-de-vista-previa.ts: lo importa el layout del sitio y no puede
// arrastrar `datos/auth` (que arma el cliente de Prisma al cargarse).

const esquemaSlug = z.enum(SLUGS);

/** Habilita el Draft Mode para quien edita y devuelve adónde ir; el botón abre esa URL en otra pestaña. */
export async function abrirVistaPrevia(slug: string): Promise<{ ok: true; url: string } | { ok: false; detalle: string }> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return { ok: false, detalle: "Hay que entrar al admin para ver la vista previa." };
    const valido = esquemaSlug.safeParse(slug);
    if (!valido.success) return { ok: false, detalle: "Esa página no existe." };
    (await draftMode()).enable();
    return { ok: true, url: PAGINAS[valido.data].ruta };
  } catch (e) {
    console.error("abrirVistaPrevia:", e);
    return { ok: false, detalle: "No se pudo abrir la vista previa; probá de nuevo en un rato." };
  }
}
