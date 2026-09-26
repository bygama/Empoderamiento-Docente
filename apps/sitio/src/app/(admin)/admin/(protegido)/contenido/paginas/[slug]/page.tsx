import { notFound } from "next/navigation";
import { EditorDePagina } from "@/admin/paginas/EditorDePagina";
import { esSlug, PAGINAS } from "@/contenido/paginas";
import { paginaParaEditar } from "@/datos/consultas/editor-de-paginas";

// Las Server Actions de este árbol (subirFoto, en CampoFoto) toman el
// maxDuration de la página que las invoca, no el de su propio archivo: 4 MB
// de cuerpo + sharp + el put a Blob pueden superar el default de la función
// (docs Next, route-segment-config/maxDuration). Mismo valor que el cron.
export const maxDuration = 60;

export default async function EditarPagina({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // Un slug que no está en el registro, o una página sin secciones todavía, no tiene editor.
  if (!esSlug(slug) || Object.keys(PAGINAS[slug].secciones).length === 0) notFound();
  const pagina = await paginaParaEditar(slug);
  return (
    // La key remonta el editor entero al navegar de una página a otra: sin
    // ella, el estado local (lo escrito, lo sucio) sobreviviría al slug viejo.
    // El `h1` es el del encabezado del editor.
    <EditorDePagina key={pagina.slug} pagina={pagina} />
  );
}
