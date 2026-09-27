import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GuiaDeContenido } from "@/admin/por-hacer/GuiaDeContenido";
import { guiaDeContenido } from "@/admin/por-hacer/guias-de-contenido";

type Props = { params: Promise<{ pantalla: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const guia = guiaDeContenido((await params).pantalla);
  return guia ? { title: guia.nombre } : {};
}

// Cada pestaña de Contenido que todavía no existe cae acá y muestra su guía.
// Las que ya existen (`paginas`, `casos`, `aliados`, `fotos`) son carpetas
// propias y ganan sobre este segmento dinámico.
export default async function PantallaPorHacer({ params }: Props) {
  const guia = guiaDeContenido((await params).pantalla);
  if (!guia) notFound();
  return <GuiaDeContenido guia={guia} />;
}
