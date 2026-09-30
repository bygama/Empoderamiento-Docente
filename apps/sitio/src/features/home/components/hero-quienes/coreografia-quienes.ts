import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { barrerQuienes } from "./barrido-quienes";
import { crearProgresoQuienes } from "./progreso-quienes";
import { TIEMPOS } from "./tiempos-quienes";

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
 *
 * En celular y tablet (< lg) la foto va arriba con la etiqueta del capítulo y
 * el texto debajo (como la tarjeta de la Bio móvil de HAF: Gastón,
 * 2026-09-29), y el barrido cruza solo el texto, con tiempos más cortos
 * (`tiempos-quienes.ts`). Las ramas viven en un gsap.matchMedia: rotar o
 * cruzar lg re-arma la escena con los suyos.
 */
export function crearQuienes({ wrap, zone, panel, heroScroll }: Escena) {
  let mm: gsap.MatchMedia | undefined;
  const ctx = gsap.context(() => {
    // Apagado de nodos por scroll del hero: progreso 0 (hero arriba) → 1
    // (hero ya pasó). El MathField lo lee y va apagando nodos.
    const heroEl = wrap.querySelector<HTMLElement>('[data-section="hero"]');
    if (heroEl) {
      ScrollTrigger.create({
        trigger: heroEl,
        start: "top top",
        end: "bottom top",
        scrub: 0.6,
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
    const textoQs = about.querySelector<HTMLElement>("[data-wipe-texto]");
    const textoMision = mision.querySelector<HTMLElement>("[data-wipe-texto]");
    const fotoMision = mision.querySelector<HTMLElement>("[data-wipe-foto]");

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
        scrollTrigger: { trigger: zone, start, end, scrub: 0.5 },
      });
    };
    const aboutWords = about.querySelectorAll<HTMLElement>("[data-qs-word]");
    const misionWords = mision.querySelectorAll<HTMLElement>("[data-qs-word]");

    const armarRama = (esMovil: boolean) => {
      const piezas = esMovil && textoQs && textoMision && fotoMision ? { textoQs, textoMision, fotoMision } : undefined;
      const T = piezas ? TIEMPOS.movil : TIEMPOS.escritorio;
      const vh = (n: number) => () => "top top-=" + window.innerHeight * n;
      // La línea se escribe en cada tick del scrub: el hint es suyo mientras
      // la escena vive, no de la clase.
      gsap.set(line, { willChange: "transform" });
      // Las dos capas pasan a SUPERPONERSE (en flow quedaban apiladas para
      // reduced-motion y para las pantallas bajas).
      gsap.set([about, mision], { position: "absolute", top: 0, left: 0, width: "100%", height: "100%" });
      gsap.set(line, { autoAlpha: 1, transformOrigin: "center center", scaleY: 0 });
      gsap.set([...aboutWords, ...misionWords], { color: GRAY });
      rellenar(aboutWords, () => "top top+=" + window.innerHeight * T.qs[0], vh(T.qs[1]));
      rellenar(misionWords, vh(T.mision[0]), vh(T.mision[1]));
      barrerQuienes({ about, mision, line, panel, zone }, T, piezas);
      crearProgresoQuienes(panel, zone, T);
    };

    // Tres ramas: escritorio, celular/tablet con alto suficiente, y «bajo»
    // (celular apaisado, menos de 620px de alto), donde la escena no se clava:
    // las capas quedan en flujo, como con movimiento reducido (la CSS lo
    // acompaña con las variantes de max-height de HeroQuienes).
    mm = gsap.matchMedia();
    // `mm.add` llama en el acto a la rama que ya aplica; toda llamada posterior
    // es un cambio de media. Se decide por eso y no por «ya se armó»: una
    // carga en «bajo» no arma nada, y girar a vertical sería un cambio igual.
    let inicial = true;
    mm.add(
      {
        escritorio: "(min-width: 64rem)",
        movil: "(max-width: 63.999rem) and (min-height: 38.75rem)",
        bajo: "(max-width: 63.999rem) and (max-height: 38.74rem)",
      },
      (c) => {
        if (c.conditions?.bajo) return;
        const esMovil = Boolean(c.conditions?.movil);
        // El primer armado es sincrónico. Un RE-armado (cruzar lg o girar el
        // celular) llega DENTRO del refresh de ScrollTrigger, y crear triggers
        // ahí corrompe su recorrido: se arma un tick después, en el mismo
        // contexto para que se revierta con él.
        let llamada: gsap.core.Tween | undefined;
        if (inicial) {
          armarRama(esMovil);
        } else {
          llamada = gsap.delayedCall(0, () => c.add(() => armarRama(esMovil)));
        }
        return () => {
          llamada?.kill();
          // El gris inicial de las palabras es un `set`: el revert no lo saca,
          // y en la rama «bajo» el texto quedaba gris pálido.
          gsap.set([...aboutWords, ...misionWords], { clearProps: "color" });
        };
      },
    );
    inicial = false;
  }, wrap);

  const refresh = window.setTimeout(() => ScrollTrigger.refresh(), 400);
  return () => {
    window.clearTimeout(refresh);
    mm?.revert();
    ctx.revert();
  };
}
