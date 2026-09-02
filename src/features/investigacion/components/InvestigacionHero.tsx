"use client";

import { Fragment, useRef, useState } from "react";
import gsap from "gsap";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Highlight } from "@/components/ui/Highlight";
import { ButtonPrimary } from "@/components/ui/ButtonPrimary";
import { ButtonSecondary } from "@/components/ui/ButtonSecondary";
import { RevealLines } from "@/components/ui/RevealLines";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { FIGURAS } from "./constelacion";
import { ConstelacionInvestigacion } from "./ConstelacionInvestigacion";
import {
  crearHistoria,
  crearIntroConstelacion,
  crearLoopConstelacion,
  crearRespiracion,
  crearVigiaVisibilidad,
  estadoInicialConstelacion,
  reagruparConstelacion,
  soltarConstelacion,
} from "./coreografia-hero";

/**
 * Sección 1 — Hero. Copy según docs/content/arquitectura-investigacion.md §3;
 * la bajada no se muestra entera: vive repartida en los cuatro beats de la
 * historia (constelacion.ts → frase).
 *
 * «La primera hoja del archivo», en dos actos sobre la misma hoja de papel:
 *
 * - **Acto 1 (reposo):** titular en tinta navy a la izquierda, constelación
 *   loopeando a la derecha. Único hero del sitio que abre en claro. El loop
 *   nunca muere: si el scroll vuelve al tope, lo retoma.
 * - **Acto 2 (la historia):** al scrollear, la hoja se pinnea; el titular
 *   cede y la figura se DESARMA — los puntos vuelan sueltos hacia la
 *   izquierda como bandada y se REARMAN en la pregunta, con las líneas
 *   redibujándose. Después corren los cuatro beats — riel 01–04 con línea
 *   verde viajera, verbo que se releva y frase que se pinta palabra por
 *   palabra al ritmo del scroll (pregunta → lupa → red → espiral).
 *   Desktop con puntero por ahora; touch/mobile ven el acto 1 estático.
 */
