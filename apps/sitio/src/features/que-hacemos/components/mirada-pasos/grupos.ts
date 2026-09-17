import { MIRADA } from "@/features/que-hacemos/areas";

/**
 * Cómo se reparten los seis pasos en pilas.
 *
 * DOS GRUPOS DE TRES (el usuario, 2026-09-15): con los seis en una sola pila,
 * las cinco solapas se comen media pantalla de notebook y a la última card le
 * quedaban 14rem. De a tres son dos solapas, el presupuesto de alto se
 * reinicia por grupo y las cards entran enteras. La cuenta, con números, está
 * en globals.css.
 *
 * Los seis siguen en UNA sola lista: lo que se reinicia es el `top` y el alto,
 * no el contenedor. Así el cuarto sube y se apoya donde se apoyó el primero
 * —lo tapa, porque pinta después—, y los tres comidos SE QUEDAN AHÍ, trabados
 * detrás, en vez de despegarse y pasar por arriba del título (el usuario,
 * 2026-09-15: «que el 1, 2 y 3 después no suban, que se queden ahí, ya que ya
 * fueron comidos»). Con dos listas, cada grupo se despegaba al terminar la
 * suya; con una, todos se despegan juntos cuando la banda los empuja.
 */

/** Cuántos paneles se apilan juntos antes de que el grupo siguiente los tape. */
export const POR_GRUPO = 3;

/** Dónde cae un paso dentro de su grupo, y de cuántos es ese grupo (el último
 *  puede quedar corto si los pasos no son múltiplo de POR_GRUPO). */
export function lugarEnGrupo(indice: number) {
  const grupo = Math.floor(indice / POR_GRUPO);
  return {
    enGrupo: indice % POR_GRUPO,
    porGrupo: Math.min(POR_GRUPO, MIRADA.length - grupo * POR_GRUPO),
  };
}
