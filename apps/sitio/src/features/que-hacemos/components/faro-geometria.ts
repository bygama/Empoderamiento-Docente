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
 * Puntos del mar que el haz "toca" en el enfoque (escena 2), en coordenadas
 * de la capa marMedio. El orden acompaña la coreografía de las frases:
 * izquierda lejos → izquierda alta → derecha → centro (el camino).
 */
export const PUNTOS_VERBO: ReadonlyArray<readonly [number, number]> = [
  [270, 700], [180, 620], [1230, 680], [720, 820],
] as const;

/** Un tramo del dibujo como porcentaje de otro (para ubicar cajas en CSS). */
export const pctDelDibujo = (n: number, de: number) => `${((n / de) * 100).toFixed(3)}%`;

/**
 * La caja de cada cono de luz en el dibujo (viewBox 1440×900): x, y, ancho,
 * alto. Las dos nacen en el foco de la linterna (x 950) y van para su lado.
 * Las dibuja hero-faro/HacesFaro.tsx.
 */
export const CAJA_HAZ = { izq: [-360, 280, 1310, 372], der: [950, 280, 1310, 372] } as const;

/**
 * El foco de la linterna dentro de la caja de cada cono: su pivote. Lo usan
 * las coreografías al fijar el estado inicial (antes era un `transformOrigin`
 * en píxeles del bbox del `<g>`, que solo vale adentro de un SVG).
 */
export const ORIGEN_HAZ = {
  izq: `100% ${pctDelDibujo(FOCO_Y - CAJA_HAZ.izq[1], CAJA_HAZ.izq[3])}`,
  der: `0% ${pctDelDibujo(FOCO_Y - CAJA_HAZ.der[1], CAJA_HAZ.der[3])}`,
} as const;
