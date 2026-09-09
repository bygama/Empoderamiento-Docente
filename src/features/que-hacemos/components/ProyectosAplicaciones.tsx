"use client";

import { useRef, useState } from "react";
import {
  CAPITULOS,
  FICHAS,
  PROYECTOS_INTRO,
} from "@/features/que-hacemos/proyectos";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { ALTO_SVH } from "./proyectos-aplicaciones/proyectos-escena";
import { crearFichas } from "./proyectos-aplicaciones/coreografia-fichas";
import { CintaProyectos } from "./proyectos-aplicaciones/CintaProyectos";
import { FichaProyecto } from "./proyectos-aplicaciones/FichaProyecto";
import { ColumnaCapitulo } from "./proyectos-aplicaciones/ColumnaCapitulo";
import { TituloGrande } from "./proyectos-aplicaciones/TituloGrande";

// Índice de la primera ficha de cada capítulo.
const CAP_INICIO = CAPITULOS.map((cap) =>
  FICHAS.findIndex((f) => f.id === cap.fichas[0].id),
);

/**
 * «Así se ve en la práctica»: la prueba de Qué hacemos, como un ARCHIVO DE
 * FICHAS (sitemap §6; Gastón, 2026-09-09, sobre la referencia de
 * assistantly.com). Escenario clavado: a la izquierda queda fijo el título
 * del capítulo; a la derecha las fichas caen una por una sobre una pila y
 * las anteriores se hunden atrás, como hojas apoyadas. Cada ficha dice UNA
 * cosa —el número, el nombre, una frase— para que se lea entera. Es el
 * mismo lenguaje de los expedientes de Investigación: allá casos, acá
 * proyectos. Detrás, la víbora de Niveles sigue: cruza en solitario con la
 * cámara siguiéndola y se va con la cuarta ficha. Antes era texto plano en
 * tres bloques con párrafos largos: nadie los leía.
 *
 * Solo desktop con mouse y con motion (celular: fallback estático, sin
 * más trabajo por ahora). Piezas: datos en `proyectos.ts`; el resto en
 * `proyectos-aplicaciones/` (escena, coreografía, cinta, ficha, dibujos).
 */
export function ProyectosAplicaciones() {
  const zoneRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();
  const [live, setLive] = useState(false);

  useIsomorphicLayoutEffect(() => {
    if (reduced) return;
    if (!window.matchMedia("(hover: hover) and (min-width: 1024px)").matches)
      return;
    setLive(true);
    const zone = zoneRef.current;
    const stage = stageRef.current;
    if (!zone || !stage) return;
    let cleanup: (() => void) | undefined;
    const run = () => crearFichas(zone, stage, CAP_INICIO);
    if (document.fonts?.ready)
      document.fonts.ready.then(() => (cleanup = run()));
    else cleanup = run();
    return () => cleanup?.();
  }, [reduced]);

  const rotulo =
    "text-gris-texto font-sans text-[0.78rem] font-medium tracking-[0.22em] uppercase";

  return (
    <section
      ref={zoneRef}
      id="proyectos"
      data-indice="Proyectos"
      className={
        "bg-gris-fondo text-azul-principal " +
        (live ? "relative" : "scroll-mt-28")
      }
      style={live ? { height: `${ALTO_SVH}svh` } : undefined}
      aria-label="Proyectos y aplicaciones"
    >
      <div
        ref={stageRef}
        className={
          "isolate overflow-clip " +
          (live ? "sticky top-0 h-[100svh]" : "relative py-20 md:py-28")
        }
      >
        {/* La misma grilla de puntos de Niveles: la víbora cruza de una
            sección a la otra y el fondo no puede cambiar en la costura. */}
        {live && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:radial-gradient(circle,color-mix(in_srgb,var(--color-azul-principal)_22%,transparent)_1.1px,transparent_1.6px)] [background-size:22px_22px]"
          />
        )}

        {/* La cámara: todo lo que se ve en vivo cuelga de acá, y la
            coreografía le hace el zoom del tramo en solitario. */}
        <div data-camara className={live ? "absolute inset-0" : "contents"}>
          {live && <CintaProyectos />}

          <div
            className={
              live
                ? "absolute inset-0 z-10 mx-auto w-full max-w-[88rem] px-5 md:px-10"
                : "relative z-10 mx-auto w-full max-w-[88rem] px-5 md:px-10"
            }
          >
            {/* Encabezado: fijo arriba a la izquierda en vivo. */}
            <header
              data-texto
              className={
                live
                  ? "absolute top-24 left-5 md:top-28 md:left-10"
                  : "max-w-[62ch]"
              }
            >
              <p className={rotulo}>{PROYECTOS_INTRO.volanta}</p>
              <h2
                className="font-display mt-3 font-bold tracking-[-0.02em] text-balance"
                style={{
                  fontSize: live
                    ? "clamp(1.4rem, 1rem + 1.2vw, 1.9rem)"
                    : "2.75rem",
                  lineHeight: 1.1,
                }}
              >
                {PROYECTOS_INTRO.titulo}
              </h2>
            </header>

            {live ? (
              <>
                <ColumnaCapitulo />
                {/* El título de la sección en grande, durante el solo, donde
                  después cae la primera ficha. */}
                <TituloGrande />

                {/* La pila de fichas, a la derecha y centrada. */}
                <div className="absolute top-1/2 right-5 h-[30rem] w-[clamp(380px,34vw,40rem)] -translate-y-1/2 md:right-10">
                  {FICHAS.map((f, i) => (
                    <FichaProyecto key={f.id} ficha={f} n={i + 1} live />
                  ))}
                </div>
              </>
            ) : (
              <div className="mt-12 space-y-16 md:mt-16">
                {CAPITULOS.map((cap, c) => (
                  <div key={cap.id}>
                    <h3 className="font-display text-[1.75rem] leading-tight font-extrabold tracking-[-0.02em]">
                      {cap.titulo}
                    </h3>
                    <p className="text-gris-texto mt-3 max-w-[48ch] font-sans text-[1.05rem] leading-relaxed">
                      {cap.bajada}
                    </p>
                    <div className="mt-8 grid gap-5 sm:grid-cols-2">
                      {FICHAS.map((f, i) =>
                        f.cap === c ? (
                          <FichaProyecto
                            key={f.id}
                            ficha={f}
                            n={i + 1}
                            live={false}
                          />
                        ) : null,
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
