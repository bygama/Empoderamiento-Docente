/**
 * Geometría y tiempos de «Nuestra mirada» bajo `lg`: dónde va cada nodo en la
 * barra según el principio que se lee, dónde termina en la constelación del
 * cierre y cuánto dura cada tramo. La consumen el markup (`MapaMovil`), la
 * coreografía (`escena-movil.ts`) y el compositor, que le da el alto a la zona.
 */

/** Cuántos principios son (la constelación está armada para tres). */
export const PRINCIPIOS = 3;

// ── Tiempos (unidades del timeline) ────────────────────────────────────────
/** El título solo, y los nodos que nacen de él. */
export const T_TITULO = 1;
/** Un principio: frase, afirmación, fichas y el paso al siguiente. */
export const T_PRINCIPIO = 1.5;
/** El cierre: constelación, síntesis y puente. */
export const T_CIERRE = 1.7;
export const T_TOTAL = T_TITULO + PRINCIPIOS * T_PRINCIPIO + T_CIERRE;
/** Scroll por unidad, en lvh. */
const LVH_POR_UNIDAD = 45;
/** Alto de la zona: una pantalla más el recorrido del timeline. */
export const ALTO_ESCENA_LVH = 100 + T_TOTAL * LVH_POR_UNIDAD;

/** Cuándo empieza el principio `i` y cuándo el cierre. */
export const inicioDe = (i: number) => T_TITULO + i * T_PRINCIPIO;
export const INICIO_CIERRE = inicioDe(PRINCIPIOS);

/**
 * Dónde hay que dejar el scroll para leer el principio `i` con sus fichas ya
 * arriba (lo usa el toque sobre un nodo de la barra).
 */
export function scrollDePrincipio(zona: HTMLElement, i: number) {
  const arriba = zona.getBoundingClientRect().top + window.scrollY;
  const recorrido = zona.offsetHeight - window.innerHeight;
  return arriba + ((inicioDe(i) + 0.75) / T_TOTAL) * recorrido;
}

// ── La barra ───────────────────────────────────────────────────────────────
/**
 * Lugar de cada nodo sobre la barra (0 = borde izquierdo, 1 = derecho), según
 * el principio activo. El activo queda a la izquierda con su nombre al lado;
 * los ya leídos se juntan detrás y los que faltan esperan contra el borde
 * derecho. Al cambiar de principio el que sigue cruza toda la barra: ese
 * viaje es la cámara de escritorio traducida a una pantalla angosta.
 */
export const BARRA: ReadonlyArray<readonly [number, number, number]> = [
  [0, 0.9, 1],
  [0, 0.1, 1],
  [0, 0.1, 0.2],
];

/** Alto de la barra desde el borde de arriba (deja libre el header), en rem. */
export const BARRA_Y_REM = 7;
/** Margen lateral de la barra, en px. */
export const BARRA_MARGEN = 30;

// ── La constelación del cierre ─────────────────────────────────────────────
/** Dónde termina cada nodo, en fracción del ancho y del alto visible. */
export const CONSTELACION = [
  { x: 0.2, y: 0.25 },
  { x: 0.8, y: 0.29 },
  { x: 0.5, y: 0.82 },
] as const;

/** Cuánto del camino hacia el centro recorre el radio de cada nodo. */
export const LARGO_RADIO = 0.3;

/** Ramas que brotan de cada nodo en el cierre: ángulo (grados) y largo (px). */
export const RAMAS_MOVIL: ReadonlyArray<{ nodo: number; angulo: number; largo: number }> = [
  { nodo: 0, angulo: 205, largo: 34 },
  { nodo: 0, angulo: 150, largo: 30 },
  { nodo: 0, angulo: 285, largo: 38 },
  { nodo: 1, angulo: -25, largo: 34 },
  { nodo: 1, angulo: 30, largo: 30 },
  { nodo: 1, angulo: 255, largo: 38 },
  { nodo: 2, angulo: 150, largo: 40 },
  { nodo: 2, angulo: 30, largo: 40 },
  { nodo: 2, angulo: 95, largo: 28 },
];
