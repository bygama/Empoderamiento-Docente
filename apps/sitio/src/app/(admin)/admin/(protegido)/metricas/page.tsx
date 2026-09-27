import type { Metadata } from "next";
import { Guarda } from "@/admin/armazon/Guarda";
import { ActualizarAhora } from "@/admin/metricas/ActualizarAhora";
import { EncabezadoDeMetricas } from "@/admin/metricas/EncabezadoDeMetricas";
import { pantallaDeMetricas } from "@/admin/metricas/pantallas";
import { Resumen } from "@/admin/metricas/Resumen";
import { actualizarMetricasAhora } from "@/datos/acciones/actualizar-metricas";
import { sesionActual } from "@/datos/sesion";
import { periodoDe } from "@/lib/metricas/periodos";

export const metadata: Metadata = { title: "Métricas" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

// La guarda envuelve lo que lee: la del layout solo oculta la interfaz, y lo
// que no se dibuja acá no se lee (DESIGN.md §11, «Sin permiso»).
export default async function ResumenDeMetricas({ searchParams }: Props) {
  const [{ periodo }, sesion] = await Promise.all([searchParams, sesionActual()]);
  return (
    <div className="space-y-8">
      <EncabezadoDeMetricas detalle={pantallaDeMetricas("resumen").que} acciones={<ActualizarAhora accion={actualizarMetricasAhora} />} />
      <Guarda capacidad="verMetricas">
        <Resumen periodo={periodoDe(periodo)} rol={sesion?.user.rol} />
      </Guarda>
    </div>
  );
}
