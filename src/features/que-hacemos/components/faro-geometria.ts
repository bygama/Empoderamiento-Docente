/**
 * Geometría compartida de la escena del faro de «Qué hacemos»: punto de fuga,
 * profundidad conceptual de cada capa, foco de la linterna y puntos del mar que
 * el haz toca. La consumen FaroEscena (el dibujo) y la cámara de
 * QueHacemosHeroFaro (la proyección). Sin DOM.
 */

/** Punto de fuga compartido (viewBox 1440x900) y su equivalente en %. */
export const FUGA_X = 950;
export const FUGA_Y = 522;
export const ORIGEN_CSS = `${((FUGA_X / 1440) * 100).toFixed(2)}% ${((FUGA_Y / 900) * 100).toFixed(2)}%`;

/** Profundidades conceptuales de cada capa (px hacia el fondo). */
export const CAPAS_Z = {
  cielo: 1500,
  horizonte: 1050,
  faro: 620,
  marMedio: 300,
  muelle: 90,
  foreground: -140,
} as const;

/** Foco de la linterna, en coordenadas de la capa faro. */
export const FOCO_X = FUGA_X;
export const FOCO_Y = 388;

/**
 * Puntos del mar que el haz "toca" en el método (escena 2), en coordenadas
 * de la capa marMedio. El orden acompaña la coreografía de verbos: izquierda
 * lejos → izquierda alta → derecha → derecha cerca → centro (el camino).
 */
export const PUNTOS_VERBO: ReadonlyArray<readonly [number, number]> = [
  [270, 700], [180, 620], [1230, 680], [1150, 780], [720, 820],
] as const;