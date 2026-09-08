"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "@/components/ui/icons";
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

          {/* ── CTA · banda propia, centrada → nunca toca el contenido ───── */}
          <div className="relative z-30 flex shrink-0 justify-center px-5 pt-2 pb-10 md:pb-12">
            <Link
              href="/que-hacemos"
              className="group focus-visible:outline-naranja-accion inline-flex items-center gap-3 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              <span className="border-azul-principal/15 text-azul-principal group-hover:border-naranja-accion group-hover:bg-naranja-accion inline-flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-500 group-hover:text-white">
                <ArrowRight
                  size={17}
                  className="transition-transform duration-300 group-hover:translate-x-0.5"
                />
              </span>
              <span className="text-azul-principal group-hover:text-naranja-accion font-sans text-[0.9rem] font-medium tracking-wide transition-colors duration-500">
                Ver cómo trabajamos en detalle
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
