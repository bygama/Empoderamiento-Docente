import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Guarda } from "@/admin/armazon/Guarda";
import { moduloDe } from "@/admin/armazon/barra-lateral/modulos";
import { GuiaDelModulo } from "@/admin/por-hacer/GuiaDelModulo";
import { guiaDe } from "@/admin/por-hacer/guias";

type Props = { params: Promise<{ modulo: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const guia = guiaDe((await params).modulo);
  return guia ? { title: guia.nombre } : {};
}

// Cada entrada del menú cuyo módulo todavía no existe cae acá y muestra su
// guía. Las rutas que ya existen (`contenido`) son carpetas propias y ganan
// sobre este segmento dinámico. La guía pasa por la misma guarda que va a
// tener el módulo: quien edita y escribe /admin/ajustes ve «Sin permiso».
export default async function ModuloPorHacer({ params }: Props) {
  const { modulo } = await params;
  const guia = guiaDe(modulo);
  if (!guia) notFound();
  const capacidad = moduloDe(modulo)?.capacidad;
  const pantalla = <GuiaDelModulo guia={guia} />;
  return capacidad ? <Guarda capacidad={capacidad}>{pantalla}</Guarda> : pantalla;
}