export function InvestigacionHero() {
  const zoneRef = useRef<HTMLElement | null>(null);
  const viajeroRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();
  const [figuraActiva, setFiguraActiva] = useState(0);

  useIsomorphicLayoutEffect(() => {
    if (reduced) return;
    if (!window.matchMedia("(hover: hover) and (min-width: 1024px)").matches)
      return;

    const zona = zoneRef.current;
    const viajero = viajeroRef.current;
    if (!zona || !viajero) return;

    const ctx = gsap.context(() => {
      const kit = {
        circulos: gsap.utils.toArray<SVGCircleElement>("[data-punto]"),
        lineas: gsap.utils.toArray<SVGLineElement>("[data-arista]"),
      };

      // Estados pre-paint: constelación dispersa, historia oculta.
      estadoInicialConstelacion(kit);
      gsap.set("[data-verbo]", { yPercent: 110 });
      gsap.set("[data-frase]", { autoAlpha: 0 });
      gsap.set("[data-riel-relleno]", { scaleX: 0 });

      // Entrada de las piezas que no maneja RevealLines.
      gsap.fromTo(
        "[data-hero-rise]",
        { autoAlpha: 0, y: 18 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.12,
          delay: 0.55,
        },
      );

      // Acto 1: intro autónoma; al terminar arranca el loop contemplativo
      // (salvo que el scroll ya haya tomado el control).
      const enHistoria = { actual: false };
      const loop = crearLoopConstelacion(kit, setFiguraActiva);
      const intro = crearIntroConstelacion(kit);
      intro.eventCallback("onComplete", () => {
        if (!enHistoria.actual) loop.play(0);
      });

      const respiracion = crearRespiracion(
        zona.querySelector("[data-constelacion-svg]")!,
      );

      // Acto 2: la historia scrubbeada. El control de la constelación se
      // presta con tweens autónomos cortos: al scrollear se SUELTA (bandada
      // dispersa), al volver al tope se REAGRUPA y el loop retoma su ciclo.
      let pase: gsap.core.Timeline | null = null;
      crearHistoria({
        zona,
        viajero,
        ...kit,
        onTomaControl: () => {
          enHistoria.actual = true;
          intro.pause();
          loop.pause();
          pase?.kill();
          pase = soltarConstelacion(kit);
        },
        onVueltaAlReposo: () => {
          enHistoria.actual = false;
          pase?.kill();
          pase = reagruparConstelacion(kit, () => {
            if (!enHistoria.actual) loop.play(0);
          });
          setFiguraActiva(0);
        },
      });

      // Play/pausa según visibilidad (no quemar batería fuera de viewport).
      crearVigiaVisibilidad(viajero, () => [respiracion]);
    }, zona);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={zoneRef} aria-label="Investigar para transformar" className="bg-gris-fondo p-2.5">
      {/* La hoja: único hero del sitio que abre en claro. */}
      <div className="ring-azul-principal/10 relative isolate flex min-h-[calc(100svh-1.25rem)] overflow-hidden rounded-xl bg-white bg-grain-light shadow-[0_24px_60px_-30px_rgb(31_45_77/0.25)] ring-1">
        {/* Folio de archivo (guiño al remate de la pila de expedientes). */}
        <span
          data-hero-rise
          className="text-gris-texto/70 absolute top-7 right-8 z-10 hidden font-mono text-[0.68rem] tracking-[0.2em] uppercase lg:block"
        >
          Archivo ED · Hoja 01
        </span>

        {/* Acto 1 — reposo: titular a la izquierda, constelación a la derecha. */}
        <div className="relative z-10 mx-auto my-auto grid w-full max-w-screen-xl items-center gap-x-16 gap-y-10 px-6 pt-28 pb-12 md:px-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div data-acto-hero>
            <div data-hero-rise>
              <Eyebrow>Investigación</Eyebrow>
            </div>
            <RevealLines
              as="h1"
              className="font-display text-azul-principal mt-6 max-w-[16ch] font-extrabold tracking-[-0.025em]"
              style={{
                fontSize: "clamp(2.4rem, 1rem + 2.9vw, 3.9rem)",
                lineHeight: 1.06,
              }}
            >
              <Highlight>Investigamos</Highlight> para transformar la
              matemática escolar.
            </RevealLines>
            <div data-hero-rise className="mt-9 flex flex-wrap gap-4">
              <ButtonPrimary href="#lineas">Conocé qué investigamos</ButtonPrimary>
              <ButtonSecondary href="/biblioteca">
                Explorá la Biblioteca
              </ButtonSecondary>
            </div>
          </div>

          <ConstelacionInvestigacion
            ref={viajeroRef}
            figuraActiva={figuraActiva}
            className="mx-auto w-full max-w-[300px] lg:ml-auto lg:max-w-[min(420px,52svh)]"
          />
        </div>

        {/* Acto 2 — la historia: destino de la constelación a la izquierda,
            riel + verbo + frase a la derecha. Invisible hasta que el scroll
            la revela (y siempre, si no corre la coreografía). */}
        <div
          data-historia
          aria-hidden="true"
          className="pointer-events-none invisible absolute inset-0 z-10 mx-auto grid w-full max-w-screen-xl items-center gap-x-16 px-6 opacity-0 md:px-12 lg:grid-cols-[0.95fr_1.05fr]"
        >
          <div>
            <div
              data-historia-destino
              className="mx-auto aspect-[400/480] w-full max-w-[min(460px,54svh)]"
            />
          </div>

          <div className="max-w-[44ch]">
            {/* Riel 01–04: la brújula de la historia. */}
            <div
              data-riel
              className="flex items-center gap-3 font-mono text-[0.7rem] tracking-[0.22em] uppercase"
            >
              {FIGURAS.map((f, i) => (
                <Fragment key={f.id}>
                  <span
                    data-riel-numero
                    className="text-gris-texto/80 tabular-nums"
                  >
                    0{i + 1}
                  </span>
                  {i < FIGURAS.length - 1 && (
                    <span className="bg-azul-principal/15 relative h-px w-12 overflow-hidden">
                      <span
                        data-riel-relleno
                        className="bg-verde-concepto absolute inset-0 origin-left"
                      />
                    </span>
                  )}
                </Fragment>
              ))}
            </div>

            {/* El verbo que se releva (empujado hacia arriba por el nuevo). */}
            {/* h holgada para los descendentes (la «g» de Preguntar) sin
                soltar el overflow-hidden que necesita el relevo. */}
            <div className="font-display text-azul-principal relative mt-8 h-[1.5em] overflow-hidden text-[2.1rem] leading-[1.35] font-extrabold tracking-[-0.02em] lg:text-[2.5rem]">
              {FIGURAS.map((f) => (
                <span key={f.id} data-verbo className="absolute inset-0">
                  {f.etiqueta}
                </span>
              ))}
            </div>

            {/* La frase que se pinta palabra por palabra. */}
            <div className="text-azul-principal/15 mt-5 grid max-w-[38ch] text-[1.05rem] leading-relaxed lg:text-[1.15rem]">
              {FIGURAS.map((f) => (
                <p key={f.id} data-frase className="col-start-1 row-start-1">
                  {f.frase.split(" ").map((palabra, k) => (
                    <span key={k} data-palabra>
                      {palabra}{" "}
                    </span>
                  ))}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
