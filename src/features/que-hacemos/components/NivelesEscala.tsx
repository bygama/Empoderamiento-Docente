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
 * En vivo la sección abre con «Del aula al sistema educativo.» EN GRANDE,
 * solo en escena con la víbora entrando, y la frase se achica al rincón
 * cuando cae la primera card (Gastón, 2026-09-10): es la tesis de la
 * sección y merece ser el título; «Niveles en los que intervenimos» pasa
 * a volanta. Misma gramática que abre Proyectos. El cierre de la quinta
 * es lo último que se ve, y el sticky se suelta con los cinco títulos en
 * escena. Historia de la frase: el remate ("Del aula, / al sistema
 * educativo." en pantalla propia, con las cards cediendo) se sacó
 * (Facundo, 2026-09-03) porque era una pantalla más que scrollear después
 * de la coreografía; la apertura ("Del aula," solo, con la coma en
 * suspenso) se sacó (Mateo, 2026-09-05) porque sin el remate quedaba
 * media frase colgada. Ahora vuelve entera y al principio, y no cuesta
 * scroll de más: la víbora ya está entrando mientras se lee.
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
// El final en verde, el acento de los conceptos: la frase grande sobre el
// gris quedaba plana de un solo color (Gastón, 2026-09-10). Proyectos hace
// lo opuesto: resalta el principio y en azul medio.
// «sistema educativo» siempre en el segundo renglón (Gastón, 2026-09-10),
// por eso el span es bloque y no depende del ancho.
const TITULO = (
  <>
    Del aula al
    <span className="text-verde-concepto-texto block">sistema educativo.</span>
  </>
);

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

        {/* Encabezado chico (en vivo aparece cuando cae la primera card y
            se queda a la vista toda la sección). */}
        <div
          data-nivel-encabezado
          className={
            live
              ? "absolute inset-x-0 top-0 z-20 mx-auto w-full max-w-screen-xl px-5 pt-24 md:px-10 md:pt-28"
              : "mx-auto w-full max-w-screen-xl px-5 md:px-10"
          }
        >
          <p className="text-gris-texto font-sans text-[0.78rem] font-medium tracking-[0.22em] uppercase">
            Niveles en los que intervenimos
          </p>
          <h2
            className="font-display text-azul-principal mt-3 max-w-[18ch] font-bold tracking-[-0.02em] text-balance"
            style={{ fontSize: "clamp(1.4rem, 1rem + 1.2vw, 1.9rem)", lineHeight: 1.1 }}
          >
            {TITULO}
          </h2>
          <p className="text-gris-texto mt-3 max-w-[38ch] font-sans text-[1rem] leading-relaxed">
            De lo micro a lo macro: cinco niveles donde la transformación se
            sostiene.
          </p>
        </div>

        {/* El título EN GRANDE de la apertura, a la derecha, lejos de por
            donde entra la víbora. Duplicado visual (aria-hidden): el h2
            real es el del encabezado. */}
        {live && (
          <div
            data-nivel-titulo-grande
            aria-hidden="true"
            className="text-azul-principal absolute top-1/2 right-5 z-20 w-[min(46vw,40rem)] -translate-y-1/2 md:right-10"
          >
            <p className="text-gris-texto font-sans text-[0.78rem] font-medium tracking-[0.22em] uppercase">
              Niveles en los que intervenimos
            </p>
            <p
              className="font-display mt-5 font-extrabold tracking-[-0.03em] text-balance"
              style={{ fontSize: "clamp(2.6rem, 1.2rem + 3.2vw, 4.4rem)", lineHeight: 1 }}
            >
              {TITULO}
            </p>
          </div>
        )}

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

      </div>
    </div>
  );
}
