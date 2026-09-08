import type { Metadata } from "next";
import { QuienesSomosHero } from "@/features/quienes-somos/components/QuienesSomosHero";
import { OrigenEd } from "@/features/quienes-somos/components/OrigenEd";
import { MiradaEd } from "@/features/quienes-somos/components/MiradaEd";
import { EnfoqueTransformacion } from "@/features/que-hacemos/components/EnfoqueTransformacion";
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
      {/* «Nuestro enfoque» (TRANSFORMACIÓN armándose + los diferenciales de
          Dani) vivía al final de Qué hacemos. Acá es manifiesto, al lado de
          la mirada, y no compite con la oferta (2026-09-08). */}
      <EnfoqueTransformacion />
      <ImpulsanEd />
      {/* RedEd y DistintoEd removidos del render (página muy larga) — los
          componentes siguen en features/quienes-somos por si se reincorporan. */}
      {/* Próximas secciones (sitemap): Trayectoria y alianzas · Cierre. */}
    </main>
  );
}
