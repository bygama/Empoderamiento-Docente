import { notFound } from "next/navigation";
import { GuiaDelModulo } from "@/admin/por-hacer/GuiaDelModulo";
import { guiaDe } from "@/admin/por-hacer/guias";

// Cada entrada del menú cuyo módulo todavía no existe cae acá y muestra su
// guía. Las rutas que ya existen (`paginas`) son carpetas propias y ganan
// sobre este segmento dinámico.
export default async function ModuloPorHacer({ params }: { params: Promise<{ modulo: string }> }) {
  const { modulo } = await params;
  const guia = guiaDe(modulo);
  if (!guia) notFound();
  return <GuiaDelModulo guia={guia} />;
}
