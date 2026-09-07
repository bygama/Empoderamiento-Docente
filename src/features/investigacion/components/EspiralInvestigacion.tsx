"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Highlight } from "@/components/ui/Highlight";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { ROTULO_MICRO } from "../casos/tintes";
import { crearEspiral } from "./coreografia-espiral";
import { EspiralEstatica } from "./EspiralEstatica";
import { EspiralSvg } from "./EspiralSvg";
import {
  BISAGRA_TEXTO,
  REMATE_TEXTO,
  VUELTA_1,
  VUELTA_2,
  numero,
  type Estacion,
} from "./estaciones";

/** Bloque de estación en la escena: apilado en absoluto, lo releva la coreografía. */
function Bloque({ numeroTexto, nombre, texto, destacado }: Estacion & { numeroTexto: string }) {
  return (
    <div data-espiral-bloque="" className="absolute inset-0">
      <span className={`${ROTULO_MICRO} text-gris-texto/80 block tabular-nums`}>
        {numeroTexto}
      </span>
      <h3 className="font-display mt-2 text-[1.35rem] leading-tight font-bold lg:text-[1.55rem]">
        {nombre}
      </h3>
      <p className="mt-3 max-w-[42ch] text-[1rem] leading-[1.65] lg:text-[1.05rem]">{texto}</p>
      {destacado ? (
        <p className="text-azul-principal mt-3 max-w-[42ch] text-[1rem] leading-[1.6] font-medium">
          {destacado}
        </p>
      ) : null}
    </div>
  );
}

function Nota({ texto }: { texto: string }) {
  return (
    <div data-espiral-bloque="" className="absolute inset-0">
      <p className="font-display max-w-[34ch] text-[1.35rem] leading-[1.4] font-medium lg:text-[1.5rem]">
        {texto}
      </p>
    </div>
  );
}

/**
 * Secciones 4 y 5 — Ciclo de investigación aplicada (`#ciclo`) y Volvemos
 * a investigar (`#evidencia`), en UN solo escenario: la ESPIRAL DOBLE.
 *
 * Los dos ciclos de cuatro pasos se cuentan como una sola figura: la
 * espiral de «Transformar» del hero, agrandada a dos vueltas. El personaje
 * recorre la primera (el ciclo pedagógico); al llegar a la cuarta etapa no
 * se va —«no cierra el ciclo»— y sigue girando por la segunda (la
 * evidencia). Ahí cambia el título: «Implementar no es terminar». Al final
 * un lazo lo devuelve al primer nodo: abrimos otro ciclo. Hoja 03 del
 * archivo, sobre el mismo papel que el hero. Coreografía en
 * coreografia-espiral.ts; dibujo en EspiralSvg.tsx; copy en estaciones.ts.
 *
 * `#evidencia` es un ancla interna que salta a la bisagra.
 * Touch / reduced-motion: EspiralEstatica (que es también lo que dibuja el SSR).
 */
export function EspiralInvestigacion() {
  const zonaRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();
  const [live, setLive] = useState(false);

  useIsomorphicLayoutEffect(() => {
    if (reduced) {
      setLive(false);
      return;
    }
    setLive(window.matchMedia("(hover: hover) and (min-width: 64rem)").matches);
  }, [reduced]);

  useIsomorphicLayoutEffect(() => {
    if (!live) return;
    const zona = zonaRef.current;
    if (!zona) return;
    let restaurar = () => {};
    const ctx = gsap.context(() => {
      const escena = crearEspiral({ zona });
      restaurar = escena.restaurar;
      const { tl, progresoBisagra } = escena;
      ScrollTrigger.refresh();
      // Llegar por #evidencia aterriza en la bisagra, no al principio.
      if (window.location.hash === "#evidencia") {
        const st = tl.scrollTrigger;
        if (st) {
          requestAnimationFrame(() =>
            window.scrollTo(0, st.start + (st.end - st.start) * progresoBisagra),
          );
        }
      }
    }, zona);
    return () => {
      ctx.revert();
      restaurar();
    };
  }, [live]);

  return (
    <section id="ciclo" aria-label="Ciclo de investigación aplicada y evidencia" className="bg-gris-fondo">
      {/* ── La hoja 03: el escenario pinneado. */}
      <div ref={zonaRef} className="p-2.5">
        <div
          className={`ring-azul-principal/10 bg-grain-light text-azul-principal relative isolate overflow-hidden rounded-xl bg-white shadow-[0_24px_60px_-30px_rgb(31_45_77/0.25)] ring-1 ${
            live ? "flex h-[calc(100svh-1.25rem)]" : "min-h-[calc(100svh-1.25rem)]"
          }`}
        >
          <span className="text-gris-texto/70 absolute top-7 right-8 z-10 hidden font-mono text-[0.68rem] tracking-[0.2em] uppercase lg:block">
            Archivo ED · Hoja 03
          </span>

          {live ? (
            <div className="relative z-10 mx-auto my-auto grid w-full max-w-screen-xl items-center gap-x-16 px-6 py-10 md:px-12 lg:grid-cols-[0.95fr_1.05fr]">
              {/* Izquierda: la espiral. */}
              <div className="mx-auto w-full max-w-[min(500px,64svh)]">
                <EspiralSvg />
              </div>

              {/* Derecha: título y la estación actual (relevos). */}
              <div>
                <div className="relative min-h-[7.2rem] lg:min-h-[8.4rem]">
                  <h2
                    data-espiral-titulo
                    className="font-display absolute inset-x-0 top-0 max-w-[18ch] font-extrabold tracking-[-0.025em]"
                    style={{ fontSize: "clamp(1.9rem, 0.9rem + 2.2vw, 3rem)", lineHeight: 1.06 }}
                  >
                    Cómo una <Highlight>experiencia</Highlight> se convierte en
                    transformación.
                  </h2>
                  <h2
                    data-espiral-titulo
                    className="font-display absolute inset-x-0 top-0 max-w-[18ch] font-extrabold tracking-[-0.025em]"
                    style={{ fontSize: "clamp(1.9rem, 0.9rem + 2.2vw, 3rem)", lineHeight: 1.06 }}
                  >
                    Implementar no es <Highlight>terminar</Highlight>.
                  </h2>
                </div>
                <div className="relative mt-8 min-h-[15rem] lg:min-h-[16rem]">
                  {VUELTA_1.map((e, i) => (
                    <Bloque key={e.nombre} {...e} numeroTexto={`${numero(i)} / 08`} />
                  ))}
                  <Nota texto={BISAGRA_TEXTO} />
                  {VUELTA_2.map((e, i) => (
                    <Bloque key={e.nombre} {...e} numeroTexto={`${numero(i + VUELTA_1.length)} / 08`} />
                  ))}
                  <Nota texto={REMATE_TEXTO} />
                </div>
                {/* Ancla interna: Volvemos a investigar vive en la segunda vuelta. */}
                <span id="evidencia" aria-hidden="true" />
              </div>
            </div>
          ) : (
            <EspiralEstatica />
          )}
        </div>
      </div>
    </section>
  );
}
