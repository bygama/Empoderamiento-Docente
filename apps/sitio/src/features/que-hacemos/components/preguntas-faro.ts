import type { CSSProperties } from "react";

// La geometría de las frases del enfoque (S2 de la escena del faro): dónde va
// cada una y qué haz la alumbra. Son CUATRO porque así está armada la escena
// —posiciones, ángulos de luz y puntos en el agua (faro-geometria.ts)—, y de
// acá sale la cantidad que pide el esquema (features/que-hacemos/contenido/
// faro.ts). Los nombres («verbo») vienen de versiones anteriores de la
// escena; se dejan para no tocar la coreografía.

/** Posición del bloque de texto de cada frase (viewport, desktop). */
export const VERBO_POS: ReadonlyArray<CSSProperties> = [
  // La líder es más alta (tres líneas grandes): arranca más arriba para que
  // su pie quede lejos del horizonte.
  { left: "8%", top: "30%" },
  { left: "11%", top: "18%" },
  { right: "6%", top: "15%", textAlign: "right" },
  { left: "50%", bottom: "18%", transform: "translateX(-50%)", textAlign: "center" },
];

/**
 * Óptica que alumbra cada frase (izq = óptica izquierda, der = derecha) y
 * el ángulo de respaldo si no se puede medir el bloque (ver haz-faro.ts).
 */
export const HAZ_VERBO: ReadonlyArray<{ lado: "izq" | "der"; rot: number }> = [
  { lado: "izq", rot: -21 },
  { lado: "izq", rot: -13 },
  { lado: "der", rot: 42 },
  { lado: "izq", rot: -58 },
];
