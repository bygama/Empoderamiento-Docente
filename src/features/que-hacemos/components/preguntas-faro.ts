import type { CSSProperties } from "react";

/**
 * Las frases del enfoque: por qué esto no es una capacitación tradicional.
 *
 * En el sitemap aprobado, lo que sigue al hero de «Qué hacemos» es «Nuestro
 * enfoque», y esta escena es lo que ocupa ese lugar. ANTES mostraba las
 * cinco preguntas del método («¿Qué se quiere transformar y por qué?»…),
 * que es lo mismo que dice «Cómo trabajamos» con sus seis verbos una
 * pantalla más abajo: el método se contaba dos veces y el enfoque, ninguna.
 * El cliente (2026-09-08) dijo que la web se ve espectacular pero no se
 * entiende qué hace ED; con esto la página queda en el orden qué es (la
 * frase del cartel, S1) → por qué distinto (estas cuatro) → cómo (los
 * verbos) → qué (las siete áreas).
 *
 * Salen de la devolución de Dani (junio de 2026): «no formamos, se trata de
 * una transformación educativa», «partimos de lo que hay para potenciar, no
 * desde lo que falta», «no proponemos enlatados: se piensa cada propuesta
 * contemplando el contexto», «información confiable, con estudio detrás».
 * Dichas llano, sin la jerga: «Nada enlatado» y el «investigamos lo que
 * hacemos, hacemos lo que investigamos» del pie quedaban mal en pantalla
 * (Facundo, 2026-09-10). La primera es la que ya dice el Inicio. Marcadas
 * VALIDAR con ED igual que el titular del cierre.
 *
 * Los nombres (PREGUNTAS, «verbo» en los data-attributes y en la
 * geometría) vienen de las dos versiones anteriores de la escena; se dejan
 * para no tocar la coreografía.
 */
export const PREGUNTAS: ReadonlyArray<{ antes: string; clave: string; resto: string }> = [
  // La primera es la TESIS —las otras tres se desprenden de ella— y por eso
  // es la líder: más grande y más ancha (ver el JSX). Cada frase lleva UNA
  // palabra clave con el marcador de concepto del sitio (celeste +
  // subrayado verde, pintado por la luz cuando el haz la alcanza).
  { antes: "No capacitamos docentes: ", clave: "transformamos", resto: " la relación con las matemáticas." },
  { antes: "Partimos de ", clave: "lo que hay", resto: ", no de lo que falta." },
  { antes: "Cada propuesta se diseña para su ", clave: "contexto", resto: "." },
  { antes: "Todo lo que hacemos tiene ", clave: "investigación", resto: " detrás." },
];

/** Posición del bloque de texto de cada frase (viewport, desktop). */
export const VERBO_POS: ReadonlyArray<CSSProperties> = [
  // La líder es más alta (tres líneas grandes): arranca más arriba para que
  // su pie quede lejos del horizonte.
  { left: "8%", top: "30%" },
  { left: "11%", top: "18%" },
  { right: "6%", top: "15%", textAlign: "right" },
  { left: "50%", bottom: "18%", transform: "translateX(-50%)", textAlign: "center" },
];

/**
 * Óptica que alumbra cada frase (izq = óptica izquierda, der = derecha) y
 * el ángulo de respaldo si no se puede medir el bloque (ver haz-faro.ts).
 */
export const HAZ_VERBO: ReadonlyArray<{ lado: "izq" | "der"; rot: number }> = [
  { lado: "izq", rot: -21 },
  { lado: "izq", rot: -13 },
  { lado: "der", rot: 42 },
  { lado: "izq", rot: -58 },
];
