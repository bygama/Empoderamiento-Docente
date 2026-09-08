"use client";

import { useRef, useState } from "react";
import { NIVELES } from "../data";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { ALTO_SVH } from "./niveles-escala/niveles-escena";
import { crearNiveles } from "./niveles-escala/coreografia-niveles";
import { LazoViajero } from "./niveles-escala/LazoViajero";
import { NivelCard } from "./niveles-escala/NivelCard";

/**
 * "Niveles en los que intervenimos" — scroll-story CLAVADO, mismo lenguaje
 * que el ciclo de /investigacion (el patrón que quedó aprobado): los 5
 * niveles son cards que LLEGAN subiendo desde abajo, se PLANTAN abiertas y
 * SE CIERRAN (colapsan a solo el título) recién cuando la siguiente aterriza,
 * repartidas en zig-zag por todo el ancho — de lo micro a lo macro. Llegar y
 * cerrar van separados a propósito: antes la card empezaba a cerrarse a tres
 * cuartos de la subida y la descripción nunca estaba quieta para leerse.
 * Siempre hay UNA card abierta y quieta. Y cada cierre pasa SOLO, en el
 * hueco entre dos llegadas: si se superpone con la card que entra, el ojo
 * se va con la que entra y el cierre no se ve (ver CIERRE_INICIO).
 *
 * En vivo la sección es encabezado + cards y nada más: el cierre de la
 * quinta es lo último que se ve, y el sticky se suelta con los cinco
 * títulos en escena. Hubo dos piezas de titular que ya no están. El remate
 * ("Del aula, / al sistema educativo." en pantalla propia, con las cards
 * cediendo) se sacó (Facundo, 2026-09-03): era una pantalla más que
 * scrollear después de la coreografía, y la animación tiene que ser lo
 * último. La apertura ("Del aula," solo, con la coma en suspenso) se sacó
 * (Mateo, 2026-09-05): sin el remate que la completaba quedaba media frase
 * colgada. La frase entera sigue viva en el fallback sin motion.
 *
 * La timeline arranca ENTRADA_SVH de scroll ANTES de que el escenario se
 * clave, así el lazo ya viene entrando cuando la sección se traba (Mateo,
 * 2026-09-05). Las cards NO se corrieron: siguen arrancando con el
 * escenario ya clavado — por eso todo lo que no es el lazo va desplazado
 * ENTRADA unidades.
 *
 * Sin motion / touch / pantalla chica: no clava; grilla legible + titular.
 * `live` arranca en false (coincide con SSR).
 *
 * Piezas: geometría en `niveles-escala/niveles-escena.ts`, ritmo y timeline
 * en `coreografia-niveles.ts` (+ `toggle-nivel.ts`), lazo en `LazoViajero`,
 * cards en `NivelCard`.
 */
export function NivelesEscala() {
  const zoneRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();
  const [live, setLive] = useState(false);

  useIsomorphicLayoutEffect(() => {
    if (reduced) return;
    if (!window.matchMedia("(hover: hover) and (min-width: 768px)").matches) return;
    setLive(true);

    const zone = zoneRef.current;
    const stage = stageRef.current;
    if (!zone || !stage) return;

    const run = () => crearNiveles(zone, stage);

    // Los colapsables se miden con la tipografía definitiva.
    let cleanup: (() => void) | undefined;
    if (document.fonts?.ready) document.fonts.ready.then(() => (cleanup = run()));
    else cleanup = run();
    return () => cleanup?.();
  }, [reduced]);

  return (
    <div
      ref={zoneRef}
      id="niveles"
      data-indice="Niveles"
      // Mismo gris que trae la página desde la torre: con fondo blanco, la
      // cola de Qué hacemos alternaba gris / blanco / blanco / gris y cada
      // cambio era un corte seco (Facundo, 2026-09-03). Las cards son
      // blancas y sobre el gris se leen mejor como piezas.
      className={live ? "bg-gris-fondo relative" : "bg-gris-fondo"}
      style={live ? { height: `${ALTO_SVH}svh` } : undefined}
      aria-label="Niveles en los que intervenimos"
    >
      <div
        ref={stageRef}
        className={
          "overflow-clip " +
          (live ? "sticky top-0 h-[100svh]" : "relative flex min-h-[70svh] flex-col py-24")
        }
      >
        {/* Grilla de puntos §6: textura de base para que el escenario no
            quede pelado entre las cards. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:radial-gradient(circle,color-mix(in_srgb,var(--color-azul-principal)_22%,transparent)_1.1px,transparent_1.6px)] [background-size:22px_22px]"
        />

        {/* Lazo viajero + cápsula perseguidora (solo live, detrás de las cards). */}
        {live && <LazoViajero />}

        {/* Encabezado (se queda a la vista toda la sección). */}
        <div
          className={
            live
              ? "absolute inset-x-0 top-0 z-20 mx-auto w-full max-w-screen-xl px-5 pt-24 md:px-10 md:pt-28"
              : "mx-auto w-full max-w-screen-xl px-5 md:px-10"
          }
        >
          {/* Título en display: antes era una etiqueta mono de 11px y la
              sección no tenía ancla hasta el remate (el lazo se llevaba el
              ojo). Lejos de los 5rem del titular final, que sigue ganando. */}
          <h2
            className="font-display text-azul-principal max-w-[16ch] font-extrabold tracking-[-0.02em]"
            style={{ fontSize: "clamp(1.6rem, 1rem + 1.6vw, 2.15rem)", lineHeight: 1.1 }}
          >
            Niveles en los que intervenimos
          </h2>
          <p className="text-gris-texto mt-3 max-w-[38ch] font-sans text-[1rem] leading-relaxed">
            De lo micro a lo macro: cinco niveles donde la transformación se
            sostiene.
          </p>
        </div>

        {/* Los 5 niveles como cards. */}
        <div
          className={
            live
              ? "absolute inset-0 z-10"
              : "mx-auto mt-12 grid w-full max-w-screen-xl grid-cols-1 gap-5 px-5 sm:grid-cols-2 md:px-10"
          }
        >
          {NIVELES.map((niv, i) => (
            <NivelCard key={niv.k} niv={niv} i={i} live={live} />
          ))}
        </div>

        {/* En fallback el titular va al pie, visible. */}
        {!live && (
          <div className="mx-auto mt-14 w-full max-w-screen-xl px-5 md:px-10">
            <p
              className="font-display text-azul-principal font-extrabold tracking-[-0.03em]"
              style={{ fontSize: "clamp(2rem, 1rem + 4vw, 3.6rem)", lineHeight: 1.05 }}
            >
              Del aula,{" "}
              <span className="text-verde-concepto-texto">al sistema educativo.</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
