import type { Metadata } from "next";
import { contenidoDe } from "@/datos/consultas/paginas";
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

export default async function BibliotecaPage() {
  // El contenido publicado (o el borrador, en vista previa); sin base, el inicial del código.
  const { hero, destacados, catalogo } = await contenidoDe("biblioteca");
  return (
    <main id="contenido" tabIndex={-1}>
      <BibliotecaHero contenido={hero} />
      <DestacadosBiblioteca contenido={destacados} />
      <MaterialesListado contenido={catalogo} />
      <PuenteInvestigacion />
      <CierreBiblioteca />
    </main>
  );
}
