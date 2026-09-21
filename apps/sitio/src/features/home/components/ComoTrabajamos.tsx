"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import type { ComoTrabajamos as ContenidoDeComoTrabajamos } from "@/features/home/contenido/como-trabajamos";
import { crearMetodo } from "./como-trabajamos/coreografia-metodo";
import { IndicadorPasos } from "./como-trabajamos/IndicadorPasos";
import { PasoMetodo } from "./como-trabajamos/PasoMetodo";

/**
 * Bloque sticky scroll-telling. h-[500vh] (380vh en celular: cinco
 * pantallas para cinco pasos se hacían largas con el dedo) + sticky top-0 h-screen
 * (sin pin:true — compatible con Lenis). 5 pasos con fotos reales que
 * se cross-fadean con el progreso del scroll. Timeline scrubbed mapea
 * 0→1 a las N fases (el número de pasos se lee del contenido). Nav lateral de
 * puntos sincronizado. Mask reveal del título de cada paso. Foto alterna
 * izq/der por índice.
 *
 * En celular (< md) cada paso es una columna: la foto ARRIBA, apaisada y de
 * alto fijo (`--metodo-foto`, igual para los cinco: si dependiera del texto
 * saltaría de tamaño en cada cruce), y el texto debajo, que crece hacia el aire
 * de abajo. Ese alto es lo que sobra de la pantalla después del header y del
 * texto más largo (unos 29rem), con piso y techo: en un celular bajo la foto se
 * achica y el texto entra entero. En uno alto sobra pantalla: `--metodo-arriba`
 * baja el conjunto para que no quede colgado del header con un hueco abajo. El alto es `svh` y no `vh`: en iPhone `100vh` mide sin la barra de
 * Safari y el final del texto quedaba detrás de ella.
 *
 * Piezas: el contenido llega por props (de
 * `features/home/contenido/como-trabajamos.ts` o de la base), la coreografía
 * en `como-trabajamos/coreografia-metodo.ts`, cada paso en `PasoMetodo`, los
 * puntos en `IndicadorPasos`. Este compositor solo arma la sección y dispara
 * la coreografía.
 */
export function ComoTrabajamos({ contenido, frases }: { contenido: ContenidoDeComoTrabajamos; frases: readonly string[] }) {
  const rootRef = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    const el = rootRef.current;
    if (!el) return;
    return crearMetodo(el);
  }, [reducedMotion]);

  // El número de cada paso («01»…) sale de su lugar: es estructura, no copy.
  // La frase de cada paso es la idea del verbo de Qué hacemos en el mismo lugar (la única fuente).
  const pasos = contenido.pasos.map((paso, i) => ({ ...paso, frase: frases[i], n: String(i + 1).padStart(2, "0") }));

  return (
    <section
      ref={rootRef}
      id="como-trabajamos"
      data-indice="Cómo trabajamos"
      data-section="metodo"
      className="bg-grain-light relative overflow-clip bg-gradient-to-b from-white via-white to-gris-fondo/20"
      aria-label="Cómo trabajamos"
    >
      <div className="relative h-[380vh] md:h-[500vh]">
        <div className="sticky top-0 flex h-svh flex-col overflow-hidden [--metodo-arriba:max(5.5rem,calc((100svh-36rem)/2))] [--metodo-foto:clamp(7.5rem,calc(100svh-29rem),16rem)] md:h-screen">

          {/* Glow verde ambiental */}
          <div
            data-glow-bg
            aria-hidden="true"
            className="pointer-events-none absolute -right-40 bottom-0 z-0 h-[44rem] w-[44rem] rounded-full opacity-40 blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgb(31 154 120 / 0.18) 0%, transparent 65%)",
            }}
          />

          {/* ── Recorrido de pasos (foto + indicador + texto). Sin encabezado:
              la composición ocupa todo el alto y se centra verticalmente. ── */}
          <div className="relative z-10 min-h-0 flex-1 overflow-hidden">
            <IndicadorPasos pasos={pasos} />

            {/* Pasos apilados */}
            <div className="absolute inset-0 flex items-center">
              {pasos.map((paso, idx) => (
                <PasoMetodo key={paso.n} paso={paso} idx={idx} />
              ))}
            </div>
          </div>

          {/* Sin salida propia: es un tramo del recorrido, y termina en
              «Evaluamos» para pasar limpio a las Áreas. El botón a Quiénes
              somos que había acá vive ahora en el panel «¿Quiénes somos?»
              (Gastón, 2026-09-11). */}
        </div>
      </div>
    </section>
  );
}
