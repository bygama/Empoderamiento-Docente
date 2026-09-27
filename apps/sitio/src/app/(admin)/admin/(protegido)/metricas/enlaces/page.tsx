import type { Metadata } from "next";
import { Guarda } from "@/admin/armazon/Guarda";
import { EncabezadoDeMetricas } from "@/admin/metricas/EncabezadoDeMetricas";
import { Enlaces } from "@/admin/metricas/Enlaces";
import { pantallaDeMetricas } from "@/admin/metricas/pantallas";

export const metadata: Metadata = { title: "Links para compartir" };

// La guarda envuelve lo que lee: la del layout solo oculta la interfaz.
export default function EnlacesDeMetricas() {
  return (
    <div className="space-y-8">
      <EncabezadoDeMetricas detalle={pantallaDeMetricas("enlaces").que} />
      <Guarda capacidad="verMetricas">
        <Enlaces />
      </Guarda>
    </div>
  );
}
