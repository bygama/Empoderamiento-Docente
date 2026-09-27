import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { OPEN_GRAPH_COMUN } from "@/config/metadata";
import { materialDelSitioPorId } from "@/datos/consultas/materiales";
import { novedadPorSlug, slugsConFicha } from "@/datos/consultas/novedades";
import { redireccionDe } from "@/datos/consultas/redirecciones";
import { FichaNovedad } from "@/features/novedades/components/FichaNovedad";
import { TAMANO } from "@/features/novedades/imagen-para-redes/tamano";

// Solo las novedades con cuerpo tienen ficha. Las publicadas se prerenderizan;
// una que se publica después se arma en su primera visita (y publicar la
// revalida).
export async function generateStaticParams() {
  return (await slugsConFicha()).map((slug) => ({ slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const n = await novedadPorSlug((await params).slug);
  if (!n) return {};
  // La imagen para redes: la propia, si la cargaron, o la generada con el título.
  const imagen = n.imagenParaRedes
    ? { url: n.imagenParaRedes.src, alt: n.imagenParaRedes.alt }
    : { url: `/novedades/${n.slug}/imagen-para-redes`, ...TAMANO, alt: n.titulo };
  // Un `openGraph` de página reemplaza el del layout entero: lleva lo común.
  return { title: n.titulo, description: n.bajada, openGraph: { ...OPEN_GRAPH_COMUN, title: n.titulo, description: n.bajada, images: [imagen] } };
}

export default async function NovedadPage({ params }: Props) {
  const { slug } = await params;
  const n = await novedadPorSlug(slug);
  if (!n || n.cuerpo.length === 0) {
    // Un slug que cambió al publicar: el 308 del viejo al nuevo, antes del 404.
    const hacia = await redireccionDe(`/novedades/${slug}`);
    if (hacia) permanentRedirect(hacia);
    notFound();
  }
  // El material de la Biblioteca que abre al final, si el sitio lo muestra.
  const material = n.material ? await materialDelSitioPorId(n.material) : null;
  return (
    <main id="contenido" tabIndex={-1}>
      <FichaNovedad n={n} material={material} />
    </main>
  );
}
