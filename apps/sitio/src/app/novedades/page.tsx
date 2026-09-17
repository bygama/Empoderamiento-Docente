import type { Metadata } from "next";
import { NovedadesHero } from "@/features/novedades/components/NovedadesHero";
import { NovedadDestacada } from "@/features/novedades/components/NovedadDestacada";
import { FiltrosNovedades } from "@/features/novedades/components/FiltrosNovedades";
import { EdEnMovimiento } from "@/features/novedades/components/EdEnMovimiento";
import { LanzamientosRecientes } from "@/features/novedades/components/LanzamientosRecientes";
import { CierreNovedades } from "@/features/novedades/components/CierreNovedades";

export const metadata: Metadata = {
  title: "Novedades",
  description:
    "Publicaciones, encuentros, convocatorias y prensa de Empoderamiento Docente: seguí de cerca lo que investigamos, diseñamos y llevamos al aula.",
};

export default function NovedadesPage() {
  return (
    <main id="contenido" tabIndex={-1}>
      <NovedadesHero />
      <NovedadDestacada />
      <FiltrosNovedades />
      <EdEnMovimiento />
      <LanzamientosRecientes />
      <CierreNovedades />
    </main>
  );
}
