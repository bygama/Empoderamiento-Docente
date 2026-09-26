import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GuiaDeMetricas } from "@/admin/por-hacer/GuiaDeMetricas";
import { guiaDeMetricas } from "@/admin/por-hacer/guias-de-metricas";

type Props = { params: Promise<{ pantalla: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const guia = guiaDeMetricas((await params).pantalla);
  return guia ? { title: guia.nombre } : {};
}

// Cada pestaña de Métricas que todavía no existe cae acá y muestra su guía.
// Las que ya existen (`busquedas`) son carpetas propias y ganan sobre este
// segmento dinámico.
export default async function PantallaPorHacer({ params }: Props) {
  const guia = guiaDeMetricas((await params).pantalla);
  if (!guia) notFound();
  return <GuiaDeMetricas guia={guia} />;
}
