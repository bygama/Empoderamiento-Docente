import { draftMode } from "next/headers";
import { cache } from "react";
import type { Pagina } from "@/../prisma/generado/client";
import { PAGINAS, type ContenidoDe, type Slug } from "@/contenido/paginas";
import { base } from "@/datos/cliente";
import { comoDocumento, completarPagina } from "@/lib/contenido/documento";
import { leerSinRomper } from "./leer-sin-romper";

// Lo que lee el sitio (SPEC §5): el documento publicado, o el borrador si la
// visita viene en Draft Mode, completado con el contenido inicial de cada
// sección que falte o no pase. Sin fila, sin base, sin DATABASE_URL o si la
// consulta tira en tiempo de visita, el contenido inicial: el sitio sigue
// compilando sin base (importar `base` no lee el entorno desde A0; consultar
// sin URL sí tiraría) y una visita nunca se rompe por un hipo de la base.
// Durante `next build` es distinto: ver `leerSinRomper`.

/**
 * La fila de una página, o `null` si no hay base o no hay fila que mostrar.
 * `consultar` se puede inyectar para probar esta función sin una base real;
 * el default es la consulta de verdad contra Prisma.
 */
export async function filaDe(
  slug: Slug,
  consultar: (slug: Slug) => Promise<Pagina | null> = (s) => base.pagina.findUnique({ where: { slug: s } }),
): Promise<Pagina | null> {
  return leerSinRomper("contenidoDe", () => consultar(slug), null);
}

/**
 * El contenido completo de una página, SEO incluido. Con `cache` de React: la
 * metadata (`generateMetadata`) y la página lo piden en el mismo pedido, y así
 * la base se consulta una vez.
 */
export const contenidoDe = cache(async function contenidoDe<S extends Slug>(slug: S): Promise<ContenidoDe<S>> {
  const fila = await filaDe(slug);
  // Leer `isEnabled` no vuelve dinámica la página: en el prerender responde «apagado».
  const { isEnabled: enBorrador } = await draftMode();
  const documento = comoDocumento(enBorrador ? (fila?.borrador ?? fila?.publicado) : fila?.publicado);
  // completarPagina devuelve un Record; la forma precisa la garantiza el
  // esquema de cada sección, que es de donde sale ContenidoDe.
  return completarPagina(PAGINAS[slug], documento) as unknown as ContenidoDe<S>;
});
