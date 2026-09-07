/**
 * La lámina: la cámara de dos encuadres y las anotaciones de la espiral
 * doble. La escena arranca en primer plano sobre la vuelta interior y en la
 * bisagra se aleja hasta la figura completa; las anotaciones (nombre y
 * texto de cada estación, y el remate) son HTML posicionado en % del cuadro
 * del SVG. Matemática pura sobre la geometría de espiral.ts, sin DOM, para
 * que el SSR, las guías del SVG y los bloques HTML compartan los números.
 */

import { BISAGRA, CENTRO, ESTACIONES, NODOS, VIEWBOX_ESPIRAL } from "./espiral";

/** Un rectángulo del viewBox: centro + alto (el ancho sale de la relación
 *  del viewBox). Se traduce a translate + scale del grupo de cámara. */
export type Encuadre = {
  readonly cx: number;
  readonly cy: number;
  /** Alto visible, en unidades del viewBox. Menos alto = más cerca. */
  readonly alto: number;
};

/** Plano general: el viewBox entero, que es lo que dibuja el SSR. */
export const ENCUADRE_GENERAL: Encuadre = {
  cx: VIEWBOX_ESPIRAL.w / 2,
  cy: VIEWBOX_ESPIRAL.h / 2,
  alto: VIEWBOX_ESPIRAL.h,
};

/** Primer plano: la vuelta interior (nodos 01-04) centrada en su caja. */
export const ENCUADRE_INTERIOR: Encuadre = (() => {
  const interior = NODOS.slice(0, BISAGRA);
  const xs = interior.map(([x]) => x);
  const ys = interior.map(([, y]) => y);
  return {
    cx: (Math.min(...xs) + Math.max(...xs)) / 2,
    cy: (Math.min(...ys) + Math.max(...ys)) / 2,
    // 1.6×: la vuelta interior ocupa el cuadro y deja lugar adentro para
    // que cuelguen las anotaciones de arriba y de abajo.
    alto: 300,
  };
})();

/** Transform del grupo de cámara (`transformOrigin: "0 0"`) que muestra
 *  el encuadre ocupando el viewBox. */
export function transformDeEncuadre(e: Encuadre): { x: number; y: number; scale: number } {
  const scale = VIEWBOX_ESPIRAL.h / e.alto;
  return {
    x: VIEWBOX_ESPIRAL.w / 2 - scale * e.cx,
    y: VIEWBOX_ESPIRAL.h / 2 - scale * e.cy,
    scale,
  };
}

export type Lado = "arriba" | "derecha" | "abajo" | "izquierda" | "arriba-derecha";

type Anotacion = {
  readonly nodo: number;
  readonly lado: Lado;
  /** Encuadre en el que la anotación está a la vista. */
  readonly encuadre: Encuadre;
  /** Dirección unitaria en la que sale del nodo. */
  readonly normal: readonly [number, number];
  /** Hasta dónde llega la guía desde el centro del nodo (unidades del viewBox). */
  readonly alcance: number;
};

/** La guía arranca pasado el rótulo (que vive a 22 sobre la normal) y
 *  termina en el ancla de la anotación. Unidades del viewBox. */
const GUIA_DESDE = 32;
const GUIA_HASTA = 58;
/** El remate cuelga del nodo 01 pero su caja va afuera de la segunda
 *  vuelta: la guía cruza el anillo en diagonal hasta pasar el trazo. */
const ALCANCE_REMATE = 118;

/** Un cuarto de vuelta por estación: el lado sale del cuadrante. */
const LADO_POR_CUADRANTE: ReadonlyArray<Lado> = ["arriba", "derecha", "abajo", "izquierda"];

/** Normal hacia afuera del nodo, la misma que usa el rótulo. */
function normalNodo(k: number): readonly [number, number] {
  const [x, y] = NODOS[k];
  const dx = x - CENTRO.x;
  const dy = y - CENTRO.y;
  const d = Math.hypot(dx, dy) || 1;
  return [dx / d, dy / d];
}

/** Índice de la anotación del remate en `ANOTACIONES`. */
export const INDICE_REMATE = ESTACIONES;

/**
 * Las nueve anotaciones: las ocho estaciones (vuelta 1 en el encuadre
 * interior, vuelta 2 en el general) y el remate, que vuelve al nodo 01 en
 * plano general y sale hacia arriba a la derecha, libre del lazo que entra
 * por arriba a la izquierda.
 */
export const ANOTACIONES: ReadonlyArray<Anotacion> = [
  ...Array.from({ length: ESTACIONES }, (_, k): Anotacion => ({
    nodo: k,
    lado: LADO_POR_CUADRANTE[k % LADO_POR_CUADRANTE.length],
    encuadre: k < BISAGRA ? ENCUADRE_INTERIOR : ENCUADRE_GENERAL,
    normal: normalNodo(k),
    alcance: GUIA_HASTA,
  })),
  {
    nodo: 0,
    lado: "arriba-derecha",
    encuadre: ENCUADRE_GENERAL,
    normal: [Math.SQRT1_2, -Math.SQRT1_2],
    alcance: ALCANCE_REMATE,
  },
];

/** Largo de la guía más larga: el dash de todas se dibuja con este valor,
 *  así que cada una se traza a la misma velocidad. */
export const LARGO_GUIA = ALCANCE_REMATE - GUIA_DESDE;

/** Segmento de la guía de la anotación `i`, en unidades del viewBox (va
 *  dentro del grupo de cámara, así que escala con ella). */
export function guiaAnotacion(i: number): { x1: number; y1: number; x2: number; y2: number } {
  const { nodo, normal, alcance } = ANOTACIONES[i];
  const [x, y] = NODOS[nodo];
  const [nx, ny] = normal;
  return {
    x1: x + nx * GUIA_DESDE,
    y1: y + ny * GUIA_DESDE,
    x2: x + nx * alcance,
    y2: y + ny * alcance,
  };
}

/** Ancla de la anotación `i` proyectada por su encuadre, en % del cuadro
 *  del SVG. Puede salirse del cuadro (las laterales), nunca de la hoja. */
export function posicionAnotacion(i: number): { left: number; top: number } {
  const { x2, y2 } = guiaAnotacion(i);
  const t = transformDeEncuadre(ANOTACIONES[i].encuadre);
  return {
    left: ((t.x + t.scale * x2) / VIEWBOX_ESPIRAL.w) * 100,
    top: ((t.y + t.scale * y2) / VIEWBOX_ESPIRAL.h) * 100,
  };
}
