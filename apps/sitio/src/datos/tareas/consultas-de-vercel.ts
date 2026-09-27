import { PAISES_FIJOS, PLAN_DE_VERCEL, type PaisFijo } from "@/config/metricas";
import { ayerUTC, MAXIMO_DIAS_POR_CORRIDA, sumarDias, ventanasDe } from "@/lib/metricas/periodos";
import { DIMENSIONES, type Dia, type Dimension } from "@/lib/metricas/tipos";
import { fueraDePaises, soloPais } from "@/lib/metricas/vercel";

// Qué se le pide a Vercel en cada corrida de la copia diaria, en orden, y
// nunca más de lo que da el plan (`PLAN_DE_VERCEL`).

/** Cuántos días para atrás se le pide como mucho en una corrida: los de la ventana del plan. */
export const DIAS_POR_CORRIDA = Math.min(MAXIMO_DIAS_POR_CORRIDA, PLAN_DE_VERCEL.ventanaDeReporteDias);

/**
 * El cruce página × país (SPEC de work/metricas-completas/ §4.1): la API no
 * agrupa por día, página y país a la vez, así que se pide la página por día
 * filtrada por cada país fijo y por el resto, y se guarda como su propia
 * dimensión (`pagina-cl`, …, `pagina-otros`). Cuatro consultas por corrida.
 */
export const DIMENSIONES_DEL_CRUCE: ReadonlyArray<{ pais: PaisFijo | null; dimension: string; filtro: string }> = [
  ...PAISES_FIJOS.map((pais) => ({ pais, dimension: `pagina-${pais.toLowerCase()}`, filtro: soloPais(pais) })),
  { pais: null, dimension: "pagina-otros", filtro: fueraDePaises(PAISES_FIJOS) },
];

/**
 * Cada consulta y con qué `dimension` se guardan sus filas. Sin `total`: es la
 * marca de agua y corre última, después de todo (ver `sincronizarMetricas`).
 * Sin UTM en el plan, la campaña no se pide: la API la rechazaría.
 */
export const CONSULTAS: ReadonlyArray<{ dimension: Dimension; filtro?: string; guardarComo: string }> = [
  ...DIMENSIONES.filter((d) => d !== "total" && (d !== "campana" || PLAN_DE_VERCEL.utm)).map((dimension) => ({ dimension, guardarComo: dimension })),
  ...DIMENSIONES_DEL_CRUCE.map(({ dimension, filtro }) => ({ dimension: "pagina" as const, filtro, guardarComo: dimension })),
];

/**
 * Las ventanas (visitantes únicos de un rango) que se piden: las de
 * `ventanasDe` que empiezan adentro de la ventana del plan, contada hasta ayer.
 * En Hobby quedan la de 7 días, la de 7 anterior y la de 30: la de 30 anterior
 * y las de 90 irían más atrás que un mes. La comparación de 30 días sale de la
 * ventana que se guardó hace 30 días.
 */
export function ventanasQueSePiden(fechaFin: Dia, hoy: Date) {
  const primerDia = sumarDias(ayerUTC(hoy), -(PLAN_DE_VERCEL.ventanaDeReporteDias - 1));
  return ventanasDe(fechaFin).filter((v) => v.desde >= primerDia);
}
