import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type OpcionesAcople = {
  /** Escala inicial de la lámina (crece hasta 1). */
  escala?: number;
  /** Desplazamiento inicial en px (vuelve a 0). */
  y?: number;
  /** `end` del ScrollTrigger: hasta dónde llega el acople. */
  fin?: string;
  /**
   * `transform-origin` de la lámina. Con `"50% 0%"` se ancla por el borde
   * superior (el que toca la sección anterior) y crece hacia abajo: escalar
   * una sección de cientos de svh desde el centro empujaría su tope fuera de
   * vista y abriría una banda de fondo crudo sobre la sección previa. Se fija
   * con un `set` previo porque en un `fromTo` con scrub GSAP no lo aplica en
   * el frame 0 si viaja solo en el objeto "to". Sin valor, no se toca (la red
   * escala desde el centro, como siempre lo hizo).
   */
  origen?: string;
};

/**
 * Acople de una lámina de «Quiénes somos» sobre la sección anterior: entra
 * apenas más chica y desplazada y se asienta con el scroll. Lo comparten
 * Origen, Mirada y Red; antes vivía copiado en las tres. Llamar dentro del
 * `gsap.context` del componente, que es quien lo revierte.
 */
export function acoplarLamina(
  root: HTMLElement,
  { escala = 0.97, y = 36, fin = "top 14%", origen }: OpcionesAcople = {},
) {
  if (origen) gsap.set(root, { transformOrigin: origen });
  return gsap.fromTo(
    root,
    { scale: escala, y },
    {
      scale: 1,
      y: 0,
      ease: "none",
      scrollTrigger: { trigger: root, start: "top 96%", end: fin, scrub: true },
    },
  );
}
