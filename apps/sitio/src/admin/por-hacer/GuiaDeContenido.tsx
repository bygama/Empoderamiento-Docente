import { EncabezadoDeContenido } from "@/admin/contenido/EncabezadoDeContenido";
import { LoQueVaATener } from "./GuiaDelModulo";
import type { Guia } from "./guias";

/** Una pestaña de Contenido que todavía no existe: el encabezado del módulo, con su pestaña encendida, y lo que va a tener. */
export function GuiaDeContenido({ guia }: { guia: Guia }) {
  return (
    <div className="space-y-8">
      <EncabezadoDeContenido detalle={guia.para} />
      <LoQueVaATener guia={guia} />
    </div>
  );
}
