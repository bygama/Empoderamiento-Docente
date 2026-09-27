import { estadoDeMetricas } from "@/datos/consultas/metricas";
import { origenDe } from "@/datos/consultas/origen";
import type { Periodo } from "@/lib/metricas/periodos";
import { CuerpoDeOrigen } from "./origen/CuerpoDeOrigen";
import { EstadoDeLaCopia } from "./resumen/EstadoDeLaCopia";
import { SinCopia } from "./resumen/SinCopia";
import { SelectorDePeriodo } from "./SelectorDePeriodo";

/**
 * Métricas › Origen (SPEC de work/metricas-completas/ §6.2): desde qué
 * países, sitios y dispositivos llega la gente, y a qué hora. Lee la misma
 * copia diaria que el Resumen; sin copia, dice por qué.
 */
export async function Origen({ periodo }: { periodo: Periodo }) {
  const estado = await estadoDeMetricas();
  if (!estado.hayVariables || !estado.hastaDia) {
    return (
      <div className="space-y-6">
        <EstadoDeLaCopia estado={estado} />
        <SinCopia estado={estado} />
      </div>
    );
  }
  const origen = await origenDe(periodo, estado.hastaDia);
  return (
    <div className="space-y-6">
      <SelectorDePeriodo ruta="/admin/metricas/origen" periodo={periodo} />
      <EstadoDeLaCopia estado={estado} />
      <CuerpoDeOrigen origen={origen} periodo={periodo} />
    </div>
  );
}
