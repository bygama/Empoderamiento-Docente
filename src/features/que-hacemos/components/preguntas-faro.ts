import type { CSSProperties } from "react";

/**
 * Las preguntas con las que empieza cada proyecto.
 *
 * ANTES esta escena mostraba los cinco VERBOS del método (Dialogamos,
 * Investigamos, Diseñamos, Implementamos, Evaluamos) bajo el rótulo «Cómo
 * trabajamos» — que es, textual, el título de una sección que viene más
 * abajo en esta misma página y cuenta lo mismo. La escena resumía el
 * contenido que la seguía.
 *
 * Ahora se queda solo con las preguntas: la escena PREGUNTA y las secciones
 * de abajo RESPONDEN. Es lo que el faro hace de verdad —alumbrar para ver
 * qué hay— y no le pisa el texto a nadie.
 */
export const PREGUNTAS: ReadonlyArray<{ antes: string; clave: string; resto: string }> = [
  // La primera es la TESIS —las otras cuatro se desprenden de ella— y por
  // eso es la líder: más grande y más ancha (ver el JSX). Cada pregunta
  // lleva UNA palabra clave con el marcador de concepto del sitio (celeste
  // + subrayado verde, pintado por la luz cuando el haz la alcanza): antes
  // eran cinco bloques blancos idénticos y se leían planos.
  { antes: "¿Qué se quiere ", clave: "transformar", resto: " y por qué?" },
  { antes: "¿Qué sabemos de este problema y qué necesitamos ", clave: "comprender", resto: " mejor?" },
  { antes: "¿Qué puede producir un ", clave: "cambio real", resto: " en este contexto?" },
  { antes: "¿Qué está ocurriendo y qué necesitan ", clave: "quienes lo sostienen", resto: "?" },
  { antes: "¿Qué ", clave: "aprendimos", resto: " y qué puede sostener el equipo hacia adelante?" },
];

/** Posición del bloque de texto de cada verbo (viewport, desktop). */
export const VERBO_POS: ReadonlyArray<CSSProperties> = [
  // La líder es más alta (dos líneas grandes): arranca más arriba para que
  // su pie quede lejos del horizonte.
  { left: "8%", top: "33%" },
  { left: "11%", top: "18%" },
  { right: "6%", top: "15%", textAlign: "right" },
  { right: "9%", top: "55%", textAlign: "right" },
  { left: "50%", bottom: "18%", transform: "translateX(-50%)", textAlign: "center" },
];

/** Ángulo del haz por verbo (izq = óptica izquierda, der = derecha). */
export const HAZ_VERBO: ReadonlyArray<{ lado: "izq" | "der"; rot: number }> = [
  { lado: "izq", rot: -21 },
  { lado: "izq", rot: -13 },
  { lado: "der", rot: 42 },
  { lado: "der", rot: 59 },
  { lado: "izq", rot: -58 },
];
