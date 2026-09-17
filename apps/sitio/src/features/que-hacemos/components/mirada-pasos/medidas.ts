/**
 * De dónde saca cada coreografía las posiciones de la pila.
 *
 * Las dos reglas que hay que respetar acá, y que costaron:
 *
 * 1. LAS POSICIONES SE MIDEN DESDE LA SECCIÓN, no de los elementos trabados:
 *    un sticky trabado le miente a ScrollTrigger sobre dónde está, así que el
 *    corrimiento de cada card se suma a mano sobre el `offsetTop` de su lista
 *    —que no se traba y no miente—, y los altos y el aire salen del layout.
 *    Con eso, un cambio de copy o de alto se recalcula solo en el refresh.
 *
 * 2. LAS MEDIDAS NO SE REARMAN CON CONSTANTES: dependen del alto de la
 *    pantalla (globals.css), así que el `top` con el que una card se traba se
 *    LEE del CSS. Una copia en JS se desincroniza sin avisar, y ya pasó: con
 *    las constantes en la mano, en una notebook el final del tramo del
 *    achicado caía abajo del borde del viewport y los textos se achicaban
 *    todos juntos (el usuario, 2026-09-15).
 */

/** El `top` con el que la card se traba, en px: lo calculó el CSS con las
 *  medidas de la pila y el lugar de la card en su grupo. */
export function topeDeCard(card: HTMLElement) {
  return parseFloat(getComputedStyle(card).top) || 0;
}

/** Dónde arranca una card en el FLUJO, medida desde el borde de la sección:
 *  el `offsetTop` de su grupo más las cards que tiene antes dentro de él, con
 *  el aire (`gap`) que la lista pone entre ellas. El `offsetTop` del grupo ya
 *  trae el margen negativo con el que sube por encima del grupo anterior. */
export function flujoDesdeSeccion(card: HTMLElement) {
  const lista = card.parentElement;
  if (!lista) return 0;

  const estilo = getComputedStyle(lista);
  const aire = parseFloat(estilo.rowGap) || 0;
  const hermanas = Array.from(lista.children).filter((h): h is HTMLElement =>
    h instanceof HTMLElement && h.hasAttribute("data-mirada-card"),
  );

  return (
    lista.offsetTop +
    parseFloat(estilo.paddingTop) +
    hermanas
      .slice(0, hermanas.indexOf(card))
      .reduce((suma, c) => suma + c.offsetHeight + aire, 0)
  );
}
