import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FIGURAS } from "../constelacion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const ETAPA = 1;
const LVH_POR_ETAPA = 55;
const LVH_RESPIRO = 30;
export const ALTO_HISTORIA_LVH = 100 + FIGURAS.length * LVH_POR_ETAPA + LVH_RESPIRO;

/**
 * Cuatro etapas, una por figura: los 13 puntos viajan a sus posiciones
 * (atributos cx/cy, como en el hero de escritorio), las aristas se acomodan
 * y aparecen, el riel avanza, el verbo se releva y la frase se cruza. Todo
 * atado al scroll de la zona, reversible.
 */
export function crearHistoriaMovil(zona: HTMLElement) {
  const ctx = gsap.context(() => {
    const puntos = gsap.utils.toArray<SVGCircleElement>("[data-hm-punto]", zona);
    const aristas = gsap.utils.toArray<SVGLineElement>("[data-hm-arista]", zona);
    const verbos = gsap.utils.toArray<HTMLElement>("[data-hm-verbo]", zona);
    const frases = gsap.utils.toArray<HTMLElement>("[data-hm-frase]", zona);
    const rellenos = gsap.utils.toArray<HTMLElement>("[data-hm-relleno]", zona);
    const numeros = gsap.utils.toArray<HTMLElement>("[data-hm-numero]", zona);
    if (puntos.length !== 13) return;

    gsap.set(verbos, { yPercent: 110 });
    gsap.set(verbos[0], { yPercent: 0 });
    gsap.set(frases, { autoAlpha: 0 });
    gsap.set(frases[0], { autoAlpha: 1 });
    gsap.set(rellenos, { scaleX: 0 });
    gsap.set(numeros, { opacity: 0.6 });
    gsap.set(numeros[0], { opacity: 1 });

    const tl = gsap.timeline({
      defaults: { ease: "power2.inOut" },
      scrollTrigger: { trigger: zona, start: "top top", end: "bottom bottom", scrub: 0.7, invalidateOnRefresh: true },
    });

    FIGURAS.forEach((figura, k) => {
      const t = k * ETAPA;
      // La figura 0 se arma desde la dispersión en la primera etapa; las demás
      // morfean desde la anterior.
      puntos.forEach((c, i) => {
        tl.to(c, { attr: { cx: figura.puntos[i][0], cy: figura.puntos[i][1] }, duration: 0.55, ease: "power2.inOut" }, t + (k === 0 ? 0.02 : 0.1));
      });
      aristas.forEach((l, j) => {
        const ar = figura.aristas[j];
        if (!ar) {
          tl.to(l, { attr: { opacity: 0 }, duration: 0.15 }, t + 0.1);
          return;
        }
        const [a, b] = ar;
        tl.to(l, { attr: { x1: figura.puntos[a][0], y1: figura.puntos[a][1], x2: figura.puntos[b][0], y2: figura.puntos[b][1] }, duration: 0.55, ease: "power2.inOut" }, t + (k === 0 ? 0.02 : 0.1))
          .to(l, { attr: { opacity: 1 }, duration: 0.2 }, t + 0.45);
      });
      if (k > 0) {
        tl.to(verbos[k - 1], { yPercent: -110, duration: 0.3 }, t + 0.05)
          .to(verbos[k], { yPercent: 0, duration: 0.3 }, t + 0.12)
          .to(frases[k - 1], { autoAlpha: 0, duration: 0.2 }, t + 0.05)
          .to(frases[k], { autoAlpha: 1, duration: 0.3 }, t + 0.25)
          .to(rellenos[k - 1], { scaleX: 1, duration: 0.3, ease: "none" }, t)
          .to(numeros[k], { opacity: 1, duration: 0.2 }, t + 0.25);
      }
    });
    tl.set({}, {}, FIGURAS.length * ETAPA + 0.5);
  }, zona);
  return () => ctx.revert();
}
