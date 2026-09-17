import type { Metadata } from "next";
import { BibliotecaHero } from "@/features/biblioteca/components/BibliotecaHero";
import { DestacadosBiblioteca } from "@/features/biblioteca/components/DestacadosBiblioteca";
import { MaterialesListado } from "@/features/biblioteca/components/MaterialesListado";
import { PuenteInvestigacion } from "@/features/biblioteca/components/PuenteInvestigacion";
import { CierreBiblioteca } from "@/features/biblioteca/components/CierreBiblioteca";

export const metadata: Metadata = {
  title: "Biblioteca",
  description:
    "Publicaciones y recursos de Empoderamiento Docente: producción académica, materiales pedagógicos y proyectos, abiertos para llevar al aula.",
};

export default function BibliotecaPage() {
  return (
    <main id="contenido" tabIndex={-1}>
      <BibliotecaHero />
      <DestacadosBiblioteca />
      <MaterialesListado />
      <PuenteInvestigacion />
      <CierreBiblioteca />
    </main>
  );
}
