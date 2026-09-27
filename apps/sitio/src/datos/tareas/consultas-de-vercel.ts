import { PAISES_FIJOS, type PaisFijo } from "@/config/metricas";
import { DIMENSIONES, type Dimension } from "@/lib/metricas/tipos";
import { fueraDePaises, soloPais } from "@/lib/metricas/vercel";

// Qué se le pide a Vercel en cada corrida de la copia diaria, en orden.

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
 */
export const CONSULTAS: ReadonlyArray<{ dimension: Dimension; filtro?: string; guardarComo: string }> = [
  ...DIMENSIONES.filter((d) => d !== "total").map((dimension) => ({ dimension, guardarComo: dimension })),
  ...DIMENSIONES_DEL_CRUCE.map(({ dimension, filtro }) => ({ dimension: "pagina" as const, filtro, guardarComo: dimension })),
];
