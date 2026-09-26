import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EditorDeSeo } from "@/admin/paginas/EditorDeSeo";
import { pestanasDeLaPagina } from "@/admin/paginas/pestanas";
import { esSlug, PAGINAS } from "@/contenido/paginas";
import { paginaParaEditar, partesEditables } from "@/datos/consultas/editor-de-paginas";

// La imagen para redes se sube desde acá: mismo motivo que en la pestaña de
// las secciones (el maxDuration de la acción es el de la página).
export const maxDuration = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return esSlug(slug) ? { title: `SEO · ${PAGINAS[slug].nombre} · Páginas` } : {};
}

/** La pestaña «SEO» del editor: el título, la descripción y la imagen para redes, con cómo se ven. */
export default async function SeoDeLaPagina({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!esSlug(slug) || !partesEditables(slug).seo) notFound();
  const pagina = await paginaParaEditar(slug, "seo");
  return <EditorDeSeo key={pagina.slug} pagina={pagina} pestanas={pestanasDeLaPagina(slug, partesEditables(slug))} />;
}
