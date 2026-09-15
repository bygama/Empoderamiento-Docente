import type { MouseEvent } from "react";
import { MIRADA } from "@/features/que-hacemos/areas";
import { irAPosicion } from "@/lib/indice";
import { flujoDesdeSeccion, topeDeCard } from "./medidas";

/**
 * El paso a paso de «Cómo trabajamos», en la franja del título.
 *
 * POR QUÉ EXISTE (el usuario, 2026-09-15: «que arriba esto también esté en
 * desktop, se pueda ver como el paso a paso de esos, así guía»). En una
 * notebook los paneles van en dos grupos de tres y el segundo se come al
 * primero, así que las cabeceras acumuladas dejan de contar el recorrido
 * completo: sin esto, en «Acompañar» no queda nada que diga que pasaste por
 * Escuchar, Investigar y Diseñar. El indicador lo devuelve, y en desktop
 * —donde los seis sí se apilan juntos— suma el recorrido de un vistazo.
 *
 * Y SE PUEDE APRETAR (el usuario, 2026-09-15: «estaría bueno que fuera más
 * interactiva» y que «lleve por animación»): cada paso VIAJA hasta donde ese
 * panel queda trabado, con el deslizamiento del sitio —el mismo de los CTA de
 * los heros: Lenis, easeInOutCubic y la duración por distancia de
 * `lib/indice`—, así se navega entre los seis.
 *
 * Acá el viaje sí se ve, y es a propósito: mientras vuela, los paneles del
 * medio se apilan y el riel se va llenando, o sea que el recorrido se lee en
 * vez de teletransportarse. Es la excepción a la regla del 2026-09-14, cuando
 * la navegación POR SECCIONES pasó a cortar (Facundo: «cada vez que apretás te
 * comés todo el scroll y las animaciones, queda rarísimo»): ahí el salto cruza
 * escenas ajenas que arrancan a mitad de camino, y acá se mueve DENTRO de una
 * sola, cuya animación es justo lo que se quiere mostrar. Con reduced-motion
 * no hay Lenis y el viaje corta solo.
 *
 * El riel se LLENA —verde lo recorrido, gris lo que falta—, el mismo idioma
 * que el índice de «Áreas de especialización» (ver AreasQueHacemos): las dos
 * secciones dicen «vas por acá» de la misma forma.
 *
 * Sin JS se lee igual, marcando el primer paso: el estado lo mueve
 * `coreografia-indicador.ts` con el atributo `data-estado`, nunca estado de
 * React, así el scroll no dispara renders.
 *
 * Sólo en desktop: en celular no hay apilado ni franja, los seis paneles se
 * leen uno abajo del otro y no hay nada que guiar.
 */

/**
 * Salta a donde el panel `indice` queda trabado: su lugar en el flujo menos el
 * `top` con el que se traba, los dos medidos del layout.
 *
 * Los 4px de más son los mismos que usa el ancla de la sección: cayendo justo
 * en el borde de un ScrollTrigger, todavía no cuenta como cruzado, y el
 * indicador quedaba marcando el paso anterior al que se apretó. Y el piso es
 * el arranque de la sección, porque el primer panel se traba ANTES de que la
 * sección llegue arriba: sin el piso, apretar «01» aterrizaba afuera y la
 * entrada se rebobinaba.
 *
 * `irAPosicion` sin `corte` desliza; con Lenis ya andando, apretar otro paso a
 * mitad de viaje lo redirige (`force: true`), no lo encola.
 */
function alClicEnPaso(indice: number) {
  return (e: MouseEvent<HTMLButtonElement>) => {
    const raiz = e.currentTarget.closest<HTMLElement>("[data-mirada]");
    const card = raiz?.querySelectorAll<HTMLElement>("[data-mirada-card]")[indice];
    if (!raiz || !card) return;
    const arriba = raiz.getBoundingClientRect().top + window.scrollY;
    const trabado = arriba + flujoDesdeSeccion(card) - topeDeCard(card);
    irAPosicion(Math.max(arriba, trabado) + 4);
  };
}

export function IndicadorPasos() {
  return (
    <ol
      data-mirada-indicador
      aria-label="Los seis pasos, y dónde va la lectura"
      className="hidden lg:ml-auto lg:flex lg:items-end lg:gap-5 xl:gap-7"
    >
      {MIRADA.map((paso, i) => (
        <li key={paso.verbo}>
          <button
            type="button"
            data-mirada-paso={i}
            data-estado={i === 0 ? "activo" : "pendiente"}
            onClick={alClicEnPaso(i)}
            className="focus-visible:outline-verde-concepto group/paso flex w-full cursor-pointer flex-col gap-1.5 rounded-sm text-left focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            <span className="group-data-[estado=activo]/paso:text-azul-principal group-data-[estado=pendiente]/paso:text-gris-texto group-data-[estado=recorrido]/paso:text-azul-principal/55 group-hover/paso:text-azul-principal flex items-baseline gap-1.5 font-sans text-[0.78rem] leading-none transition-colors duration-500 group-data-[estado=activo]/paso:font-semibold motion-reduce:transition-none">
              <span aria-hidden="true" className="font-mono text-[0.68rem] tabular-nums opacity-70">
                0{i + 1}
              </span>
              {paso.verbo}
            </span>
            {/* El riel: 2px que se pintan de verde cuando el paso ya pasó. */}
            <span className="group-data-[estado=activo]/paso:bg-verde-concepto group-data-[estado=pendiente]/paso:bg-azul-principal/15 group-data-[estado=recorrido]/paso:bg-verde-concepto/45 group-hover/paso:bg-verde-concepto/70 h-0.5 w-full rounded-full transition-colors duration-500 motion-reduce:transition-none" />
          </button>
        </li>
      ))}
    </ol>
  );
}
