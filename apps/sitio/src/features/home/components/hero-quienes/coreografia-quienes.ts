import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { barrerQuienes } from "./barrido-quienes";
import { crearProgresoQuienes } from "./progreso-quienes";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type Escena = {
  wrap: HTMLElement;
  zone: HTMLElement;
  panel: HTMLElement;
  /** Progreso de scroll del hero (0 arriba → 1 cuando queda atrás): lo lee el campo de nodos en cada frame. */
  heroScroll: { current: number };
};

/**
 * Coreografía de «¿Quiénes somos?» → «Misión» (la orquesta `HeroQuienes`): el
 * apagado de nodos por el scroll del hero, el relleno palabra por palabra de
 * cada texto, el barrido verde (`barrido-quienes.ts`) y el indicador
 * (`progreso-quienes.ts`), en ese orden, que es el de refresco de sus
 * ScrollTriggers. Devuelve la limpieza.
 */
export function crearQuienes({ wrap, zone, panel, heroScroll }: Escena) {
  const ctx = gsap.context(() => {
    // Apagado de nodos por scroll del hero: progreso 0 (hero arriba) → 1
    // (hero ya pasó). El MathField lo lee y va apagando nodos.
    const heroEl = wrap.querySelector<HTMLElement>('[data-section="hero"]');
    if (heroEl) {
      ScrollTrigger.create({
        trigger: heroEl,
        start: "top top",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
          heroScroll.current = self.progress;
        },
        onRefresh: (self) => {
          heroScroll.current = self.progress;
        },
      });
    }

    const about = panel.querySelector<HTMLElement>("[data-about-layer]");
    const mision = panel.querySelector<HTMLElement>("[data-mision-layer]");
    const line = panel.querySelector<HTMLElement>("[data-wipe-line]");
    if (!about || !mision || !line) return;
    // La línea se escribe en cada tick del scrub: el hint es suyo mientras
    // la escena vive, no de la clase.
    gsap.set(line, { willChange: "transform" });

    // Las dos capas pasan a SUPERPONERSE (en flow quedaban apiladas para reduced-motion).
    gsap.set([about, mision], { position: "absolute", top: 0, left: 0, width: "100%", height: "100%" });
    gsap.set(about, { clipPath: "inset(0% 0% 0% 0%)" });
    gsap.set(mision, { clipPath: "inset(0% 0% 0% 100%)" });
    gsap.set(line, { autoAlpha: 1, transformOrigin: "center center", scaleY: 0 });

    // FILL — cada texto se COMPLETA palabra por palabra con el scroll (estilo
    // blueprint): arranca gris tenue y se enciende en VERDE; las palabras
    // [data-accent] se encienden en AZUL de marca. "Quiénes somos" se llena
    // ANTES del barrido; la Misión DESPUÉS (ya revelada).
    const GRAY = "#b6bdc9";
    const fillTarget = (_i: number, t: Element) =>
      t.hasAttribute("data-accent") ? "#1f2d4d" : "#1f9a78";
    const rellenar = (palabras: NodeListOf<HTMLElement>, start: () => string, end: () => string) => {
      if (!palabras.length) return;
      gsap.to(palabras, {
        color: fillTarget,
        ease: "none",
        stagger: 0.4,
        duration: 1,
        scrollTrigger: { trigger: zone, start, end, scrub: true },
      });
    };

    const aboutWords = about.querySelectorAll<HTMLElement>("[data-qs-word]");
    const misionWords = mision.querySelectorAll<HTMLElement>("[data-qs-word]");
    gsap.set([...aboutWords, ...misionWords], { color: GRAY });
    rellenar(
      aboutWords,
      () => "top top+=" + window.innerHeight * 0.12,
      () => "top top-=" + window.innerHeight * 0.8,
    );
    rellenar(
      misionWords,
      () => "top top-=" + window.innerHeight * 1.65,
      () => "top top-=" + window.innerHeight * 2.35,
    );

    barrerQuienes({ about, mision, line, panel, zone });
    crearProgresoQuienes(panel, zone);
  }, wrap);

  const refresh = window.setTimeout(() => ScrollTrigger.refresh(), 400);
  return () => {
    window.clearTimeout(refresh);
    ctx.revert();
  };
}
