/**
 * Bultos de cada silueta de nube: centro (% del cajón), radios (% del cajón)
 * y densidad. Pocos, grandes y muy solapados: la masa se lee entera, con
 * bordes irregulares, y no como óvalos sueltos. Todo bulto muere bien
 * adentro de su cajón (ver `fondoNube`): ningún recorte recto. Un mismo
 * dibujo a distinto tamaño, giro y lugar no se reconoce como repetido.
 */
const SILUETAS = {
  cumuloA: [
    [50, 64, 46, 26, 0.5],
    [30, 48, 26, 32, 0.55],
    [50, 38, 28, 36, 0.6],
    [70, 46, 26, 32, 0.55],
    [22, 66, 22, 22, 0.4],
  ],
  cumuloB: [
    [48, 66, 46, 24, 0.5],
    [28, 50, 24, 30, 0.5],
    [48, 36, 28, 38, 0.6],
    [68, 44, 26, 32, 0.55],
    [82, 60, 20, 22, 0.4],
  ],
  mediana: [
    [50, 62, 44, 24, 0.45],
    [32, 46, 24, 32, 0.5],
    [54, 36, 26, 36, 0.55],
    [74, 50, 22, 28, 0.45],
    [20, 62, 20, 22, 0.35],
  ],
  jiron: [
    [50, 52, 46, 22, 0.4],
    [30, 46, 24, 26, 0.35],
    [64, 44, 26, 28, 0.4],
    [82, 56, 18, 18, 0.28],
  ],
  // La banda que vela el faro: ancha, y más densa que lo que le tocaría
  // por distancia, porque un velo tenue no envuelve nada.
  banda: [
    [50, 62, 46, 24, 0.6],
    [22, 50, 22, 30, 0.55],
    [42, 42, 26, 34, 0.65],
    [66, 46, 26, 32, 0.6],
    [84, 56, 16, 22, 0.45],
  ],
} as const satisfies Record<string, ReadonlyArray<readonly [number, number, number, number, number]>>;

/**
 * Las nubes del descenso: la capa más cercana a la cámara. La hoja llega
 * metida en ellas y, al pinnearse, la cámara baja un buen rato entre nubes
 * antes de que el faro asome; las nubes suben y se van en primer plano y
 * el faro sube a su encuentro adentro de la última. Es un CAMPO fijo en el
 * espacio: cada nube tiene su lugar (`y` más allá del 100 para las que
 * esperan bajo el piso) y todas se mueven con la misma cámara, cada una a
 * la velocidad de su profundidad (`cerca`, 0–1: las cercanas, más grandes
 * y densas, viajan más rápido; las lejanas, más claras, más lento). `giro`
 * saca la masa del eje. Solo existen en la coreografía: el SSR dibuja el
 * final, y ahí ya pasaron.
 */
export type Nube = {
  /** Cajón: esquina (% del escenario), ancho (% del ancho) y alto (% del alto). */
  x: number;
  y: number;
  w: number;
  h: number;
  cerca: number;
  giro: number;
  silueta: keyof typeof SILUETAS;
};

/** Tinta de una nube: azul-medio, más claro cuanto más lejos, con su alfa. */
const tintaNube = (cerca: number, alfa: number) =>
  `color-mix(in srgb, color-mix(in srgb, var(--color-azul-claro) ${Math.round(18 + (1 - cerca) * 30)}%, var(--color-azul-medio)) ${Math.round(alfa * 100)}%, transparent)`;

/**
 * Los bultos apilados como capas de fondo. Interior parejo (la tinta se
 * sostiene hasta el 36% del radio) y caída larga hasta transparente en el
 * 72%: con bultos grandes y muy solapados, la masa se lee entera —una
 * silueta con bordes irregulares— y no como óvalos sueltos.
 */
export function fondoNube(n: Nube) {
  return SILUETAS[n.silueta]
    .map(([cx, cy, rx, ry, a]) => {
      const d = a * (0.65 + 0.4 * n.cerca);
      return `radial-gradient(ellipse ${rx}% ${ry}% at ${cx}% ${cy}%, ${tintaNube(n.cerca, d)} 0%, ${tintaNube(n.cerca, d * 0.9)} 36%, ${tintaNube(n.cerca, d * 0.45)} 58%, transparent 72%)`;
    })
    .join(", ");
}
