import { base } from "@/datos/cliente";
import { planDeLaFuente } from "@/datos/fuente-de-visitas";
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
 * Hasta la ventana del plan (o siempre, si la fuente no tiene ventana, como
 * Umami), las dos salen de la ventana que la fuente mide entera (personas distintas de todo el rango). Más largo, **lo que no se
 * puede medir se dice**: las vistas sí se suman día por día, si la copia
 * tiene el período entero, y se comparan solo con el anterior entero; las
 * personas distintas no se suman, así que no hay número y la nota dice por qué.
 */
export async function cifrasDelPeriodo(periodo: Periodo, desde: Dia, hasta: Dia): Promise<CifrasDelPeriodo> {
  const { nombre, ventanaDeReporteDias: dias } = planDeLaFuente();
  if (dias === null || periodo <= dias) {
    const t = await tarjetaDe(periodo);
    if (!t) return { visitantes: { valor: null }, vistas: { valor: null } };
    return { visitantes: { valor: t.visitantes, variacion: t.variacionVisitantes }, vistas: { valor: t.vistas, variacion: t.variacionVistas } };
  }
  const primera = await base.metricaDiaria.findFirst({ where: { dimension: "total" }, orderBy: { fecha: "asc" }, select: { fecha: true } });
  return cifrasMasLargasQueElPlan({ periodo, desde, hasta, desdeLaCopia: primera ? diaISO(primera.fecha) : null, sumarVistas: vistasEntre, plan: { nombre, dias } });
}

/** Las cifras de un período más largo que la ventana del plan. Recibe cómo sumar las vistas, para probarla sin base. */
export async function cifrasMasLargasQueElPlan({
  periodo,
  desde,
  hasta,
  desdeLaCopia,
  sumarVistas,
  plan,
}: {
  periodo: Periodo;
  desde: Dia;
  hasta: Dia;
  /** El primer día copiado; `null` sin copia. */
  desdeLaCopia: Dia | null;
  sumarVistas: (desde: Dia, hasta: Dia) => Promise<number>;
  /** La fuente y su ventana, que es más corta que el período. */
  plan: { nombre: string; dias: number };
}): Promise<CifrasDelPeriodo> {
  const visitantes = { valor: null, nota: `No se puede medir: ${plan.nombre} da personas distintas de hasta ${plan.dias} días, y día por día no se suman` };
  if (!desdeLaCopia || desdeLaCopia > desde) return { visitantes, vistas: { valor: null, nota: `La copia todavía no tiene los ${periodo} días enteros` } };
  const desdeAnterior = sumarDias(desde, -periodo);
  // El período y el anterior no dependen uno del otro: van juntos.
  const [actual, anterior] = await Promise.all([
    sumarVistas(desde, hasta),
    desdeLaCopia <= desdeAnterior ? sumarVistas(desdeAnterior, sumarDias(desde, -1)) : Promise.resolve(null),
  ]);
  return { visitantes, vistas: { valor: actual, variacion: variacion(actual, anterior) } };
}
