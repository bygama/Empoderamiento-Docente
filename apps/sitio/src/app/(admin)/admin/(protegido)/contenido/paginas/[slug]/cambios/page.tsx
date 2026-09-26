import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListaDeCambios } from "@/admin/paginas/ListaDeCambios";
import { PantallaDeRevision } from "@/admin/paginas/PantallaDeRevision";
import { pestanasDeLaPagina } from "@/admin/paginas/pestanas";
import { esSlug, PAGINAS } from "@/contenido/paginas";
import { partesEditables } from "@/datos/consultas/editor-de-paginas";
import { cambiosDe } from "@/datos/consultas/historial-de-paginas";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return esSlug(slug) ? { title: `Qué cambió · ${PAGINAS[slug].nombre} · Páginas` } : {};
}

/** La pestaña «Qué cambió»: el borrador guardado contra lo publicado, antes de publicar. */
export default async function CambiosDeLaPagina({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!esSlug(slug)) notFound();
  const tiene = partesEditables(slug);
  if (!tiene.secciones && !tiene.seo) notFound();
  const { pagina, cambios } = await cambiosDe(slug);
  return (
    <PantallaDeRevision pagina={pagina} pestanas={pestanasDeLaPagina(slug, tiene)} conAcciones>
      <ListaDeCambios cambios={cambios} hayBorrador={pagina.estado.borradorEn !== null} />
    </PantallaDeRevision>
  );
}
