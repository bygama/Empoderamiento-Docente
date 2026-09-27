import { estadoDeMetricas } from "@/datos/consultas/metricas";
import { marcasDe } from "@/datos/consultas/marcas";
import { resumenDe } from "@/datos/consultas/resumen";
import { diaISO, sumarDias, type Periodo } from "@/lib/metricas/periodos";
import { CuerpoDelResumen } from "./resumen/CuerpoDelResumen";
import { EstadoDeLaCopia } from "./resumen/EstadoDeLaCopia";
import { SinCopia } from "./resumen/SinCopia";
import { SelectorDePeriodo } from "./SelectorDePeriodo";

/**
 * Métricas › Resumen (SPEC de work/metricas-completas/ §6.1): cuánta gente
 * entra al sitio en el período, contra el anterior. Lee solo de la copia
 * diaria; sin copia, dice por qué. Las marcas del período llegan hasta hoy:
 * una agregada hoy se ve en la lista aunque la curva llegue hasta ayer.
 */
export async function Resumen({ periodo, rol }: { periodo: Periodo; rol: unknown }) {
  const estado = await estadoDeMetricas();
  const sinCopia = <SinCopia estado={estado} />;
  if (!estado.hayVariables || !estado.hastaDia) {
    return (
      <div className="space-y-6">
        <EstadoDeLaCopia estado={estado} />
        {sinCopia}
      </div>
    );
  }
  const hoy = diaISO(new Date());
  const [resumen, marcas] = await Promise.all([
    resumenDe(periodo, estado.hastaDia),
    marcasDe(sumarDias(estado.hastaDia, -(periodo - 1)), hoy, rol),
  ]);
  return (
    <div className="space-y-6">
      <SelectorDePeriodo ruta="/admin/metricas" periodo={periodo} />
      <EstadoDeLaCopia estado={estado} />
      <CuerpoDelResumen resumen={resumen} marcas={marcas} periodo={periodo} hoy={hoy} />
    </div>
  );
}
