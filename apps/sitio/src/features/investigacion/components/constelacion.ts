/**
 * Datos de la constelación del hero: los MISMOS 13 puntos reordenados en
 * cuatro figuras — la gramática de las láminas de «La mirada ED» del cliente
 * (signo de pregunta de puntos, lupa sobre grilla, red en sistema, espiral).
 * Un solo punto naranja («personaje», índice 12) recorre las cuatro figuras:
 * punto final de la pregunta → punta del mango de la lupa → nodo central de
 * la red → extremo abierto de la espiral.
 */

export const VIEWBOX = { w: 400, h: 480 } as const;

export const PERSONAJE = 12;

/** Color y radio fijos por punto (persisten a través de los morphs). */
export const PUNTOS: ReadonlyArray<{ color: string; r: number }> = [
  { color: "var(--color-azul-medio)", r: 6 },
  { color: "var(--color-verde-concepto)", r: 6.5 },
  { color: "var(--color-azul-medio)", r: 5.5 },
  { color: "var(--color-azul-medio)", r: 6 },
  { color: "var(--color-verde-concepto)", r: 6 },
  { color: "var(--color-azul-medio)", r: 5.5 },
  { color: "var(--color-azul-claro)", r: 6 },
  { color: "var(--color-azul-medio)", r: 6.5 },
  { color: "var(--color-verde-concepto)", r: 5.5 },
  { color: "var(--color-azul-medio)", r: 6 },
  { color: "var(--color-azul-claro)", r: 5.5 },
  { color: "var(--color-verde-concepto)", r: 6 },
  { color: "var(--color-naranja-accion)", r: 9 },
];

/** Posiciones dispersas de la entrada (datos sueltos antes de formar figura). */
export const DISPERSION: ReadonlyArray<readonly [number, number]> = [
  [56, 96],
  [318, 64],
  [180, 40],
  [352, 210],
  [40, 260],
  [120, 176],
  [300, 150],
  [70, 400],
  [230, 240],
  [340, 330],
  [150, 330],
  [250, 420],
  [200, 208],
];

export type Figura = {
  id: string;
  /** Rótulo mono que acompaña la figura en el loop. */
  etiqueta: string;
  /**
   * Frase del beat en la historia scrolleada del hero. Copy destilado de la
   * bajada del doc maestro (arquitectura-investigacion.md §3) + la idea
   * central de §4; aprobado por el cliente el 31-08-2026.
   */
  frase: string;
  puntos: ReadonlyArray<readonly [number, number]>;
  /** Aristas como pares de índices de puntos. */
  aristas: ReadonlyArray<readonly [number, number]>;
};

/** Signo de pregunta de puntos conectados (lámina «Abrir nuevas preguntas»). */
const PREGUNTA: Figura = {
  id: "pregunta",
  etiqueta: "Preguntar",
  frase: "Todo empieza con un problema real del aula, convertido en pregunta.",
  puntos: [
    [140, 150],
    [154, 110],
    [186, 84],
    [228, 76],
    [268, 88],
    [294, 120],
    [300, 162],
    [284, 202],
    [252, 232],
    [222, 262],
    [212, 298],
    [210, 330],
    [210, 396],
  ],
  aristas: [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 8],
    [8, 9],
    [9, 10],
    [10, 11],
  ],
};

/** Lupa sobre el hallazgo (lámina «Investigación e Intervención»). */
const LUPA: Figura = {
  id: "lupa",
  etiqueta: "Mirar de cerca",
  frase: "Lo estudiamos con rigor: qué ocurre, por qué ocurre y qué significa.",
  puntos: [
    [294, 186],
    [269, 255],
    [205, 292],
    [132, 280],
    [85, 223],
    [85, 149],
    [132, 92],
    [205, 80],
    [269, 117],
    [186, 186],
    [306, 296],
    [336, 326],
    [366, 356],
  ],
  aristas: [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 8],
    [8, 0],
    [1, 10],
    [10, 11],
    [11, 12],
  ],
};

/** Red con nodo central (lámina «Las transformaciones se construyen en sistema»). */
const RED: Figura = {
  id: "red",
  etiqueta: "Relacionar",
  frase: "No investigamos desde afuera: construimos con quienes habitan los contextos educativos.",
  puntos: [
    [200, 108],
    [315, 174],
    [315, 306],
    [200, 372],
    [85, 306],
    [85, 174],
    [200, 174],
    [258, 207],
    [258, 273],
    [200, 306],
    [142, 273],
    [142, 207],
    [200, 240],
  ],
  aristas: [
    [12, 6],
    [6, 0],
    [12, 7],
    [7, 1],
    [12, 8],
    [8, 2],
    [12, 9],
    [9, 3],
    [12, 10],
    [10, 4],
    [12, 11],
    [11, 5],
  ],
};

/** Espiral que se abre (lámina «Transformar es articular dimensiones»). */
const ESPIRAL: Figura = {
  id: "espiral",
  etiqueta: "Transformar",
  frase: "El conocimiento vuelve al aula, la transforma… y abre la próxima pregunta.",
  puntos: [
    [216, 240],
    [215, 266],
    [178, 278],
    [142, 240],
    [165, 178],
    [244, 167],
    [299, 242],
    [254, 339],
    [134, 349],
    [60, 234],
    [127, 104],
    [289, 97],
    [378, 246],
  ],
  aristas: [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 8],
    [8, 9],
    [9, 10],
    [10, 11],
    [11, 12],
  ],
};

export const FIGURAS: ReadonlyArray<Figura> = [PREGUNTA, LUPA, RED, ESPIRAL];

/** Cantidad fija de <line> en el SVG (máximo de aristas entre figuras). */
export const MAX_ARISTAS = FIGURAS.reduce(
  (max, f) => Math.max(max, f.aristas.length),
  0,
);
