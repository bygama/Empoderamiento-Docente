import { PLAN_DE_VERCEL } from "@/config/metricas";
import { base } from "@/datos/cliente";
import { diaISO, fechaUTC, sumarDias, variacion, type Periodo } from "@/lib/metricas/periodos";
import type { Dia } from "@/lib/metricas/tipos";
import { tarjetaDe } from "./metricas";

// Las dos cifras de arriba del Resumen (SPEC de work/metricas-completas/
// §4.1): visitantes y vistas del período, contra el anterior.

/** Una cifra: el número, o `null` con la nota que dice por qué no hay. */
export type CifraLeida = { valor: number | null; variacion?: string; nota?: string };
export type CifrasDelPeriodo = { visitantes: CifraLeida; vistas: CifraLeida };

async function vistasEntre(desde: Dia, hasta: Dia): Promise<number> {
  const { _sum } = await base.metricaDiaria.aggregate({ where: { dimension: "total", fecha: { gte: fechaUTC(desde), lte: fechaUTC(hasta) } }, _sum: { vistas: true } });
  return _sum.vistas ?? 0;
}

/**
 * Hasta la ventana del plan, las dos salen de la ventana que Vercel mide
 * entera (personas distintas de todo el rango). Más largo, **lo que no se
 * puede medir se dice**: las vistas sí se suman día por día, si la copia
 * tiene el período entero, y se comparan solo con el anterior entero; las
 * personas distintas no se suman, así que no hay número y la nota dice por qué.
 */
export async function cifrasDelPeriodo(periodo: Periodo, desde: Dia, hasta: Dia): Promise<CifrasDelPeriodo> {
  const dias = PLAN_DE_VERCEL.ventanaDeReporteDias;
  if (periodo <= dias) {
    const t = await tarjetaDe(periodo);
    if (!t) return { visitantes: { valor: null }, vistas: { valor: null } };
    return { visitantes: { valor: t.visitantes, variacion: t.variacionVisitantes }, vistas: { valor: t.vistas, variacion: t.variacionVistas } };
  }
  const primera = await base.metricaDiaria.findFirst({ where: { dimension: "total" }, orderBy: { fecha: "asc" }, select: { fecha: true } });
  return cifrasMasLargasQueElPlan({ periodo, desde, hasta, desdeLaCopia: primera ? diaISO(primera.fecha) : null, sumarVistas: vistasEntre });
}

/** Las cifras de un período más largo que la ventana del plan. Recibe cómo sumar las vistas, para probarla sin base. */
export async function cifrasMasLargasQueElPlan({
  periodo,
  desde,
  hasta,
  desdeLaCopia,
  sumarVistas,
}: {
  periodo: Periodo;
  desde: Dia;
  hasta: Dia;
  /** El primer día copiado; `null` sin copia. */
  desdeLaCopia: Dia | null;
  sumarVistas: (desde: Dia, hasta: Dia) => Promise<number>;
}): Promise<CifrasDelPeriodo> {
  const visitantes = { valor: null, nota: `No se puede medir: Vercel da personas distintas de hasta ${PLAN_DE_VERCEL.ventanaDeReporteDias} días, y día por día no se suman` };
  if (!desdeLaCopia || desdeLaCopia > desde) return { visitantes, vistas: { valor: null, nota: `La copia todavía no tiene los ${periodo} días enteros` } };
  const desdeAnterior = sumarDias(desde, -periodo);
  // El período y el anterior no dependen uno del otro: van juntos.
  const [actual, anterior] = await Promise.all([
    sumarVistas(desde, hasta),
    desdeLaCopia <= desdeAnterior ? sumarVistas(desdeAnterior, sumarDias(desde, -1)) : Promise.resolve(null),
  ]);
  return { visitantes, vistas: { valor: actual, variacion: variacion(actual, anterior) } };
}
