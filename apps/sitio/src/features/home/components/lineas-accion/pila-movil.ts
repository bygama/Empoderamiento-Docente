import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Lo que asoma de una carta ya tapada: su renglón de arriba (número + nombre).
const LOMO = 44;
// Nunca más de tres lomos a la vista: con siete áreas, seis lomos se comerían
// la pantalla. Los más viejos se van por arriba, debajo del header.
const LOMOS_MAX = 3;

/**
 * ÁREAS EN CELULAR Y TABLET (< lg): la PILA. El mismo gesto que el abanico de
 * escritorio —las cartas suben de a una y se acomodan una sobre otra—, en
 * vertical: una sola carta abierta por vez; la que sigue sube desde abajo y la
 * tapa, y de la tapada queda a la vista solo el lomo, con su número y su nombre
 * corto. Los lomos dicen cuántas pasaron y cuáles.
 *
 * No se anima ninguna altura: todas las cartas comparten una celda de grilla
 * (miden lo que la más alta, ver `.is-pila` en globals.css) y la de adelante,
 * que es opaca, tapa a la de atrás. Solo `transform` y `opacity`, en un
 * timeline atado al scroll de la pista (`[data-deck-pista]`), igual que «Cómo
 * trabajamos». Al final, el mazo entero se va como se va un paso de «Cómo
 * trabajamos». La clase `is-pila` se pone acá, antes del primer paint.
 */
export function crearPilaMovil(root: HTMLElement) {
  const pista = root.querySelector<HTMLElement>("[data-deck-pista]");
  const mazo = root.querySelector<HTMLElement>(".deck-cards");
  const cartas = gsap.utils.toArray<HTMLElement>("[data-deck-card]", root);
  if (!pista || !mazo || cartas.length < 2) return () => {};

  root.classList.add("is-pila");

  const ctx = gsap.context(() => {
    const total = cartas.length;
    // Cuántos lomos entran sin que la carta abierta se corte abajo: depende
    // del alto de la pantalla. Se recalcula en cada refresh.
    const lomos = () => {
      const estilo = getComputedStyle(mazo);
      const libre =
        mazo.clientHeight -
        parseFloat(estilo.paddingTop) -
        parseFloat(estilo.paddingBottom) -
        cartas[0].offsetHeight;
      return Math.max(1, Math.min(LOMOS_MAX, Math.floor(libre / LOMO)));
    };
    // Dónde descansa la carta `j` cuando la abierta es la `k`: las últimas
    // `lomos()` tapadas hacen escalera; las anteriores, un lomo más arriba.
    const reposo = (j: number, k: number) =>
      Math.max(-1, j - Math.max(0, k - lomos())) * LOMO;

    // El hint lo pone y lo saca la coreografía (se va con el revert).
    gsap.set(cartas, { willChange: "transform, opacity" });
    gsap.set(cartas.slice(1), { y: () => mazo.clientHeight });
    gsap.set("[data-deck-corto]", { autoAlpha: 0 });

    const tramo = 1 / total;
    const tl = gsap.timeline({
      defaults: { ease: "power2.inOut", duration: tramo * 0.6 },
      scrollTrigger: {
        trigger: pista,
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });

    for (let k = 1; k < total; k++) {
      // Cada tramo arranca con un rato quieto, para leer la carta abierta.
      const t = (k - 1) * tramo + tramo * 0.4;
      tl.to(cartas[k], { y: () => reposo(k, k), ease: "power3.out" }, t);
      for (let j = 0; j < k; j++) {
        tl.to(
          cartas[j],
          {
            y: () => reposo(j, k),
            autoAlpha: () => (reposo(j, k) < 0 ? 0 : 1),
          },
          t,
        );
      }
      // La que queda tapada cambia su etiqueta por el nombre corto.
      const tapada = cartas[k - 1];
      tl.to(tapada.querySelector("[data-deck-etiqueta]"), { autoAlpha: 0 }, t).to(
        tapada.querySelector("[data-deck-corto]"),
        { autoAlpha: 1 },
        t,
      );
    }
    // El timeline tiene que durar 1 entero. Sin este remate termina cuando
    // aterriza la última carta (6/7) y el scrub lo estira hasta el final de la
    // pista: la última entraba justo cuando el mazo se soltaba, sin su rato
    // quieto y sin que se llegara a ver cómo arrastra a los lomos de arriba.
    tl.set({}, {}, 1);

    // SALIDA: cuando se suelta el mazo, la última carta se va hacia arriba
    // llevándose a los lomos, con el mismo gesto con el que un paso de «Cómo
    // trabajamos» le deja lugar al siguiente (sube, se achica apenas, se
    // desenfoca y se desvanece; mismos valores que coreografia-metodo.ts). Va
    // sobre el mazo entero y no carta por carta: la `y` y la opacidad de cada
    // carta son del timeline de arriba. Corre DESPUÉS de soltarse —mientras el
    // mazo ya sube con el scroll— y no antes: si se desvaneciera fijo, quedaría
    // una pantalla vacía hasta que se suelte.
    gsap.set(mazo, { willChange: "transform, opacity, filter" });
    gsap.fromTo(
      mazo,
      { y: 0, scale: 1, autoAlpha: 1, filter: "blur(0px)" },
      {
        y: -56,
        scale: 0.97,
        autoAlpha: 0,
        filter: "blur(8px)",
        ease: "power2.in",
        scrollTrigger: { trigger: pista, start: "bottom bottom", end: "bottom 45%", scrub: 1 },
      },
    );
  }, root);

  return () => {
    ctx.revert();
    root.classList.remove("is-pila");
  };
}
