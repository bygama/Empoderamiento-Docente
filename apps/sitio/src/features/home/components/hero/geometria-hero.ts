/**
 * La geometría del campo de tarjetas del hero: dónde va cada una, de qué
 * tamaño y con qué parallax. Es estructura, no contenido: vive en código y no
 * se edita desde el admin (SPEC §1). Las fotos y los carteles están en
 * `features/home/contenido/hero.ts`, en el mismo orden; la cantidad de
 * tarjetas del esquema sale del largo de estas listas.
 *
 * Réplica del campo de imágenes de blueprintapps.io: medidas del original
 * como fracción del viewport (su rem = 100vw/1728), sin rotación.
 */
export type Geometria = {
  /** ancho como % del viewport (designRem / 1728 * 100). */
  w: number;
  /** relación de aspecto ancho/alto (CSS aspect-ratio). */
  ar: string;
  /** centro X como % del ancho del hero. */
  cx: number;
  /** centro Y: % del alto del hero en desktop, svh en mobile. */
  cy: number;
  /** factor de parallax de scroll medido en el original (>1 = adelanta). */
  par: number;
  /** `"derecha"` ancla el cartel al borde derecho de la foto: para las
   *  tarjetas pegadas al margen derecho, donde si no el cartel se sale de pantalla. */
  cartelA?: "derecha";
};

// Desktop (≥ lg): las 9 del original más dos sumadas para llenar el vacío de
// abajo y "bajar" hacia Acerca de. La primera ya no va donde la tenía el
// original (más grande, arriba al centro): ahí la tapaba la píldora del
// navbar, que no se esconde. Más chica y en la esquina, queda al costado.
export const GEOMETRIA_CARDS: readonly Geometria[] = [
  { w: 13, ar: "300 / 250", cx: 9, cy: 8, par: 1.027 },
  { w: 12.73, ar: "220 / 280", cx: 81.6, cy: 16.07, par: 1.108 },
  { w: 13.89, ar: "240 / 320", cx: 91, cy: 26.85, par: 1.014, cartelA: "derecha" },
  { w: 12.73, ar: "220 / 260", cx: 5.21, cy: 25.01, par: 1.068 },
  { w: 16.2, ar: "280 / 240", cx: 16.2, cy: 44.61, par: 1.034 },
  { w: 19.68, ar: "340 / 260", cx: 72.92, cy: 55.71, par: 1.007 },
  { w: 14.47, ar: "250 / 320", cx: 24.59, cy: 71.16, par: 1.088 },
  { w: 19.68, ar: "340 / 250", cx: 53.24, cy: 84.82, par: 1.024 },
  { w: 9.84, ar: "170 / 230", cx: 85.94, cy: 93.84, par: 1.068 },
  { w: 14, ar: "300 / 210", cx: 50, cy: 64, par: 1.04 },
  { w: 13, ar: "240 / 300", cx: 11, cy: 84, par: 1.07 },
];

// Celular y tablet (< lg): las fotos van EN EL FLUJO, en dos bandas atadas
// al texto (`BandaFotosMovil`), para que nunca pisen los botones sea cual sea
// el alto de la pantalla. `celular` es el lugar de la foto en «Tarjetas
// (celular)» y `cartelDe`, la tarjeta de computadora cuyo cartel lleva: dos,
// en diagonal. Sin coordenadas: el lugar lo da el flex.
export type HuecoMovil = {
  /** ancho ideal como % del viewport; el alto disponible puede achicarla. */
  w: number;
  /** ancho / alto, en número: el tamaño se calcula desde el alto. */
  ar: number;
  celular: number;
  cartelDe?: number;
};

export const BANDA_ARRIBA_MOVIL: readonly HuecoMovil[] = [
  { w: 38, ar: 300 / 250, celular: 0, cartelDe: 0 },
  { w: 34, ar: 300 / 230, celular: 1 },
];
export const BANDA_ABAJO_MOVIL: readonly HuecoMovil[] = [
  { w: 36, ar: 300 / 210, celular: 7 },
  { w: 40, ar: 340 / 260, celular: 3, cartelDe: 5 },
];

// Al bajar, los otros cuatro conceptos de a uno, en zigzag y con el cartel
// completo: son tarjetas de computadora con cartel (`tarjeta`, su lugar en
// «Tarjetas (computadora)»), con su foto y su texto. En escritorio se leen
// todos juntos; acá la dimensión es el scroll.
export type ConceptoMovil = { w: number; ar: number; tarjeta: number };
export const CONCEPTOS_MOVIL: readonly ConceptoMovil[] = [
  { w: 56, ar: 280 / 240, tarjeta: 4 },
  { w: 42, ar: 240 / 300, tarjeta: 2 },
  { w: 58, ar: 340 / 250, tarjeta: 7 },
  { w: 42, ar: 240 / 300, tarjeta: 10 },
];

/** Cuántas fotos guarda «Tarjetas (celular)»: el largo que ya tiene el contenido guardado. */
export const TARJETAS_CELULAR = 8;
