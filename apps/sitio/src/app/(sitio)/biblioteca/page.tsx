import type { Metadata, ResolvingMetadata } from "next";
import { openGraphDeLaPagina } from "@/config/metadata";
import { contenidoDe } from "@/datos/consultas/paginas";
import { BibliotecaHero } from "@/features/biblioteca/components/BibliotecaHero";
import { DestacadosBiblioteca } from "@/features/biblioteca/components/DestacadosBiblioteca";
import { MaterialesListado } from "@/features/biblioteca/components/MaterialesListado";
import { PuenteInvestigacion } from "@/features/biblioteca/components/PuenteInvestigacion";
import { CierreBiblioteca } from "@/features/biblioteca/components/CierreBiblioteca";
import { metadataDeSeo } from "@/lib/contenido/seo";

// El título, la descripción y la imagen para redes salen del SEO de la página
// (publicado, o el borrador en vista previa): se editan en su pestaña del admin.
// Sin imagen propia, la del sitio, que se hereda del layout.
export async function generateMetadata(_: unknown, padre: ResolvingMetadata): Promise<Metadata> {
  const { seo } = await contenidoDe("biblioteca");
  return metadataDeSeo(seo, await openGraphDeLaPagina(padre));
}

export default async function BibliotecaPage() {
  // El contenido publicado (o el borrador, en vista previa); sin base, el inicial del código.
  const { hero, destacados, catalogo, puente, cierre } = await contenidoDe("biblioteca");
  return (
    <main id="contenido" tabIndex={-1}>
      <BibliotecaHero contenido={hero} />
      <DestacadosBiblioteca contenido={destacados} />
      <MaterialesListado contenido={catalogo} />
      <PuenteInvestigacion contenido={puente} />
      <CierreBiblioteca contenido={cierre} />
    </main>
  );
}
