import type { Metadata } from "next";
import { novedadesDelSitio } from "@/datos/consultas/novedades";
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

export default async function NovedadesPage() {
  // Las publicadas (o el borrador, en vista previa), de la más nueva a la más vieja; sin base, ninguna.
  const novedades = await novedadesDelSitio();
  return (
    <main id="contenido" tabIndex={-1}>
      <NovedadesHero fechaDeLaUltima={novedades[0]?.fecha ?? null} />
      <NovedadDestacada novedades={novedades} />
      <FiltrosNovedades novedades={novedades} />
      <EdEnMovimiento />
      <LanzamientosRecientes />
      <CierreNovedades />
    </main>
  );
}
