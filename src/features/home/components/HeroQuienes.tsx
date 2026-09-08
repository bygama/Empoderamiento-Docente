"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Hero } from "./Hero";
import { Manifiesto } from "./Manifiesto";
import { MisionPanel } from "./MisionPanel";
import { MathField } from "@/components/ui/MathField";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Secciones APILADAS verticalmente (sin slide horizontal). El campo de nodos
 * (MathField) es una capa PERSISTENTE detrás del hero y del panel. El Hero
 * scrollea normal; debajo, el panel se clava (sticky) y una LÍNEA VERDE barre de
 * derecha a izquierda: BORRA "¿Quiénes somos?" (clip desde la derecha) y revela
 * la "Misión" (clip desde la izquierda) en el mismo lugar, con la MISMA forma.
 * La barra mide el alto del bloque y se despliega desde el centro hacia los
 * extremos. Clips complementarios → no se solapan; la línea es la costura. Todo
 * en píxeles para que línea y borrado vayan pegados.
 * Respeta prefers-reduced-motion (capas apiladas en flow, sin animación).
 */
export function HeroQuienes() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const zoneRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  // Progreso de scroll del hero (0 arriba → 1 cuando queda atrás). El campo de
  // nodos lo lee en cada frame para ir apagando nodos (cada vez menos).
  const heroScroll = useRef(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const zone = zoneRef.current;
    const panel = panelRef.current;
    if (!zone || !panel) return;

    const ctx = gsap.context(() => {
      // Apagado de nodos por scroll del hero: progreso 0 (hero arriba) → 1
      // (hero ya pasó). El MathField lo lee y va apagando nodos.
      const heroEl =
        wrapRef.current?.querySelector<HTMLElement>('[data-section="hero"]');
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

      // Las dos capas pasan a SUPERPONERSE (en flow quedaban apiladas para reduced-motion).
      gsap.set([about, mision], { position: "absolute", top: 0, left: 0, width: "100%", height: "100%" });
      gsap.set(about, { clipPath: "inset(0% 0% 0% 0%)" });
      gsap.set(mision, { clipPath: "inset(0% 0% 0% 100%)" });
      gsap.set(line, { autoAlpha: 1, transformOrigin: "center center", scaleY: 0 });

      // 1) FILL — cada texto se COMPLETA palabra por palabra con el scroll
      //    (estilo blueprint): arranca gris tenue y se enciende en VERDE; las
      //    palabras [data-accent] se encienden en AZUL de marca. "Quiénes somos"
      //    se llena ANTES del barrido; la Misión DESPUÉS (ya revelada).
      const GRAY = "#b6bdc9";
      const fillTarget = (_i: number, t: Element) =>
        t.hasAttribute("data-accent") ? "#1f2d4d" : "#1f9a78";

      const aboutWords = about.querySelectorAll<HTMLElement>("[data-qs-word]");
      const misionWords = mision.querySelectorAll<HTMLElement>("[data-qs-word]");
      gsap.set([...aboutWords, ...misionWords], { color: GRAY });

      if (aboutWords.length) {
        gsap.to(aboutWords, {
          color: fillTarget,
          ease: "none",
          stagger: 0.4,
          duration: 1,
          scrollTrigger: {
            trigger: zone,
            start: () => "top top+=" + window.innerHeight * 0.12,
            end: () => "top top-=" + window.innerHeight * 0.8,
            scrub: true,
          },
        });
      }

      if (misionWords.length) {
        gsap.to(misionWords, {
          color: fillTarget,
          ease: "none",
          stagger: 0.4,
          duration: 1,
          scrollTrigger: {
            trigger: zone,
            start: () => "top top-=" + window.innerHeight * 1.65,
            end: () => "top top-=" + window.innerHeight * 2.35,
            scrub: true,
          },
        });
      }

      // 2) BARRIDO verde: "Quiénes somos" → "Misión". La barra mide EXACTO el
      //    alto del bloque (no de la pantalla) y viaja solo por su ancho. Todo en
      //    píxeles para que la LÍNEA y el borrado (clip) queden siempre pegados.
      //    Coreografía: abre desde el centro → barre der→izq → cierra al centro.
      const bounds = about.querySelector<HTMLElement>("[data-wipe-bounds]");
      const OPEN = 0.16; // 0..OPEN abre | OPEN..CLOSE barre | CLOSE..1 cierra
      const CLOSE = 0.84;
      const openScale = (p: number) =>
        p < OPEN ? p / OPEN : p > CLOSE ? (1 - p) / (1 - CLOSE) : 1;
      const travel = (p: number) =>
        p <= OPEN ? 0 : p >= CLOSE ? 1 : (p - OPEN) / (CLOSE - OPEN);

      let panelW = 0;
      let xRight = 0;
      let xLeft = 0;
      const measure = () => {
        const pr = panel.getBoundingClientRect();
        panelW = pr.width;

        const cr = (bounds ?? about).getBoundingClientRect();
        xRight = cr.right - pr.left;
        xLeft = cr.left - pr.left;
        // la barra arranca con el alto y el centro vertical del bloque.
        gsap.set(line, { top: cr.top - pr.top, height: cr.height });

        // igualo la caja de Misión al alto real de QS (arrancan a la misma altura)
        const pAbout = about.querySelector<HTMLElement>("[data-qs-fill]");
        const pMision = mision.querySelector<HTMLElement>("[data-qs-fill]");
        if (pAbout && pMision) {
          gsap.set(pMision, { minHeight: 0 });
          gsap.set(pMision, { minHeight: pAbout.getBoundingClientRect().height });
        }
      };

      const apply = (p: number) => {
        const x = xRight + (xLeft - xRight) * travel(p); // der → izq
        gsap.set(line, { x, scaleY: openScale(p) });
        gsap.set(about, { clipPath: `inset(0px ${panelW - x}px 0px 0px)` });
        gsap.set(mision, { clipPath: `inset(0px 0px 0px ${x}px)` });
      };
      ScrollTrigger.create({
        trigger: zone,
        start: () => "top top-=" + window.innerHeight * 1.0,
        end: () => "top top-=" + window.innerHeight * 1.5,
        scrub: true,
        onRefresh: (self) => {
          measure();
          apply(self.progress);
        },
        onUpdate: (self) => apply(self.progress),
      });

      // 3) Indicador horizontal de progreso (Quiénes somos → Misión). Es la
      //    versión HORIZONTAL del indicador vertical de "Cómo trabajamos":
      //    misma cápsula naranja alargada (tramo activo) + punto gris (inactivo)
      //    sobre una línea fina. La cápsula activa pasa de QS a Misión durante el
      //    MISMO tramo de scroll que el barrido verde. Suave (scrub).
      const prog = panel.querySelector<HTMLElement>("[data-qs-progress]");
      const seg0 = panel.querySelector<HTMLElement>('[data-qs-seg="0"]');
      const seg1 = panel.querySelector<HTMLElement>('[data-qs-seg="1"]');
      if (prog && seg0 && seg1) {
        // Cada cápsula CRECE de izquierda a derecha (8→36px) a medida que se lee
        // su sección — igual que el texto se va llenando con el scroll. En el
        // barrido el activo pasa de "Quiénes somos" a "Misión" (tamaño + color).
        // Un solo ScrollTrigger calcula el estado por fase (evita conflictos):
        //   QS-lectura 0.12→0.8 · barrido 1.0→1.5 · Misión-lectura 1.65→2.35 (vh).
        const ORANGE = [224, 122, 47, 1];
        const GREY = [31, 45, 77, 0.18];
        const clamp = (v: number, a: number, b: number) =>
          v < a ? a : v > b ? b : v;
        const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
        const mix = (c1: number[], c2: number[], t: number) =>
          `rgba(${Math.round(lerp(c1[0], c2[0], t))}, ${Math.round(
            lerp(c1[1], c2[1], t),
          )}, ${Math.round(lerp(c1[2], c2[2], t))}, ${lerp(
            c1[3],
            c2[3],
            t,
          ).toFixed(3)})`;
        ScrollTrigger.create({
          trigger: zone,
          start: "top top",
          end: () => "top top-=" + window.innerHeight * 2.35,
          scrub: 0.6,
          onUpdate: (self) => {
            const s = self.progress * 2.35; // vh recorridos dentro de la zona
            const qsRead = clamp((s - 0.12) / (0.8 - 0.12), 0, 1);
            const wipe = clamp((s - 1.0) / (1.5 - 1.0), 0, 1);
            const misRead = clamp((s - 1.65) / (2.35 - 1.65), 0, 1);
            gsap.set(seg0, {
              width: lerp(lerp(8, 36, qsRead), 8, wipe),
              backgroundColor: mix(ORANGE, GREY, wipe),
            });
            gsap.set(seg1, {
              width: lerp(8, 36, misRead),
              backgroundColor: mix(GREY, ORANGE, wipe),
            });
            gsap.set(prog, { autoAlpha: clamp(s / 0.12, 0, 1) });
          },
        });
      }
    }, wrapRef);

    const refresh = window.setTimeout(() => ScrollTrigger.refresh(), 400);
    return () => {
      window.clearTimeout(refresh);
      ctx.revert();
    };
  }, [reduced]);

  return (
    <div ref={wrapRef} className="relative isolate bg-gradient-to-b from-white via-white to-gris-fondo/40">
      {/* Nodos detrás del hero — NO sticky: scrollean con el hero y se quedan
          atrás al scrollear (no siguen al viewport). Cubren el alto del hero. */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[100svh] overflow-hidden opacity-40 lg:h-[93.75vw]"
        aria-hidden="true"
      >
        <MathField className="h-full w-full" scrollRef={heroScroll} />
      </div>

      {/* Hero — scrollea normal (sin slide). */}
      <div className="relative z-10">
        <Hero />
      </div>

      {/* Quiénes somos → barrido verde → Misión (apilado debajo del hero). */}
      <div
        ref={zoneRef}
        id="quienes-somos"
        data-indice="Quiénes somos"
        className="relative z-20 h-[340svh] motion-reduce:h-auto"
      >
        <div className="sticky top-0 h-[100svh] w-full overflow-hidden motion-reduce:static motion-reduce:h-auto">
          <div ref={panelRef} className="relative h-full w-full motion-reduce:h-auto">
            {/* Capa 1: Quiénes somos (se borra). */}
            <div data-about-layer className="h-full w-full motion-reduce:h-auto">
              <Manifiesto />
            </div>
            {/* Capa 2: Misión (se revela en el mismo lugar). */}
            <div data-mision-layer className="h-full w-full motion-reduce:h-auto">
              <MisionPanel />
            </div>
            {/* Línea-borrador verde: la costura del barrido (derecha → izquierda). */}
            <span
              data-wipe-line
              aria-hidden="true"
              className="bg-verde-concepto pointer-events-none absolute top-0 left-0 z-30 w-[3px] rounded-full opacity-0 shadow-[0_0_18px_rgba(31,154,120,0.55)] will-change-transform"
            />

            {/* Indicador horizontal de progreso (Quiénes somos → Misión).
                Versión HORIZONTAL del indicador vertical de "Cómo trabajamos":
                misma línea fina conectora + cápsula naranja activa alargada +
                punto gris inactivo (mismos grosor, colores y lenguaje). La
                cápsula activa pasa de QS a Misión con el barrido. Decorativo y
                oculto en reduced-motion; centrado, sin pegarse al borde. */}
            <div
              data-qs-progress
              aria-hidden="true"
              className="pointer-events-none absolute bottom-8 left-1/2 z-40 -translate-x-1/2 opacity-0 motion-reduce:hidden md:bottom-12"
            >
              <div className="relative flex flex-row items-center gap-2.5">
                {/* Línea fina conectora — igual que en el indicador vertical. */}
                <span
                  aria-hidden="true"
                  className="bg-azul-principal/10 absolute top-1/2 right-1 left-1 h-px -translate-y-1/2"
                />
                {/* Tramo "Quiénes somos" — cápsula activa que crece con la
                    lectura (arranca como punto y se alarga a 36px). */}
                <span
                  data-qs-seg="0"
                  className="relative h-1.5 rounded-full"
                  style={{
                    width: 8,
                    backgroundColor: "var(--color-naranja-accion)",
                    transition: "none",
                  }}
                />
                {/* Tramo "Misión" — punto inactivo hasta el barrido. */}
                <span
                  data-qs-seg="1"
                  className="relative h-1.5 rounded-full"
                  style={{
                    width: 8,
                    backgroundColor: "rgb(31 45 77 / 0.18)",
                    transition: "none",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
