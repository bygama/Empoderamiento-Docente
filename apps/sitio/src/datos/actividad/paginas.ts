import type { Reglas } from "./regla";

// Las páginas (work/paginas-inicio/): sobre la página, con su slug. Lo ve
// quien edita el contenido.
export const DE_LAS_PAGINAS = {
  "publico-una-pagina": { quienVe: "editarContenido", vaAlInicio: true },
  "descarto-un-borrador": { quienVe: "editarContenido", vaAlInicio: true },
  "restauro-una-version": { quienVe: "editarContenido", vaAlInicio: true },
} as const satisfies Reglas;
