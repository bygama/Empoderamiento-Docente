/**
 * La estructura de «Origen, sentido y evolución»: la curva de la trayectoria
 * (de acá sale cuántos hitos son) y los tres pilares del relato (de acá sale
 * cuántas fotos). Los textos y las fotos llegan del contenido
 * (features/quienes-somos/contenido/origen.ts).
 */

// Coordenadas de los hitos sobre el viewBox 1000×220 (misma curva del path).
export const NODOS = [
  { x: 60, y: 150 },
  { x: 280, y: 90 },
  { x: 500, y: 140 },
  { x: 720, y: 80 },
  { x: 940, y: 120 },
] as const;

export const PATH_D =
  "M 60 150 C 133 150 207 90 280 90 C 353 90 427 140 500 140 C 573 140 647 80 720 80 C 793 80 867 120 940 120";

/**
 * Los tres pilares del relato (beats 0–2). Numerados como en «Nuestra
 * mirada»: el sitio ya usa «01 — Etiqueta» para secuencias conceptuales.
 */
export const PILARES = [
  { n: "01", label: "Origen" },
  { n: "02", label: "Sentido" },
  { n: "03", label: "Evolución" },
] as const;
