import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { flujoDesdeSeccion, topeDeCard } from "./medidas";

gsap.registerPlugin(ScrollTrigger);

/**
 * Qué paso marca el indicador de la franja (ver `IndicadorPasos`).
 *
 * Cada card enciende su paso cuando SE TRABA, que es el momento en que pasa a
 * ser la que se está leyendo: el punto exacto es su lugar en el flujo menos el
 * `top` con el que se traba, los dos medidos del layout (`medidas.ts`) y no
 * rearmados con constantes. Volviendo para arriba se apaga y se enciende el
 * anterior.
 *
 * El estado viaja por los atributos `data-estado` y `aria-current` de cada
 * paso, no por estado de React: el indicador se pinta una vez y el scroll sólo
 * le cambia un atributo, así que no dispara renders. Sin JS queda marcado el
 * primer paso, que es lo que ya viene en el HTML.
 *
 * Esto SÍ corre con reduced-motion: no es una animación, es dónde estás
 * parado. Lo único que se apaga son las transiciones de color, y eso lo hace
 * el `motion-reduce` de las clases. En celular no corre porque no hay franja
 * ni apilado que guiar.
 */

type Estado = "recorrido" | "activo" | "pendiente";

function estadoDe(indice: number, activo: number): Estado {
  if (indice === activo) return "activo";
  return indice < activo ? "recorrido" : "pendiente";
}

export function crearIndicador(root: HTMLElement) {
  const mm = gsap.matchMedia();

  mm.add("(min-width: 1024px)", () => {
    const pasos = gsap.utils.toArray<HTMLElement>("[data-mirada-paso]", root);
    const cards = gsap.utils.toArray<HTMLElement>("[data-mirada-card]", root);
    if (!pasos.length || pasos.length !== cards.length) return;

    const marcar = (activo: number) => {
      pasos.forEach((paso, i) => {
        const estado = estadoDe(i, activo);
        paso.dataset.estado = estado;
        // Para un lector de pantalla, cuál de los seis es el que se está
        // leyendo: el color solo no lo dice.
        if (estado === "activo") paso.setAttribute("aria-current", "step");
        else paso.removeAttribute("aria-current");
      });
    };

    cards.forEach((card, i) => {
      ScrollTrigger.create({
        trigger: root,
        start: () => `top+=${flujoDesdeSeccion(card) - topeDeCard(card)} top`,
        invalidateOnRefresh: true,
        onEnter: () => marcar(i),
        onLeaveBack: () => marcar(Math.max(0, i - 1)),
      });
    });

    marcar(0);

    return () => marcar(0);
  });

  return () => {
    mm.revert();
    ScrollTrigger.refresh();
  };
}
