import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { acoplarLamina } from "../acople-lamina";
import { R } from "./red-datos";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Acople de la lámina, entrada del encabezado, dibujado del grafo atado al
 * scroll (radios y dash-offset: cero transforms de escala) y la deriva
 * perpetua de cada nodo. Devuelve la limpieza (`ctx.revert()`).
 */
export function crearRed(root: HTMLElement) {
  const ctx = gsap.context(() => {
    // Acople sobre la lámina anterior (compartido con Origen y Mirada).
    acoplarLamina(root);

    const heads = gsap.utils.toArray<HTMLElement>("[data-red-head]");
    gsap.set(heads, { autoAlpha: 0, y: 24 });
    gsap.to(heads, {
      autoAlpha: 1,
      y: 0,
      duration: 0.7,
      stagger: 0.1,
      ease: "power3.out",
      scrollTrigger: { trigger: root, start: "top 75%", once: true },
    });

    // Piezas
    const paths = gsap.utils.toArray<SVGPathElement>("[data-net-line]");
    const specHalos = gsap.utils.toArray<SVGCircleElement>("[data-spec-halo]");
    const specDots = gsap.utils.toArray<SVGCircleElement>("[data-spec-dot]");
    const specTexts = gsap.utils.toArray<SVGTextElement>("[data-spec-text]");
    const paisHalos = gsap.utils.toArray<SVGCircleElement>("[data-pais-halo]");
    const paisDots = gsap.utils.toArray<SVGCircleElement>("[data-pais-dot]");
    const paisTexts = gsap.utils.toArray<SVGTextElement>("[data-pais-text]");
    const edCircles = gsap.utils.toArray<SVGCircleElement>("[data-ed-circle]");
    const edText = root.querySelector<SVGTextElement>("[data-ed-text]");

    paths.forEach((l) => {
      const len = l.getTotalLength();
      gsap.set(l, { strokeDasharray: len, strokeDashoffset: len });
    });
    gsap.set([...specHalos, ...specDots, ...paisHalos, ...paisDots, ...edCircles], { attr: { r: 0 } });
    gsap.set([...specTexts, ...paisTexts, edText], { autoAlpha: 0 });

    const spokes = paths.filter((l) => l.dataset.kind === "spoke");
    const rings = paths.filter((l) => l.dataset.kind === "ring");
    const paisLines = paths.filter((l) => l.dataset.kind === "pais");

    const draw = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: "[data-red-graph]",
        start: "top 88%",
        end: "top 22%",
        scrub: true,
      },
    });
    draw
      .to(edCircles[0] ?? {}, { attr: { r: R.edHalo }, duration: 0.5, ease: "back.out(1.6)" }, 0)
      .to(edCircles[1] ?? {}, { attr: { r: R.edDot }, duration: 0.5, ease: "back.out(1.6)" }, 0.05)
      .to(edText, { autoAlpha: 1, duration: 0.3 }, 0.3)
      .to(spokes, { strokeDashoffset: 0, duration: 0.9, stagger: 0.12 }, 0.3)
      .to(specHalos, { attr: { r: R.specHalo }, duration: 0.4, ease: "back.out(2)", stagger: 0.12 }, 0.8)
      .to(specDots, { attr: { r: R.specDot }, duration: 0.4, ease: "back.out(2)", stagger: 0.12 }, 0.85)
      .to(specTexts, { autoAlpha: 1, duration: 0.35, stagger: 0.12 }, 0.95)
      .to(rings, { strokeDashoffset: 0, duration: 0.7, stagger: 0.08 }, 1.7)
      .to(paisLines, { strokeDashoffset: 0, duration: 0.8, stagger: 0.1 }, 2.1)
      .to(paisHalos, { attr: { r: R.paisHalo }, duration: 0.35, ease: "back.out(2)", stagger: 0.1 }, 2.6)
      .to(paisDots, { attr: { r: R.paisDot }, duration: 0.35, ease: "back.out(2)", stagger: 0.1 }, 2.65)
      .to(paisTexts, { autoAlpha: 1, duration: 0.3, stagger: 0.1 }, 2.75)
      .to({}, { duration: 0.4 }, 3.4);

    // ── DERIVA PERPETUA: cada nodo respira a su ritmo (solo translate de
    //    grupo — la curva ancla al centro base y el punto la cubre). ───────
    gsap.utils.toArray<SVGGElement>("[data-drift]").forEach((g, i) => {
      const ampX = 4 + ((i * 5) % 5);
      const ampY = 5 + ((i * 3) % 5);
      gsap.to(g, {
        x: i % 2 === 0 ? ampX : -ampX,
        y: i % 3 === 0 ? -ampY : ampY,
        duration: 3.2 + (i % 5) * 0.7,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        delay: (i % 7) * 0.4,
      });
    });
  }, root);

  return () => ctx.revert();
}
