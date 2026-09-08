import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NOVEDADES } from "@/features/novedades/data";
import { FichaNovedad } from "@/features/novedades/components/FichaNovedad";

// Solo las novedades con cuerpo tienen ficha (piloto: el libro). El resto
// del catálogo se irá sumando cargando `cuerpo` en data.ts.
export function generateStaticParams() {
  return NOVEDADES.filter((n) => n.cuerpo).map((n) => ({ slug: n.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const n = NOVEDADES.find((x) => x.id === slug);
  if (!n) return {};
  return { title: n.titulo, description: n.bajada };
}

export default async function NovedadPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const n = NOVEDADES.find((x) => x.id === slug && x.cuerpo);
  if (!n) notFound();
  return (
    <main id="contenido" tabIndex={-1}>
      <FichaNovedad n={n} />
    </main>
  );
}
