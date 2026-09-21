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
};

// Desktop (≥ lg): las 9 del original más dos sumadas para llenar el vacío de
// abajo y "bajar" hacia Acerca de.
export const GEOMETRIA_CARDS: readonly Geometria[] = [
  { w: 17.36, ar: "300 / 250", cx: 31.25, cy: 7.1, par: 1.027 },
  { w: 12.73, ar: "220 / 280", cx: 81.6, cy: 16.07, par: 1.108 },
  { w: 13.89, ar: "240 / 320", cx: 93.75, cy: 26.85, par: 1.014 },
  { w: 12.73, ar: "220 / 260", cx: 5.21, cy: 25.01, par: 1.068 },
  { w: 16.2, ar: "280 / 240", cx: 16.2, cy: 44.61, par: 1.034 },
  { w: 19.68, ar: "340 / 260", cx: 72.92, cy: 55.71, par: 1.007 },
  { w: 14.47, ar: "250 / 320", cx: 24.59, cy: 71.16, par: 1.088 },
  { w: 19.68, ar: "340 / 250", cx: 53.24, cy: 84.82, par: 1.024 },
  { w: 9.84, ar: "170 / 230", cx: 85.94, cy: 93.84, par: 1.068 },
  { w: 14, ar: "300 / 210", cx: 50, cy: 64, par: 1.04 },
  { w: 13, ar: "240 / 300", cx: 11, cy: 84, par: 1.07 },
];

// Mobile/tablet (< lg): pocas fotos, ENTERAS dentro de la pantalla. `cx`
// hacia adentro (25/75) y el ancho clampeado en el componente garantizan que
// cada una entre completa de 320 a 1023 px. `cy` va en svh y no en %: así la
// posición vertical no depende del alto total del hero. Las cuatro primeras
// quedan en el primer pantallazo, en las bandas libres; las otras cuatro se
// ven al scrollear, ya asentadas.
export const GEOMETRIA_MOBILE: readonly Geometria[] = [
  { w: 38, ar: "300 / 250", cx: 25, cy: 22, par: 1 },
  { w: 34, ar: "300 / 230", cx: 75, cy: 22, par: 1 },
  { w: 38, ar: "280 / 240", cx: 25, cy: 87, par: 1 },
  { w: 40, ar: "340 / 260", cx: 75, cy: 87, par: 1 },
  { w: 42, ar: "340 / 250", cx: 31, cy: 112, par: 1 },
  { w: 34, ar: "250 / 320", cx: 73, cy: 117, par: 1 },
  { w: 38, ar: "240 / 300", cx: 28, cy: 139, par: 1 },
  { w: 42, ar: "300 / 210", cx: 72, cy: 143, par: 1 },
];
