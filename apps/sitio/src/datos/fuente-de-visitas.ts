import { PLANES_DE_LA_FUENTE, type PlanDeLaFuente } from "@/config/metricas";
import { fuenteEsperada } from "@/lib/metricas/entorno";

/**
 * El plan de la fuente de las visitas que rige (`config/metricas.ts`): la
 * configurada, o la del host si todavía no hay ninguna (ADR-0018).
 */
export function planDeLaFuente(entorno: Record<string, string | undefined> = process.env): PlanDeLaFuente {
  return PLANES_DE_LA_FUENTE[fuenteEsperada(entorno)];
}
