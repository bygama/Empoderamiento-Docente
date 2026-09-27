import type { Reglas } from "./regla";

// Biblioteca (work/biblioteca/): sobre el material, con su título como era en
// ese momento y su id. Agregarlo sí se anota (entra uno nuevo); guardar un
// borrador, no. Lo ve quien edita la Biblioteca.
export const DE_LA_BIBLIOTECA = {
  "agrego-un-material": { quienVe: "editarBiblioteca", vaAlInicio: true },
  "publico-un-material": { quienVe: "editarBiblioteca", vaAlInicio: true },
  "oculto-un-material": { quienVe: "editarBiblioteca", vaAlInicio: true },
  "descarto-cambios-de-un-material": { quienVe: "editarBiblioteca", vaAlInicio: true },
  "borro-un-material": { quienVe: "editarBiblioteca", vaAlInicio: true },
} as const satisfies Reglas;
