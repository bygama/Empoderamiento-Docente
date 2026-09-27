import { PAISES_FIJOS, type PaisFijo, type PlanDeLaFuente } from "@/config/metricas";
import { ayerUTC, MAXIMO_DIAS_POR_CORRIDA, sumarDias, ventanasDe } from "@/lib/metricas/periodos";
import { DIMENSIONES, type Dia, type Dimension, type FiltroDePais } from "@/lib/metricas/tipos";

// Qué se le pide a la fuente de las visitas en cada corrida de la copia
// diaria, en orden, y nunca más de lo que da su plan (`PLANES_DE_LA_FUENTE`).

/** Cuántos días para atrás se le pide como mucho en una corrida: los de la ventana del plan, si tiene. */
export function diasPorCorrida(plan: PlanDeLaFuente): number {
  return Math.min(MAXIMO_DIAS_POR_CORRIDA, plan.ventanaDeReporteDias ?? MAXIMO_DIAS_POR_CORRIDA);
}

/**
 * El cruce página × país (SPEC de work/metricas-completas/ §4.1): la API no
 * agrupa por día, página y país a la vez, así que se pide la página por día
 * filtrada por cada país fijo y por el resto, y se guarda como su propia
 * dimensión (`pagina-cl`, …, `pagina-otros`). Cuatro consultas por corrida.
 * El resto deja afuera las visitas sin país: las dos fuentes filtran así.
 */
export const DIMENSIONES_DEL_CRUCE: ReadonlyArray<{ pais: PaisFijo | null; dimension: string; filtro: FiltroDePais }> = [
  ...PAISES_FIJOS.map((pais) => ({ pais, dimension: `pagina-${pais.toLowerCase()}`, filtro: { pais } })),
  { pais: null, dimension: "pagina-otros", filtro: { fueraDe: PAISES_FIJOS } },
];

/**
 * Cada consulta y con qué `dimension` se guardan sus filas. Sin `total`: es la
 * marca de agua y corre última, después de todo (ver `sincronizarMetricas`).
 * Sin UTM en el plan, la campaña no se pide: la API la rechazaría.
 */
export function consultasDe(plan: PlanDeLaFuente): ReadonlyArray<{ dimension: Dimension; filtro?: FiltroDePais; guardarComo: string }> {
  return [
    ...DIMENSIONES.filter((d) => d !== "total" && (d !== "campana" || plan.utm)).map((dimension) => ({ dimension, guardarComo: dimension })),
    ...DIMENSIONES_DEL_CRUCE.map(({ dimension, filtro }) => ({ dimension: "pagina" as const, filtro, guardarComo: dimension })),
  ];
}

/**
 * Las ventanas (visitantes únicos de un rango) que se piden: las de
 * `ventanasDe` que empiezan adentro de la ventana del plan, contada hasta ayer,
 * o todas si el plan no tiene ventana. En Vercel Hobby quedan la de 7 días, la
 * de 7 anterior y la de 30: la de 30 anterior y las de 90 irían más atrás que
 * un mes, y la comparación de 30 días sale de la ventana que se guardó hace 30
 * días. Umami las da todas.
 */
export function ventanasQueSePiden(fechaFin: Dia, hoy: Date, plan: PlanDeLaFuente) {
  const ventana = plan.ventanaDeReporteDias;
  if (ventana === null) return ventanasDe(fechaFin);
  const primerDia = sumarDias(ayerUTC(hoy), -(ventana - 1));
  return ventanasDe(fechaFin).filter((v) => v.desde >= primerDia);
}
