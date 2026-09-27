import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { novedadPorSlug, redireccionDe, slugsConFicha } from "@/datos/consultas/novedades";
import { FichaNovedad } from "@/features/novedades/components/FichaNovedad";

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
  return { title: n.titulo, description: n.bajada };
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
  return (
    <main id="contenido" tabIndex={-1}>
      <FichaNovedad n={n} />
    </main>
  );
}
