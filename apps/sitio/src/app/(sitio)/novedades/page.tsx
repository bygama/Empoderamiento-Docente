import type { Metadata, ResolvingMetadata } from "next";
import { openGraphDeLaPagina } from "@/config/metadata";
import { novedadesDelSitio } from "@/datos/consultas/novedades";
import { contenidoDe } from "@/datos/consultas/paginas";
import { NovedadesHero } from "@/features/novedades/components/NovedadesHero";
import { NovedadDestacada } from "@/features/novedades/components/NovedadDestacada";
import { FiltrosNovedades } from "@/features/novedades/components/FiltrosNovedades";
import { EdEnMovimiento } from "@/features/novedades/components/EdEnMovimiento";
import { LanzamientosRecientes } from "@/features/novedades/components/LanzamientosRecientes";
import { CierreNovedades } from "@/features/novedades/components/CierreNovedades";
import { datosDelSitio } from "@/datos/consultas/sitio";
import { metadataDeSeo } from "@/lib/contenido/seo";

// El título, la descripción y la imagen para redes salen del SEO de la página
// (publicado, o el borrador en vista previa): se editan en su pestaña del
// admin. Y el feed, para quien sigue las novedades con un lector.
export async function generateMetadata(_: unknown, padre: ResolvingMetadata): Promise<Metadata> {
  const { seo } = await contenidoDe("novedades");
  return {
    ...metadataDeSeo(seo, await openGraphDeLaPagina(padre)),
    alternates: { types: { "application/rss+xml": [{ url: "/novedades/rss.xml", title: "Novedades · Empoderamiento Docente" }] } },
  };
}

export default async function NovedadesPage() {
  // Los textos de la página y las novedades publicadas (o los borradores, en
  // vista previa), de la más nueva a la más vieja; sin base, los textos de
  // hoy y ninguna novedad. Las redes del cierre, de Ajustes › Datos del sitio.
  const [{ hero, destacadas, ultimas, movimiento, lanzamientos, cierre }, novedades, { redes }] = await Promise.all([
    contenidoDe("novedades"),
    novedadesDelSitio(),
    datosDelSitio(),
  ]);
  return (
    <main id="contenido" tabIndex={-1}>
      <NovedadesHero contenido={hero} fechaDeLaUltima={novedades[0]?.fecha ?? null} />
      <NovedadDestacada contenido={destacadas} novedades={novedades} />
      <FiltrosNovedades contenido={ultimas} novedades={novedades} />
      <EdEnMovimiento contenido={movimiento} />
      <LanzamientosRecientes contenido={lanzamientos} />
      <CierreNovedades contenido={cierre} redes={redes} />
    </main>
  );
}
