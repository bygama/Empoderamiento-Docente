import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const PASO = 1;
const LVH_POR_PASO = 45;
const LVH_RESPIRO = 30;
/** Alto de la pista: una pantalla + un paso por momento + respiro. */
export const altoMovilLvh = (momentos: number) => 100 + momentos * LVH_POR_PASO + LVH_RESPIRO;

/**
 * «ED en movimiento» bajo `lg`: PROFUNDIDAD EN ETAPAS. En escritorio cada
 * momento emerge del punto de fuga y pasa de largo; en táctil no hay scroll
 * fino para eso, así que cada foto llega desde la luz del horizonte a su lugar
 * en el mosaico (scale + x/y + opacity) y se queda, mientras arriba aparece su
 * frase. Al final el mosaico completo queda a la vista. Las frases, que en el
 * mosaico quieto no se veían, acá son parte del recorrido.
 */
export function crearMovimientoMovil(zone: HTMLElement, stage: HTMLElement, contador: HTMLElement | null) {
  const ctx = gsap.context(() => {
    const cards = gsap.utils.toArray<HTMLElement>("[data-mov-card]", stage);
    const phrases = gsap.utils.toArray<HTMLElement>("[data-mov-phrase]", stage);
    const luz = stage.querySelector<HTMLElement>("[data-mov-luz]");
    gsap.set(cards, { willChange: "transform, opacity" });

    // Desde dónde llega cada foto: la luz del horizonte (50 %, 44 % de la escena).
    const desdeX = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      const s = stage.getBoundingClientRect();
      return s.left + s.width * 0.5 - (r.left + r.width / 2);
    };
    const desdeY = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      const s = stage.getBoundingClientRect();
      return s.top + s.height * 0.44 - (r.top + r.height / 2);
    };

    if (luz) {
      gsap.fromTo(
        luz,
        { autoAlpha: 0, scale: 0.45 },
        { autoAlpha: 1, scale: 1, ease: "none", scrollTrigger: { trigger: zone, start: "top bottom", end: "top top", scrub: 0.6 } },
      );
    }

    const creada: { tl?: gsap.core.Timeline } = {};
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: zone,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.6,
        invalidateOnRefresh: true,
        onUpdate: () => {
          if (!creada.tl || !contador) return;
          const i = Math.min(cards.length - 1, Math.max(0, Math.floor(creada.tl.time() / PASO)));
          const label = String(i + 1).padStart(2, "0");
          if (contador.textContent !== label) contador.textContent = label;
        },
      },
    });
    creada.tl = tl;

    cards.forEach((card, i) => {
      const t = i * PASO;
      tl.fromTo(
        card,
        { x: () => desdeX(card), y: () => desdeY(card), scale: 0.25, autoAlpha: 0 },
        { x: 0, y: 0, scale: 1, autoAlpha: 1, ease: "power2.out", duration: 0.6, immediateRender: true },
        t,
      );
      const ph = phrases[i];
      if (ph) {
        tl.fromTo(ph, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, ease: "power2.out", duration: 0.3 }, t + 0.15);
        if (i < cards.length - 1) {
          tl.to(ph, { autoAlpha: 0, y: -10, ease: "power2.in", duration: 0.25 }, t + PASO - 0.05);
        }
      }
    });
    // La última frase se queda con el mosaico completo.
    if (phrases[cards.length - 1]) tl.to(phrases[cards.length - 1], { autoAlpha: 1, y: 0, duration: 0.2 }, cards.length * PASO);
    tl.set({}, {}, cards.length * PASO + 0.6);
  }, stage);

  return () => ctx.revert();
}
