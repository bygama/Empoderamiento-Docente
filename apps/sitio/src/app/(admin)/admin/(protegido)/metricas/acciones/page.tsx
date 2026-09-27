import type { Metadata } from "next";
import { Guarda } from "@/admin/armazon/Guarda";
import { EncabezadoDeMetricas } from "@/admin/metricas/EncabezadoDeMetricas";
import { pantallaDeMetricas } from "@/admin/metricas/pantallas";
import { QueHaceLaGente } from "@/admin/metricas/QueHaceLaGente";
import { periodoDe } from "@/lib/metricas/periodos";

export const metadata: Metadata = { title: "Qué hace la gente" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

// La guarda envuelve lo que lee: la del layout solo oculta la interfaz.
export default async function AccionesDeMetricas({ searchParams }: Props) {
  const { periodo } = await searchParams;
  return (
    <div className="space-y-8">
      <EncabezadoDeMetricas detalle={pantallaDeMetricas("acciones").que} />
      <Guarda capacidad="verMetricas">
        <QueHaceLaGente periodo={periodoDe(periodo)} />
      </Guarda>
    </div>
  );
}
