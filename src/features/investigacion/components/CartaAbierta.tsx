"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { LaPostura, LaPregunta } from "./NotasCarta";
import { PuntosCampo } from "./PuntosCampo";
import { crearCarta } from "./coreografia-carta";

/** El título. Dos copias superpuestas en la coreografía (ver abajo). */
function Titulo({ tono }: { tono: "tinta" | "luz" }) {
  const luz = tono === "luz";
  return (
    <div className="flex flex-col items-center text-center">
      <h2
        className={`font-display font-extrabold tracking-[-0.025em] ${
          luz ? "text-white" : "text-azul-principal"
        }`}
        style={{ fontSize: "clamp(2.4rem, 1rem + 3.4vw, 4.2rem)", lineHeight: 1.04 }}
      >
        Nacimos de una pregunta.
      </h2>
    </div>
  );
}

/**
 * Sección 2 — Por qué investigamos (`#sentido`): las NOTAS DEL SOBRE.
 *
 * El copy es una carta en primera persona («nació de una pregunta», «no
 * investigamos desde afuera»), así que se presenta como tal: sobre el navy
 * que llega desde abajo, un sobre en el borde inferior del que salen dos
 * notas al ritmo del scroll y se apilan con un giro leve. Un solo gesto,
 * repetido, y nada más en pantalla. Coreografía en coreografia-carta.ts.
 *
 * Sin JS, en touch o con reduced-motion se muestra el estado final en
 * flujo: título y las dos notas una bajo la otra. Con puntero y desde
 * 1024px (`live`) el markup pasa a escenario de una pantalla antes del
 * primer paint (layout effect) y la coreografía toma el control.
 */
export function CartaAbierta() {
  const zonaRef = useRef<HTMLElement | null>(null);
  const hojaRef = useRef<HTMLDivElement | null>(null);
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
    const hoja = hojaRef.current;
    if (!zona || !hoja) return;
    const ctx = gsap.context(() => {
      crearCarta({ zona, hoja });
    }, zona);
    // El pin de la carta entra un render después que los triggers de las
    // secciones siguientes (live se decide en un layout effect): su spacer
    // corre todo lo de abajo, así que hay que recalcular los demás.
    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [live]);

  return (
    <section
      ref={zonaRef}
      id="sentido"
      data-indice="Sentido"
      aria-label="Por qué investigamos"
      className="bg-gris-fondo"
    >
      <div
        ref={hojaRef}
        className={`relative isolate overflow-hidden ${live ? "h-[100svh]" : "min-h-[100svh]"}`}
      >
        {/* ── El campo navy. En la coreografía es un círculo que crece desde
            el borde inferior (clip-path); estático, cubre todo. */}
        <div
          data-carta-campo
          className="bg-azul-principal bg-grain-dark absolute inset-0 -z-10"
        >
          {/* Grid de puntos, anclado abajo: sigue bajo las carpetas de líneas. */}
          <PuntosCampo anclaje="abajo" />
          {live && (
            // Copia en luz del título: vive ADENTRO del campo para que el
            // borde del círculo la revele (la copia en tinta queda DEBAJO del
            // campo, tapada por el navy) — inversión sin fade ni contorno.
            <div data-carta-titulo-luz className="absolute inset-x-0 top-[20svh] z-10 px-8">
              <Titulo tono="luz" />
            </div>
          )}
        </div>

        {live ? (
          <>
            {/* Copia en tinta del título: bajo el campo, visible solo donde
                el círculo todavía no llegó. */}
            {/* A 20svh (antes 14): pegado al header quedaba alto y el
                espacio hasta el sobre, vacío (Facundo, 2026-09-12). Las dos
                copias van a la misma altura, es lo que hace posible la
                inversión. */}
            <div
              data-carta-titulo-tinta
              className="absolute inset-x-0 top-[20svh] -z-20 px-8"
            >
              <Titulo tono="tinta" />
            </div>

            {/* ── El sobre, en el borde inferior. Las notas van entre la
                solapa (atrás) y el cuerpo (adelante), y salen por la boca;
                la segunda va después en el DOM: al salir se apila encima. */}
            <div
              data-carta-sobre
              className="absolute bottom-0 left-1/2 z-20 h-[36svh] w-[min(46rem,54vw)] -translate-x-1/2"
            >
              <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-[calc(100%-1px)] h-[9rem]"
                style={{
                  clipPath: "polygon(0 100%, 50% 0, 100% 100%)",
                  background:
                    "color-mix(in srgb, var(--color-azul-claro) 82%, var(--color-azul-principal))",
                }}
              />
              <LaPregunta live />
              <LaPostura live />
              <div
                aria-hidden="true"
                className="bg-azul-claro bg-grain-light border-azul-principal/20 absolute inset-0 z-20 rounded-t-md border-t shadow-[0_-18px_50px_-24px_rgb(0_0_0/0.6)]"
              >
                <span className="text-azul-principal/75 absolute top-8 left-1/2 -translate-x-1/2 font-mono text-[0.7rem] tracking-[0.22em] whitespace-nowrap uppercase">
                  Para quienes transforman la matemática escolar
                </span>
              </div>
            </div>
          </>
        ) : (
          /* ── Contenido en flujo (estático): título y las dos notas. */
          <div className="relative z-10 mx-auto max-w-screen-xl px-8 pt-28 pb-24">
            <Titulo tono="luz" />
            <LaPregunta live={false} />
            <LaPostura live={false} />
          </div>
        )}
      </div>
    </section>
  );
}
