import type { Metadata } from "next";
import { InvestigacionHero } from "@/features/investigacion/components/InvestigacionHero";
import { PorQueInvestigamos } from "@/features/investigacion/components/PorQueInvestigamos";
import { LineasInvestigacion } from "@/features/investigacion/components/LineasInvestigacion";
import { CicloInvestigacionAplicada } from "@/features/investigacion/components/CicloInvestigacionAplicada";
import { ProyectosAplicaciones } from "@/features/investigacion/components/ProyectosAplicaciones";
import { VolvemosInvestigar } from "@/features/investigacion/components/VolvemosInvestigar";
import { InvestigacionEnAccion } from "@/features/investigacion/components/InvestigacionEnAccion";
import { ConexionBiblioteca } from "@/features/investigacion/components/ConexionBiblioteca";
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
 * «Proyectos y aplicaciones» venía de Qué hacemos y va acá, después del
 * ciclo de investigación aplicada: es lo que investigamos, puesto a
 * trabajar (pedido de Mateo, 2026-09-02).
 */
export default function InvestigacionPage() {
  return (
    <main>
      <InvestigacionHero />
      <PorQueInvestigamos />
      <LineasInvestigacion />
      <CicloInvestigacionAplicada />
      <ProyectosAplicaciones />
      <VolvemosInvestigar />
      <InvestigacionEnAccion />
      <ConexionBiblioteca />
      <CierreInvestigacion />
    </main>
  );
}
