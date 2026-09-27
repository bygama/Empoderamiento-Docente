import { desdeTexto, esValido } from "@ed/db/slug";

// El código de un link corto (`/l/<codigo>`): sale del nombre y no cambia
// nunca, porque está pegado en un posteo. Puro, para que el formulario lo
// muestre mientras se escribe y el servidor lo arme igual. Sin ED.

/** Hasta dónde llega el código: más largo no entra cómodo en un posteo. */
export const LARGO_DEL_CODIGO = 40;

/** El código que propone un nombre: su slug hasta 40, o «link» si no queda nada. */
export function codigoDesde(nombre: string): string {
  return desdeTexto(nombre).slice(0, LARGO_DEL_CODIGO).replace(/-+$/, "") || "link";
}

/** Si un texto tiene la forma de un código (con su `-2` si hizo falta): lo que no, ni se busca. */
export function pareceCodigo(texto: string): boolean {
  return texto.length > 0 && texto.length <= LARGO_DEL_CODIGO + 4 && esValido(texto);
}
