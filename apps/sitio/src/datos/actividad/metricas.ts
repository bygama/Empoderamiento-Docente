import type { Reglas } from "./regla";

// Métricas (work/metricas-completas/): un link con su nombre en `sobre`; una
// marca de la curva, con su texto. Lo ve quien ve las métricas.
export const DE_LAS_METRICAS = {
  "creo-un-enlace": { quienVe: "verMetricas", vaAlInicio: true },
  "borro-un-enlace": { quienVe: "verMetricas", vaAlInicio: true },
  "agrego-una-marca": { quienVe: "verMetricas", vaAlInicio: true },
  "borro-una-marca": { quienVe: "verMetricas", vaAlInicio: true },
} as const satisfies Reglas;
