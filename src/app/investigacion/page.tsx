import type { Metadata } from "next";
import { InvestigacionHero } from "@/features/investigacion/components/InvestigacionHero";
import { CartaAbierta } from "@/features/investigacion/components/CartaAbierta";
import { LineasInvestigacion } from "@/features/investigacion/components/LineasInvestigacion";
import { CicloInvestigacionAplicada } from "@/features/investigacion/components/CicloInvestigacionAplicada";
import { VolvemosInvestigar } from "@/features/investigacion/components/VolvemosInvestigar";
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
 */
export default function InvestigacionPage() {
  return (
    <main>
      <InvestigacionHero />
      <CartaAbierta />
      <LineasInvestigacion />
      <CicloInvestigacionAplicada />
      <VolvemosInvestigar />
      <InvestigacionEnAccion />
      <CierreInvestigacion />
    </main>
  );
}
