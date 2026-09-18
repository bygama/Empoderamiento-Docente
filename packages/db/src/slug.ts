/**
 * Slugs: la parte de una URL que no se puede mover sin romper un link.
 *
 * La regla de arquitectura que esto sostiene: **el slug es una columna, no se
 * deriva del título** (spec del admin §5). `desdeTexto` solo propone uno la
 * primera vez, cuando todavía no hay nada publicado; corregir un título
 * después no lo toca.
 */

const SEPARADORES = /[\s_/]+/g;
const NO_PERMITIDO = /[^a-z0-9-]/g;
const GUIONES_SEGUIDOS = /-{2,}/g;
const GUIONES_EN_LOS_BORDES = /^-+|-+$/g;

/** Largo máximo. Más que esto no entra cómodo en un link compartido. */
export const LARGO_MAXIMO = 80;

/**
 * Propone un slug a partir de un texto. Saca los acentos con `NFD`, que separa
 * la letra del diacrítico, y después borra el diacrítico: así «ó» queda «o» y
 * no desaparece la vocal entera.
 */
export function desdeTexto(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(SEPARADORES, "-")
    .replace(NO_PERMITIDO, "")
    .replace(GUIONES_SEGUIDOS, "-")
    .replace(GUIONES_EN_LOS_BORDES, "")
    .slice(0, LARGO_MAXIMO)
    .replace(GUIONES_EN_LOS_BORDES, "");
}

/** ¿Este slug es uno que se puede publicar? */
export function esValido(slug: string): boolean {
  return slug.length > 0 && slug.length <= LARGO_MAXIMO && slug === desdeTexto(slug);
}

/**
 * Un slug libre, agregando `-2`, `-3`… si hace falta. `tomados` son los que ya
 * existen en la tabla; quien llama los trae, porque este paquete no consulta la
 * base: no sabe qué tablas hay.
 */
export function libre(propuesto: string, tomados: Iterable<string>): string {
  const usados = new Set(tomados);
  if (!usados.has(propuesto)) return propuesto;
  for (let n = 2; ; n += 1) {
    const sufijo = `-${n}`;
    const candidato = `${propuesto.slice(0, LARGO_MAXIMO - sufijo.length)}${sufijo}`;
    if (!usados.has(candidato)) return candidato;
  }
}
