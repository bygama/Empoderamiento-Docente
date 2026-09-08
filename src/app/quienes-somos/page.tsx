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
      <ImpulsanEd />
      {/* RedEd y DistintoEd removidos del render (página muy larga) — los
          componentes siguen en features/quienes-somos por si se reincorporan. */}
      {/* Próximas secciones (sitemap): Trayectoria y alianzas · Cierre. */}
    </main>
  );
}
