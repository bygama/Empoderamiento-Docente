"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import type { ComoTrabajamos as ContenidoDeComoTrabajamos } from "@/features/home/contenido/como-trabajamos";
import { crearMetodo } from "./como-trabajamos/coreografia-metodo";
import { IndicadorPasos } from "./como-trabajamos/IndicadorPasos";
import { PasoMetodo } from "./como-trabajamos/PasoMetodo";

/**
 * Bloque sticky scroll-telling. h-[500vh] (380vh en celular: cinco
 * pantallas para cinco pasos se hacían largas con el dedo) + sticky top-[var(--visor-arriba,0px)] h-screen
 * (sin pin:true — compatible con Lenis). 5 pasos con fotos reales que
 * se cross-fadean con el progreso del scroll. Timeline scrubbed mapea
 * 0→1 a las N fases (el número de pasos se lee del contenido). Nav lateral de
 * puntos sincronizado. Mask reveal del título de cada paso. Foto alterna
 * izq/der por índice.
 *
 * En celular (< md) la pantalla se parte en DOS MITADES con el eje de puntos,
 * en fila, como bisagra: arriba la foto apaisada, centrada en su mitad; abajo
 * el texto. Tres medidas, las tres acá para que `PasoMetodo` e
 * `IndicadorPasos` compartan una sola cuenta:
 *  · `--metodo-linea`: dónde va el eje. La mitad exacta de la pantalla, salvo
 *    en los celulares bajos, donde el texto más largo (unos 19rem con su aire; algo más por debajo de 360px de ancho)
 *    no entra en media pantalla: ahí el eje sube lo justo.
 *  · `--metodo-foto`: el alto de la foto, igual en los cinco pasos —si
 *    dependiera del texto saltaría en cada cruce—: lo que deja la mitad de
 *    arriba sin el header ni el aire, con techo.
 *  · `--metodo-texto`: cuánto baja el texto desde el eje. Se centra en su
 *    mitad tomando de referencia el texto MÁS LARGO, no el de cada paso: así
 *    el título queda siempre a la misma altura y no salta al cruzar.
 * El alto es `svh` y no `vh`: en iPhone `100vh` mide sin la barra de Safari y
 * el final del texto quedaba detrás de ella.
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
        <div className="sticky top-[var(--visor-arriba,0px)] flex h-svh flex-col overflow-hidden [--metodo-foto:min(16rem,calc(var(--metodo-linea)-8rem))] [--metodo-linea:min(50svh,calc(100svh-19rem))] [--metodo-texto:max(1.75rem,calc((100svh-var(--metodo-linea)-15rem)/2))] max-[359px]:[--metodo-linea:min(50svh,calc(100svh-20.5rem))] md:h-screen">

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
