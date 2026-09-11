import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SOLAPA_REM, TITULO_REM, TOPE_REM } from "./PanelMirada";

gsap.registerPlugin(ScrollTrigger);

/**
 * El texto de cada card se achica antes de que la siguiente lo tape (el
 * usuario, 2026-09-11). En reposo el bloque de idea y texto descansa en el
 * pie de la card; cuando el borde de arriba de la card siguiente asoma por
 * el pie del viewport, el bloque sube y se achica —solo transform, origen
 * arriba a la izquierda— hasta quedar pegado a la cabecera a escala
 * COMPACTA, y recién ahí lo tapan. Para la última card, la «siguiente» es
 * la banda de aliados.
 *
 * Va scrubbed: el comido es por scroll, y si el achicado fuera por tiempo,
 * scrolleando rápido la card llegaría antes y taparía el texto a mitad de
 * viaje. El tramo arranca cuando la siguiente asoma por el pie del viewport
 * y termina cuando llega al borde del bloque en reposo: unos 240px, y con
 * la demora del scrub más larga que la mínima, para que se sienta lento (el
 * usuario, 2026-09-11: «más smooth»). Que la segunda card no asome ya en el
 * relevo con el faro —y la primera se vea en reposo— lo garantiza el aire
 * entre cards que pone la pila (ver MiradaPasos).
 *
 * Las posiciones se calculan desde la SECCIÓN, no desde los elementos
 * sticky, que trabados le mienten a ScrollTrigger sobre dónde están: el
 * corrimiento de cada card se suma a mano, y la posición de reposo del
 * bloque se mide del layout, así que un cambio de copy o de alto se
 * recalcula solo en el refresh.
 *
 * Sin nada de esto en celular ni con reduced-motion: el bloque queda en
 * reposo, abajo. El `will-change` lo pone y lo saca esta coreografía, nunca
 * un className (AI_GUIDELINES §11).
 */

/** Escala del bloque cuando ya está pegado a la cabecera. */
const COMPACTO = 0.8;
/** Aire entre la cabecera y el bloque compacto, en rem. */
const AIRE_REM = 1;

export function crearAchicado(root: HTMLElement) {
  const mm = gsap.matchMedia();

  mm.add(
    {
      desktop: "(min-width: 1024px)",
      reducido: "(prefers-reduced-motion: reduce)",
    },
    (contexto) => {
      const { desktop, reducido } = contexto.conditions as {
        desktop: boolean;
        reducido: boolean;
      };
      if (!desktop || reducido) return;

      const pila = root.querySelector<HTMLElement>("[data-mirada-pila]");
      const banda = root.querySelector<HTMLElement>("[data-mirada-banda]");
      const cards = gsap.utils.toArray<HTMLElement>("[data-mirada-card]", root);
      if (!pila || !banda || !cards.length) return;

      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);

      /** Dónde arranca la card `i`, medida desde el borde de la sección: las
       *  anteriores más el aire (`gap`) que la pila pone entre ellas. Sumado
       *  a mano y no leído del `offsetTop` de la card, que trabada ya viene
       *  corrido. */
      const cardDesdeSeccion = (i: number) => {
        const estilo = getComputedStyle(pila);
        const aire = parseFloat(estilo.rowGap) || 0;
        return (
          pila.offsetTop +
          parseFloat(estilo.paddingTop) +
          cards.slice(0, i).reduce((suma, c) => suma + c.offsetHeight + aire, 0)
        );
      };

      const bloques = cards.flatMap((card, i) => {
        const bloque = card.querySelector<HTMLElement>("[data-mirada-texto]");
        const cabecera = card.firstElementChild as HTMLElement | null;
        if (!bloque || !cabecera) return [];

        const siguienteDesdeSeccion = () =>
          i + 1 < cards.length ? cardDesdeSeccion(i + 1) : banda.offsetTop;
        /** Borde de arriba del bloque en reposo, con la card trabada. */
        const reposoEnPantalla = () =>
          (TOPE_REM + TITULO_REM + i * SOLAPA_REM) * rem + bloque.offsetTop;
        /** Cuánto sube para quedar pegado a la cabecera. */
        const subida = () => -(bloque.offsetTop - (cabecera.offsetHeight + AIRE_REM * rem));

        gsap.fromTo(
          bloque,
          { y: 0, scale: 1, transformOrigin: "0 0" },
          {
            y: subida,
            scale: COMPACTO,
            ease: "none",
            immediateRender: false,
            scrollTrigger: {
              trigger: root,
              start: () => `top+=${siguienteDesdeSeccion()} bottom`,
              end: () => `top+=${siguienteDesdeSeccion()} ${reposoEnPantalla()}px`,
              // scrub con demora, nunca `true` (AGENTS §8); más que la mínima
              // para que el texto llegue lento, como el faro (0.85).
              scrub: 0.85,
              invalidateOnRefresh: true,
            },
          },
        );
        return [bloque];
      });

      gsap.set(bloques, { willChange: "transform" });

      return () => {
        gsap.set(bloques, { clearProps: "transform,willChange" });
      };
    },
  );

  return () => {
    mm.revert();
    ScrollTrigger.refresh();
  };
}
