import type { Metadata } from "next";
import { Guarda } from "@/admin/armazon/Guarda";
import { EncabezadoDeMetricas } from "@/admin/metricas/EncabezadoDeMetricas";
import { Origen } from "@/admin/metricas/Origen";
import { pantallaDeMetricas } from "@/admin/metricas/pantallas";
import { periodoDe } from "@/lib/metricas/periodos";

export const metadata: Metadata = { title: "Origen" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

// La guarda envuelve lo que lee: la del layout solo oculta la interfaz.
export default async function OrigenDeMetricas({ searchParams }: Props) {
  const { periodo } = await searchParams;
  return (
    <div className="space-y-8">
      <EncabezadoDeMetricas detalle={pantallaDeMetricas("origen").que} />
      <Guarda capacidad="verMetricas">
        <Origen periodo={periodoDe(periodo)} />
      </Guarda>
    </div>
  );
}
