import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * El mazo de «Cómo trabajamos»: la sección se clava a pantalla completa y el
 * scroll va haciendo APARECER las seis tarjetas, una tras otra, sin que nada
 * se mueva de lugar. Al soltar, las seis quedan a la vista como un mazo.
 *
 * Las tarjetas arrancan invisibles SOLO desde acá, nunca por CSS: si el JS no
 * corre —o el navegador no soporta ScrollTrigger— la sección se lee entera,
 * quieta y completa. Un `opacity: 0` en la clase las escondería para siempre.
 *
 * Sin pin en celular ni con reduced-motion: ahí no se toca nada y las seis se
 * leen en flujo normal. `matchMedia` se encarga de montar y desmontar según
 * el caso, y su `revert()` limpia todo de una.
 *
 * El `will-change` lo pone y lo saca esta coreografía, nunca un className
 * (AI_GUIDELINES §11): fuera del recorrido no hay nada que prometerle al
 * compositor.
 */

/** Cuánto scroll ocupa revelar cada tarjeta, en px. */
const RECORRIDO_POR_TARJETA = 260;

export function crearMazo(root: HTMLElement) {
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

      const tarjetas = gsap.utils.toArray<HTMLElement>("[data-mazo-tarjeta]", root);
      if (!tarjetas.length) return;

      gsap.set(tarjetas, { opacity: 0, y: 28, willChange: "transform, opacity" });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: `+=${tarjetas.length * RECORRIDO_POR_TARJETA}`,
          pin: true,
          // scrub con demora, nunca `true`: el salto directo se ve duro y
          // AGENTS §8 lo prohíbe.
          scrub: 0.5,
        },
      });

      // Los tweens van EN la timeline, no con su propio ScrollTrigger cada
      // uno: así comparten el pin y el orden queda explícito en la posición.
      //
      // La opacidad y el desplazamiento van SEPARADOS y con duraciones muy
      // distintas, y no es un capricho: mientras una tarjeta es translúcida
      // se lee el texto de la que tapa, y con scrub la persona puede quedarse
      // parada justo ahí. Con la opacidad resuelta en el primer cuarto del
      // tiempo, el cruce de textos es un parpadeo y no un estado en el que se
      // pueda estacionar; el desplazamiento se toma el resto del compás.
      tarjetas.forEach((t, i) => {
        tl.to(t, { opacity: 1, duration: 0.25, ease: "none" }, i);
        tl.to(t, { y: 0, duration: 1, ease: "power2.out" }, i);
      });

      return () => {
        gsap.set(tarjetas, { clearProps: "opacity,transform,willChange" });
      };
    },
  );

  return () => {
    mm.revert();
    ScrollTrigger.refresh();
  };
}
