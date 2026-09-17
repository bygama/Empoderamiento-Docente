/**
 * Geometría de la espiral doble — la figura de «Transformar» del hero,
 * agrandada a dos vueltas de cuatro estaciones cada una: la primera es el
 * ciclo pedagógico (vivir → implementar → reflexionar → resignificar) y la
 * segunda, el ciclo de evidencia (registrar → analizar → sistematizar →
 * retroalimentar). Ocho nodos sobre una espiral de Arquímedes, y un lazo
 * de retorno del último nodo al primero («abrimos otro ciclo»).
 *
 * Todo es matemática pura (sin DOM) para que el SSR dibuje la figura
 * formada y la coreografía tenga las mismas longitudes que el <path>.
 */

export const VIEWBOX_ESPIRAL = { w: 400, h: 480 } as const;

const CX = 200;
const CY = 252;
export const CENTRO = { x: CX, y: CY } as const;
/** Arranca arriba y gira en sentido horario (sentido de lectura). */
const ANGULO_INICIAL = -Math.PI / 2;
/** Un cuarto de vuelta por estación. */
const PASO = Math.PI / 2;
/** Radio en la primera estación y crecimiento por estación. */
const RADIO_0 = 44;
const RADIO_PASO = 19;
/** Muestras por cuarto de vuelta (polilínea suave). */
const MUESTRAS_POR_PASO = 24;

export const ESTACIONES = 8;

const radio = (theta: number) => RADIO_0 + RADIO_PASO * (theta / PASO);

function punto(theta: number): readonly [number, number] {
  const a = ANGULO_INICIAL + theta;
  const r = radio(theta);
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
}

/** Los ocho nodos (estaciones), del centro hacia afuera. */
export const NODOS: ReadonlyArray<readonly [number, number]> = Array.from(
  { length: ESTACIONES },
  (_, k) => punto(k * PASO),
);

/** Polilínea de la espiral: del nodo 0 al nodo 7. */
const MUESTRAS: ReadonlyArray<readonly [number, number]> = Array.from(
  { length: (ESTACIONES - 1) * MUESTRAS_POR_PASO + 1 },
  (_, i) => punto((i / MUESTRAS_POR_PASO) * PASO),
);

const f = (n: number) => n.toFixed(1);

export const PATH_ESPIRAL = MUESTRAS.map(
  ([x, y], i) => `${i === 0 ? "M" : "L"}${f(x)} ${f(y)}`,
).join(" ");

/** Longitud acumulada de la polilínea en cada nodo (misma métrica que
 *  getTotalLength() del <path>, porque el path ES esta polilínea). */
export const LONGITUD_NODO: ReadonlyArray<number> = (() => {
  const acumulada: number[] = [0];
  let total = 0;
  for (let i = 1; i < MUESTRAS.length; i++) {
    const [ax, ay] = MUESTRAS[i - 1];
    const [bx, by] = MUESTRAS[i];
    total += Math.hypot(bx - ax, by - ay);
    if (i % MUESTRAS_POR_PASO === 0) acumulada.push(total);
  }
  return acumulada;
})();

export const LARGO_ESPIRAL = LONGITUD_NODO[ESTACIONES - 1];

/** Radio de los nodos y del personaje (unidades del viewBox). */
export const RADIO_NODO = 7;
export const RADIO_PERSONAJE = 10;

/** Posición del rótulo de cada nodo: afuera de la espiral, en la normal. */
export function rotuloNodo(k: number): readonly [number, number] {
  const [x, y] = NODOS[k];
  const dx = x - CX;
  const dy = y - CY;
  const d = Math.hypot(dx, dy) || 1;
  return [x + (dx / d) * 22, y + (dy / d) * 22];
}

/**
 * El lazo de retorno: del último nodo (afuera, a la izquierda) vuelve al
 * primero (arriba, en el centro) por afuera de la espiral, entrando desde
 * arriba. Curva cúbica.
 */
export const PATH_LAZO = (() => {
  const [x0, y0] = NODOS[ESTACIONES - 1];
  const [x1, y1] = NODOS[0];
  return `M${f(x0)} ${f(y0)} C ${f(x0 - 6)} ${f(y0 - 150)}, ${f(x1 - 60)} ${f(y1 - 120)}, ${f(x1)} ${f(y1)}`;
})();

/** Estación en la que arranca la segunda vuelta (la bisagra). */
export const BISAGRA = 4;
