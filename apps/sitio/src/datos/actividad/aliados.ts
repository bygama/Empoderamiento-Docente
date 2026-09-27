import type { Reglas } from "./regla";

// Aliados (work/casos-aliados-fotos/): sobre el aliado, por su nombre como
// era, con su id. Lo ve quien edita el contenido, también que se autorizó un
// logo, aunque marcarlo sea de quien dirige o administra.
export const DE_LOS_ALIADOS = {
  "autorizo-un-aliado": { quienVe: "editarContenido", vaAlInicio: true },
  "quito-la-autorizacion-de-un-aliado": { quienVe: "editarContenido", vaAlInicio: true },
  "publico-un-aliado": { quienVe: "editarContenido", vaAlInicio: true },
  "despublico-un-aliado": { quienVe: "editarContenido", vaAlInicio: true },
  "borro-un-aliado": { quienVe: "editarContenido", vaAlInicio: true },
} as const satisfies Reglas;
