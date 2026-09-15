import type { Metadata } from "next";
import { InvestigacionHero } from "@/features/investigacion/components/InvestigacionHero";
import { LineasInvestigacion } from "@/features/investigacion/components/LineasInvestigacion";
import { EspiralInvestigacion } from "@/features/investigacion/components/EspiralInvestigacion";
import { InvestigacionEnAccion } from "@/features/investigacion/components/InvestigacionEnAccion";
import { CierreInvestigacion } from "@/features/investigacion/components/CierreInvestigacion";

export const metadata: Metadata = {
  title: "Investigación",
  description:
    "Investigamos para transformar la matemática escolar: socioepistemología, problematización, empoderamiento docente y evidencia que vuelve al aula.",
};

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
 * Hoja 01 (los cuatro beats del hero) ES «Por qué investigamos» y el
 * cierre queda solo con la conversación. El sobre se fue entero: primero
 * «Nacimos de una pregunta» (el origen ya vive en Quiénes somos y su
 * postura la decía el beat 3, palabra por palabra) y el 2026-09-15 también
 * «La investigación también se comparte» (decisión de Gastón).
 */
export default function InvestigacionPage() {
  return (
    <main id="contenido" tabIndex={-1}>
      <InvestigacionHero />
      <LineasInvestigacion />
      <EspiralInvestigacion />
      <InvestigacionEnAccion />
      <CierreInvestigacion />
    </main>
  );
}
