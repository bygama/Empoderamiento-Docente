import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PantallaDeVersiones } from "@/admin/paginas/PantallaDeVersiones";
import { EDITOR_DE_PAGINAS, pestanasDeLaPagina } from "@/admin/paginas/pestanas";
import { esSlug, PAGINAS } from "@/contenido/paginas";
import { partesEditables } from "@/datos/consultas/editor-de-paginas";
import { versionesDe } from "@/datos/consultas/historial-de-paginas";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return esSlug(slug) ? { title: `Versiones · ${PAGINAS[slug].nombre} · Páginas` } : {};
}

/** La pestaña «Versiones»: las últimas 10 publicaciones, con «Restaurar como borrador». */
export default async function VersionesDeLaPagina({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!esSlug(slug)) notFound();
  const tiene = partesEditables(slug);
  if (!tiene.secciones && !tiene.seo) notFound();
  const { pagina, versiones } = await versionesDe(slug);
  return <PantallaDeVersiones pagina={pagina} pestanas={pestanasDeLaPagina(slug, tiene)} versiones={versiones} cambios={`${EDITOR_DE_PAGINAS}/${slug}/cambios`} />;
}
