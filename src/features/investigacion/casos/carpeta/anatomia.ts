import type { TinteCarpeta } from "../data";
import type { TINTES } from "../tintes";

/** Clases de un tinte de carpeta (ver `tintes.ts`). */
export type Tinte = (typeof TINTES)[TinteCarpeta];

/** Grosor de la tapa en desktop: padding arriba y abajo (ver PESO_TAPA). */
export type Peso = { pt: string; pb: string };

/**
 * Puntas de papel asomando de la boca de cada carpeta: la pista de que
 * adentro hay documentos. En hover se sueltan un poco más, junto con las
 * hojas de adentro. Composición irregular por carpeta — anchos, alturas y
 * rotaciones levemente distintos, como hojas mal guardadas. Todas
 * arrancan en left ≥62%; con las pestañas en desorden alguna cae ahí
 * abajo, pero la pestaña va en z-0 y el papel en z-[8]: el papel tapa la
 * base de la pestaña, que es justo donde se funde con la tapa. z-[8] es
 * sobre el lomo y los slivers, y bajo el clip de la hoja (z-10) y la
 * tapa (z-20) — la base del papel queda "adentro".
 */
export const PAPELES: readonly (readonly string[])[] = [
  [
    "left-[63%] -top-[8px] h-4 w-20 rotate-[0.8deg] bg-white/95",
    "left-[71%] -top-[6px] h-3.5 w-12 -rotate-[1.2deg] bg-white/75",
    "left-[84%] -top-[9px] h-4 w-24 rotate-[0.3deg] bg-white/90",
  ],
  [
    "left-[66%] -top-[9px] h-4 w-24 -rotate-[0.6deg] bg-white/95",
    "left-[81%] -top-[6px] h-3.5 w-14 rotate-[1.1deg] bg-white/80",
  ],
  [
    "left-[62%] -top-[7px] h-3.5 w-14 rotate-[1deg] bg-white/85",
    "left-[70%] -top-[9px] h-4 w-24 -rotate-[0.8deg] bg-white/95",
    "left-[86%] -top-[6px] h-3.5 w-12 -rotate-[0.4deg] bg-white/75",
  ],
  [
    "left-[64%] -top-[9px] h-4 w-16 -rotate-[0.9deg] bg-white/90",
    "left-[75%] -top-[6px] h-3.5 w-24 rotate-[0.5deg] bg-white/95",
    "left-[88%] -top-[8px] h-4 w-10 rotate-[1.3deg] bg-white/80",
  ],
];

/**
 * Peso de cada carpeta en desktop: la pila es más gruesa hacia abajo (01
 * fina, 03 gruesa), como carpetas apiladas de verdad. Solo padding: la
 * banda visible de una carpeta cubierta es el alto total de su tapa, así
 * que el padding ES el grosor. La última no usa `pb`: conserva su base.
 */
export const PESO_TAPA: readonly Peso[] = [
  { pt: "lg:pt-8", pb: "lg:pb-8" },
  { pt: "lg:pt-10", pb: "lg:pb-10" },
  { pt: "lg:pt-12", pb: "lg:pb-12" },
];
