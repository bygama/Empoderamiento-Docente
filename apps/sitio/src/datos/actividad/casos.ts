import type { Reglas } from "./regla";

// Casos (work/casos-aliados-fotos/): sobre el caso («Caso 01»), con su id. Lo
// ve quien edita el contenido.
export const DE_LOS_CASOS = {
  "publico-un-caso": { quienVe: "editarContenido", vaAlInicio: true },
  "descarto-cambios-de-un-caso": { quienVe: "editarContenido", vaAlInicio: true },
} as const satisfies Reglas;
