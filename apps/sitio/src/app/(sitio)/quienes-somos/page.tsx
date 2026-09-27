import type { Metadata, ResolvingMetadata } from "next";
import { openGraphDeLaPagina } from "@/config/metadata";
import { contenidoDe } from "@/datos/consultas/paginas";
import { QuienesSomosHero } from "@/features/quienes-somos/components/QuienesSomosHero";
import { OrigenEd } from "@/features/quienes-somos/components/OrigenEd";
import { MiradaEd } from "@/features/quienes-somos/components/MiradaEd";
import { ImpulsanEd } from "@/features/quienes-somos/components/ImpulsanEd";
import { metadataDeSeo } from "@/lib/contenido/seo";

// El título, la descripción y la imagen para redes salen del SEO de la página
// (publicado, o el borrador en vista previa): se editan en su pestaña del admin.
// Sin imagen propia, la del sitio, que se hereda del layout.
export async function generateMetadata(_: unknown, padre: ResolvingMetadata): Promise<Metadata> {
  const { seo } = await contenidoDe("quienes-somos");
  return metadataDeSeo(seo, await openGraphDeLaPagina(padre));
}

export default async function QuienesSomosPage() {
  // El contenido publicado (o el borrador, en vista previa); sin base, el inicial del código.
  const { hero, origen, mirada, equipo } = await contenidoDe("quienes-somos");
  return (
    <main id="contenido" tabIndex={-1}>
      <QuienesSomosHero contenido={hero} />
      <OrigenEd contenido={origen} />
      <MiradaEd contenido={mirada} />
      {/* «Nuestro enfoque» (TRANSFORMACIÓN armándose + diferenciales) estuvo
          acá entre la mirada y el equipo (2026-09-08) y se sacó al día
          siguiente por decisión de Gastón. Su copy quedó guardado en
          docs/content/copy-que-hacemos.md; el código se borró el 2026-09-18. */}
      <ImpulsanEd contenido={equipo} />
      {/* Acá estuvieron RedEd (el grafo de la red) y DistintoEd (la comparativa
          con una capacitación genérica): Gastón los sacó el 2026-07-22 porque
          la página quedaba muy larga, y su código se borró el 2026-09-18. */}
      {/* Próximas secciones (sitemap): Trayectoria y alianzas · Cierre. */}
    </main>
  );
}
