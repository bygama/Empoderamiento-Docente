import type { Metadata } from "next";
import { novedadesDelSitio } from "@/datos/consultas/novedades";
import { seoInicial } from "@/features/novedades/contenido/seo";
import { NovedadesHero } from "@/features/novedades/components/NovedadesHero";
import { NovedadDestacada } from "@/features/novedades/components/NovedadDestacada";
import { FiltrosNovedades } from "@/features/novedades/components/FiltrosNovedades";
import { EdEnMovimiento } from "@/features/novedades/components/EdEnMovimiento";
import { LanzamientosRecientes } from "@/features/novedades/components/LanzamientosRecientes";
import { CierreNovedades } from "@/features/novedades/components/CierreNovedades";

export const metadata: Metadata = {
  title: "Novedades",
  description: seoInicial.descripcion,
  // El feed de las novedades, para quien las sigue con un lector.
  alternates: { types: { "application/rss+xml": [{ url: "/novedades/rss.xml", title: "Novedades · Empoderamiento Docente" }] } },
};

export default async function NovedadesPage() {
  // Las publicadas (o el borrador, en vista previa), de la más nueva a la más vieja; sin base, ninguna.
  const novedades = await novedadesDelSitio();
  return (
    <main id="contenido" tabIndex={-1}>
      <NovedadesHero fechaDeLaUltima={novedades[0]?.fecha ?? null} />
      <NovedadDestacada novedades={novedades} />
      <FiltrosNovedades novedades={novedades} />
      <EdEnMovimiento />
      <LanzamientosRecientes />
      <CierreNovedades />
    </main>
  );
}
