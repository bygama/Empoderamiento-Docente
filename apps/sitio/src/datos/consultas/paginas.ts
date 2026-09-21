import { draftMode } from "next/headers";
import type { Pagina } from "@/../prisma/generado/client";
import { PAGINAS, type ContenidoDe, type Slug } from "@/contenido/paginas";
import { base } from "@/datos/cliente";
import { comoDocumento, completarPagina } from "@/lib/contenido/documento";

// Lo que lee el sitio (SPEC §5): el documento publicado, o el borrador si la
// visita viene en Draft Mode, completado con el contenido inicial de cada
// sección que falte o no pase. Sin fila, sin base, sin DATABASE_URL o si la
// consulta tira, el contenido inicial: el sitio sigue compilando sin base
// (importar `base` no lee el entorno desde A0; consultar sin URL sí tiraría,
// por eso el primer `if`) y una visita nunca se rompe por un hipo de la base.

async function filaDe(slug: Slug): Promise<Pagina | null> {
  if (!process.env.DATABASE_URL) return null;
  try {
    return await base.pagina.findUnique({ where: { slug } });
  } catch (e) {
    // Un hipo de Neon a mitad de un deploy no puede voltear la primera
    // visita: mejor el contenido inicial que un error (SPEC §5).
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
