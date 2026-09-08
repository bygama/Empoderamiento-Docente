import { PREGUNTAS } from "./preguntas-faro";

/* ── Escala de tiempo de la coreografía ────────────────────────────────────
 *
 * Las preguntas (S2) se ESTIRARON. Con beats de ~0.062 cada pregunta quedaba
 * plenamente legible apenas 0.01 (≈6vh, dos muescas de rueda) y el tramo
 * pasaba entero en un envión: era imposible scrollear sin que se fuera todo.
 * Ahora cada beat dura PASO_PREGUNTA y lo que viene después (cierre y
 * deslumbre) corre CORRIMIENTO en bloque, sin cambiar de velocidad.
 *
 * Para que S0 y S1 no se hagan más lentos, el runway (h-[…vh] del <section>)
 * crece en la misma proporción: alto = DURACION_RECORRIDO · 620vh + 200vh
 * (los 200 son la pantalla que corre detrás del hero y la del viewport).
 * Si se toca una cosa, se toca la otra. */
const INICIO_PREGUNTAS = 0.4;
// 0.30 ≈ 1.8 pantallas por pregunta. Con 0.15 un scroll chico sin querer
// pasaba dos títulos de largo.
export const PASO_PREGUNTA = 0.3;
/** Un beat por pregunta. */
export const BEATS = PREGUNTAS.map((_, i) => INICIO_PREGUNTAS + i * PASO_PREGUNTA);
/**
 * La última pregunta dura lo mismo que las otras: se va 0.03 antes de donde
 * caería un beat siguiente. Con +0.06 (herencia de cuando los beats medían
 * 0.062) quedaba plena 0.01 (≈6vh): aparecía, se iba al toque y el
 * subrayado no llegaba a pintarse.
 */
export const FIN_PREGUNTAS = BEATS[BEATS.length - 1] + PASO_PREGUNTA - 0.03;
/** En la coreografía original S2 terminaba en 0.73; de ahí el corrimiento. */
export const CORRIMIENTO = FIN_PREGUNTAS - 0.73;
/** Posición original (post-S2) → posición actual. */
export const despues = (t: number) => t + CORRIMIENTO;
/**
 * Duración total de la línea de tiempo. Quien convierta una posición a
 * progreso del runway (por ejemplo el viaje del botón del hero) divide por
 * esto.
 */
export const DURACION_RECORRIDO = despues(1);
