import type { Metadata } from "next";
import { QuienesSomosHero } from "@/features/quienes-somos/components/QuienesSomosHero";
import { OrigenEd } from "@/features/quienes-somos/components/OrigenEd";
import { MiradaEd } from "@/features/quienes-somos/components/MiradaEd";
import { ImpulsanEd } from "@/features/quienes-somos/components/ImpulsanEd";

export const metadata: Metadata = {
  title: "Quiénes somos",
  description:
    "Empoderamiento Docente no es una capacitación más: investigación, diseño y acompañamiento para transformar la relación con el saber matemático escolar.",
};

export default function QuienesSomosPage() {
  return (
    <main id="contenido" tabIndex={-1}>
      <QuienesSomosHero />
      <OrigenEd />
      <MiradaEd />
      {/* «Nuestro enfoque» (TRANSFORMACIÓN armándose + diferenciales) estuvo
          acá entre la mirada y el equipo (2026-09-08) y se sacó al día
          siguiente por decisión de Gastón. Su copy quedó guardado en
          docs/content/copy-que-hacemos.md; el código se borró el 2026-09-18. */}
      <ImpulsanEd />
      {/* Acá estuvieron RedEd (el grafo de la red) y DistintoEd (la comparativa
          con una capacitación genérica): Gastón los sacó el 2026-07-22 porque
          la página quedaba muy larga, y su código se borró el 2026-09-18. */}
      {/* Próximas secciones (sitemap): Trayectoria y alianzas · Cierre. */}
    </main>
  );
}
