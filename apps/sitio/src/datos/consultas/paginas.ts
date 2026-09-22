import { draftMode } from "next/headers";
import type { Pagina } from "@/../prisma/generado/client";
import { PAGINAS, type ContenidoDe, type Slug } from "@/contenido/paginas";
import { base } from "@/datos/cliente";
import { comoDocumento, completarPagina } from "@/lib/contenido/documento";

// Lo que lee el sitio (SPEC §5): el documento publicado, o el borrador si la
// visita viene en Draft Mode, completado con el contenido inicial de cada
// sección que falte o no pase. Sin fila, sin base, sin DATABASE_URL o si la
// consulta tira en tiempo de visita, el contenido inicial: el sitio sigue
// compilando sin base (importar `base` no lee el entorno desde A0; consultar
// sin URL sí tiraría, por eso el primer `if`) y una visita nunca se rompe por
// un hipo de la base. Durante `next build` es distinto: ver `filaDe`.

/**
 * La fila de una página, o `null` si no hay base o no hay fila que mostrar.
 * `consultar` se puede inyectar para probar esta función sin una base real;
 * el default es la consulta de verdad contra Prisma.
 */
export async function filaDe(
  slug: Slug,
  consultar: (slug: Slug) => Promise<Pagina | null> = (s) => base.pagina.findUnique({ where: { slug: s } }),
): Promise<Pagina | null> {
  if (!process.env.DATABASE_URL) return null;
  try {
    return await consultar(slug);
  } catch (e) {
    // Con base configurada, un hipo durante `next build` no puede quedar en
    // silencio: `/` es estática y sin intervalo de revalidación, así que lo
    // que la consulta no trajo se hornearía en el HTML con el contenido
    // inicial y ahí se quedaría hasta el próximo publicar o el próximo
    // deploy (I-1 de la revisión). Mejor que el build falle y se vea.
    if (process.env.NEXT_PHASE === "phase-production-build") throw e;
    // En runtime (una visita real) sí conviene absorberlo: un hipo de Neon a
    // mitad de un deploy no puede voltear la visita (SPEC §5).
    console.error("contenidoDe:", e);
    return null;
  }
}

export async function contenidoDe<S extends Slug>(slug: S): Promise<ContenidoDe<S>> {
  const fila = await filaDe(slug);
  // Leer `isEnabled` no vuelve dinámica la página: en el prerender responde «apagado».
  const { isEnabled: enBorrador } = await draftMode();
  const documento = comoDocumento(enBorrador ? (fila?.borrador ?? fila?.publicado) : fila?.publicado);
  // completarPagina devuelve un Record; la forma precisa la garantiza el
  // esquema de cada sección, que es de donde sale ContenidoDe.
  return completarPagina(PAGINAS[slug], documento) as unknown as ContenidoDe<S>;
}
