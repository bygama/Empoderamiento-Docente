"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { PASOS } from "@/features/home/data";
import { crearMetodo } from "./como-trabajamos/coreografia-metodo";
import { IndicadorPasos } from "./como-trabajamos/IndicadorPasos";
import { PasoMetodo } from "./como-trabajamos/PasoMetodo";

/**
 * Bloque sticky scroll-telling. h-[500vh] (380vh en celular: cinco
 * pantallas para cinco pasos se hacían largas con el dedo) + sticky top-0 h-screen
 * (sin pin:true — compatible con Lenis). 5 pasos con fotos reales que
 * se cross-fadean con el progreso del scroll. Timeline scrubbed mapea
 * 0→1 a las N fases (el número de pasos se lee de PASOS). Nav lateral de
 * puntos sincronizado. Mask reveal del título de cada paso. Foto alterna
 * izq/der por índice.
 *
 * Piezas: datos en `home/data.ts`, coreografía en `como-trabajamos/
 * coreografia-metodo.ts`, cada paso en `PasoMetodo`, los puntos en
 * `IndicadorPasos`. Este compositor solo arma la sección y dispara la
 * coreografía.
 */
export function ComoTrabajamos() {
  const rootRef = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    const el = rootRef.current;
    if (!el) return;
    return crearMetodo(el);
  }, [reducedMotion]);

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
        <div className="sticky top-0 flex h-screen flex-col overflow-hidden">

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
            <IndicadorPasos pasos={PASOS} />

            {/* Pasos apilados */}
            <div className="absolute inset-0 flex items-center">
              {PASOS.map((paso, idx) => (
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
