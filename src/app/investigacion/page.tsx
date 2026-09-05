import type { Metadata } from "next";
import { InvestigacionHero } from "@/features/investigacion/components/InvestigacionHero";
import { CartaAbierta } from "@/features/investigacion/components/CartaAbierta";
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
 */
export default function InvestigacionPage() {
  return (
    <main>
      <InvestigacionHero />
      <CartaAbierta />
      <LineasInvestigacion />
      <EspiralInvestigacion />
      <InvestigacionEnAccion />
      <CierreInvestigacion />
    </main>
  );
}
