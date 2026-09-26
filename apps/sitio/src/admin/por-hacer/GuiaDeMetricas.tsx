import { EncabezadoDeMetricas } from "@/admin/metricas/EncabezadoDeMetricas";
import { LoQueVaATener } from "./GuiaDelModulo";
import type { Guia } from "./guias";

/** Una pestaña de Métricas que todavía no existe: el encabezado del módulo, con su pestaña encendida, y lo que va a tener. */
export function GuiaDeMetricas({ guia }: { guia: Guia }) {
  return (
    <div className="space-y-8">
      <EncabezadoDeMetricas detalle={guia.para} />
      <LoQueVaATener guia={guia} />
    </div>
  );
}
