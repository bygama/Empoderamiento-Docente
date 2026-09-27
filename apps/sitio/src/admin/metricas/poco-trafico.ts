import type { Periodo } from "@/lib/metricas/periodos";

// Lo que dice un bloque de Métricas cuando todavía no hay dato suficiente para
// dibujarlo (SPEC de work/metricas-completas/ §6): cuánto hay y cuánto hace
// falta, en vez de un gráfico que engaña con tres puntos.

export const SIN_DATOS_SUFICIENTES = "Todavía no hay datos suficientes";

const cuantos = (n: number, una: string, varias: string) => `${n} ${n === 1 ? una : varias}`;

/**
 * El estado vacío de un bloque con poco dato: «Hay 12 visitas en estos 30
 * días; para esta lista hacen falta 20. Probá con 90 días.»
 */
export function pocoTrafico({ hay, minimo, periodo, una, varias, para }: { hay: number; minimo: number; periodo: Periodo; una: string; varias: string; para: string }) {
  const probar = periodo < 90 ? " Probá con 90 días, o esperá a que entre más gente." : " Esperá a que entre más gente.";
  return {
    titulo: SIN_DATOS_SUFICIENTES,
    texto: `${hay ? `Hay ${cuantos(hay, una, varias)}` : `No hay ${varias}`} en estos ${periodo} días; ${para} hacen falta ${minimo}.${probar}`,
  };
}
