import type { Reglas } from "./regla";

// Fotos (work/casos-aliados-fotos/): sobre la foto, por su texto alternativo,
// con su id. Lo ve quien edita el contenido.
export const DE_LAS_FOTOS = {
  // Subir una foto no cambia el sitio hasta que un formulario la usa y se publica.
  "subio-una-foto": { quienVe: "editarContenido", vaAlInicio: false },
  "reemplazo-una-foto": { quienVe: "editarContenido", vaAlInicio: true },
  "borro-una-foto": { quienVe: "editarContenido", vaAlInicio: true },
} as const satisfies Reglas;
