import type { Metadata } from "next";
import { EncabezadoDeMetricas } from "@/admin/metricas/EncabezadoDeMetricas";
import { PanelMetricas } from "@/admin/metricas/PanelMetricas";
import { pantallaDeMetricas } from "@/admin/metricas/pantallas";

export const metadata: Metadata = { title: "Métricas" };

// El Resumen es el panel de hoy, tal cual; la curva con marcas, los canales y
// las páginas más vistas llegan con la lane 11.
export default function ResumenDeMetricas() {
  return (
    <div className="space-y-8">
      <EncabezadoDeMetricas detalle={pantallaDeMetricas("resumen").que} />
      <PanelMetricas />
    </div>
  );
}
