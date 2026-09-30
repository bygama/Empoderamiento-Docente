/**
 * Tramos de la escena de «¿Quiénes somos?» → «Misión», en alturas de pantalla
 * desde que la zona se clava: lectura de Quiénes somos · barrido · lectura de
 * Misión · dónde suelta.
 */
export type Tiempos = {
  qs: readonly [number, number];
  barrido: readonly [number, number];
  mision: readonly [number, number];
  fin: number;
};

// Escritorio conserva los suyos. Celular y tablet comprimen la lectura de
// Misión (el relleno palabra por palabra casi no se ve en una pantalla chica y
// quedaba un viewport quieto) y sueltan antes: la zona mide 300svh, no 340.
export const TIEMPOS: Record<"escritorio" | "movil", Tiempos> = {
  escritorio: { qs: [0.12, 0.8], barrido: [1.0, 1.5], mision: [1.65, 2.35], fin: 2.35 },
  movil: { qs: [0.12, 0.7], barrido: [0.85, 1.25], mision: [1.35, 1.9], fin: 2.0 },
};
