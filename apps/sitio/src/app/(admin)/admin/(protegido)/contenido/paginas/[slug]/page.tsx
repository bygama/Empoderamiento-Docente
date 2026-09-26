import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { EditorDePagina } from "@/admin/paginas/EditorDePagina";
import { EDITOR_DE_PAGINAS, pestanasDeLaPagina } from "@/admin/paginas/pestanas";
import { esSlug, PAGINAS } from "@/contenido/paginas";
import { paginaParaEditar, partesEditables } from "@/datos/consultas/editor-de-paginas";

// Las Server Actions de este árbol (subirFoto, en CampoFoto) toman el
// maxDuration de la página que las invoca, no el de su propio archivo: 4 MB
// de cuerpo + sharp + el put a Blob pueden superar el default de la función
// (docs Next, route-segment-config/maxDuration). Mismo valor que el cron.
export const maxDuration = 60;

// «Inicio · Páginas»: tres páginas del sitio se llaman como un módulo del
// admin (Inicio, Biblioteca, Novedades), y solas serían ambiguas.
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return esSlug(slug) ? { title: `${PAGINAS[slug].nombre} · Páginas` } : {};
}

/** La pestaña «Secciones» del editor: los textos y las fotos de la página. */
export default async function EditarPagina({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // Un slug que no está en el registro no tiene editor; una página con solo SEO abre en esa pestaña.
  if (!esSlug(slug)) notFound();
  const tiene = partesEditables(slug);
  if (!tiene.secciones) {
    if (tiene.seo) redirect(`${EDITOR_DE_PAGINAS}/${slug}/seo`);
    notFound();
  }
  const pagina = await paginaParaEditar(slug, "secciones");
  return (
    // La key remonta el editor entero al navegar de una página a otra: sin
    // ella, el estado local (lo escrito, lo sucio) sobreviviría al slug viejo.
    // El `h1` es el del encabezado del editor.
    <EditorDePagina key={pagina.slug} pagina={pagina} pestanas={pestanasDeLaPagina(slug, tiene)} />
  );
}
