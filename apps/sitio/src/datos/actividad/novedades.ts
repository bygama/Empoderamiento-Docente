import type { Reglas } from "./regla";

// Novedades (work/novedades-y-kit/): sobre la novedad, con su título como era
// en ese momento y su id. Guardar un borrador no se anota. Lo ve quien edita
// las novedades.
export const DE_LAS_NOVEDADES = {
  "publico-una-novedad": { quienVe: "editarNovedades", vaAlInicio: true },
  "despublico-una-novedad": { quienVe: "editarNovedades", vaAlInicio: true },
  "descarto-cambios-de-una-novedad": { quienVe: "editarNovedades", vaAlInicio: true },
  "borro-una-novedad": { quienVe: "editarNovedades", vaAlInicio: true },
} as const satisfies Reglas;
