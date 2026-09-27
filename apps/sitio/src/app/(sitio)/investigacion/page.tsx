import type { Metadata, ResolvingMetadata } from "next";
import { openGraphDeLaPagina } from "@/config/metadata";
import { casosDelSitio } from "@/datos/consultas/casos";
import { contenidoDe } from "@/datos/consultas/paginas";
import { InvestigacionHero } from "@/features/investigacion/components/InvestigacionHero";
import { LineasInvestigacion } from "@/features/investigacion/components/LineasInvestigacion";
import { EspiralInvestigacion } from "@/features/investigacion/components/EspiralInvestigacion";
import { InvestigacionEnAccion } from "@/features/investigacion/components/InvestigacionEnAccion";
import { CierreInvestigacion } from "@/features/investigacion/components/CierreInvestigacion";
import { metadataDeSeo } from "@/lib/contenido/seo";

// El título, la descripción y la imagen para redes salen del SEO de la página
// (publicado, o el borrador en vista previa): se editan en su pestaña del admin.
// Sin imagen propia, la del sitio, que se hereda del layout.
export async function generateMetadata(_: unknown, padre: ResolvingMetadata): Promise<Metadata> {
  const { seo } = await contenidoDe("investigacion");
  return metadataDeSeo(seo, await openGraphDeLaPagina(padre));
}

/**
 * Página «Investigación» — estructura base según
 * docs/content/arquitectura-investigacion.md (fase de contenido; el diseño
 * de cada sección se maqueta en una fase posterior).
 *
 * «Proyectos y aplicaciones» (traída de Qué hacemos el 2026-09-02) se
 * quitó de la página el 2026-09-04: eran áreas del modelo conceptual sin
 * proyectos reales, y su lugar lo ocupa el recorrido de casos.
 *
 * «Ciclo de investigación aplicada» y «Volvemos a investigar» se cuentan
 * en un solo escenario (la espiral doble): `#ciclo` es la sección y
 * `#evidencia` un ancla interna que aterriza en la segunda vuelta.
 *
 * Rearmado (2026-09-11): la página abre con el faro —la luz que abre el
 * archivo— y la historia de la constelación (los cuatro beats) corre en la
 * misma sección pinneada, sobre la hoja 01 que sube sobre la noche. El
 * acto de reposo del hero viejo (titular claro + constelación loopeando)
 * se fue: el faro es ahora la apertura.
 *
 * Consistencia con el sitemap (2026-09-14): el orden es el del sitemap y
 * cada hoja del archivo lleva en su folio el nombre de su sección. La
 * Hoja 01 (los cuatro beats del hero) ES «Por qué investigamos». El sobre
 * se fue entero: primero «Nacimos de una pregunta» (el origen ya vive en
 * Quiénes somos y su postura la decía el beat 3, palabra por palabra) y el
 * 2026-09-15 también su versión de Biblioteca; la invitación a la
 * Biblioteca sigue en el cierre, del lado izquierdo (decisión de Gastón).
 */
export default async function InvestigacionPage() {
  // El contenido publicado (o el borrador, en vista previa); sin base, el
  // inicial del código. Los casos son una entidad: sin base, ninguno.
  const [{ hero, lineas, ciclo, enAccion, cierre }, casos] = await Promise.all([contenidoDe("investigacion"), casosDelSitio()]);
  return (
    <main id="contenido" tabIndex={-1}>
      <InvestigacionHero contenido={hero} />
      {/* De los casos, las líneas necesitan solo adónde lleva cada «Ver en acción». */}
      <LineasInvestigacion contenido={lineas} casos={casos.map(({ id, slug }) => ({ id, slug }))} />
      <EspiralInvestigacion contenido={ciclo} />
      <InvestigacionEnAccion contenido={enAccion} casos={casos} />
      <CierreInvestigacion contenido={cierre} />
    </main>
  );
}
