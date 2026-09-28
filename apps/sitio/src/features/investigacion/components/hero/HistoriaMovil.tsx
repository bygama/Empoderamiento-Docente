"use client";

import { Fragment, useRef } from "react";
import type { HeroInvestigacion } from "@/features/investigacion/contenido/hero";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { DISPERSION, FIGURAS, MAX_ARISTAS, PUNTOS, VIEWBOX } from "../constelacion";
import { ALTO_HISTORIA_LVH, crearHistoriaMovil } from "./coreografia-historia-movil";

/**
 * «Por qué investigamos» bajo `lg`: la historia del hero, que en escritorio
 * baja las estrellas sobre la hoja 01 y las morfea en cuatro figuras,
 * acá es una ESCENA CORTA: la constelación (los mismos 13 puntos y sus
 * aristas) se arma en la pregunta y cambia a lupa, red y espiral al
 * scrollear, con el riel 01–04, el verbo y la frase de cada etapa debajo.
 * Con movimiento reducido o pantallas bajas, las cuatro etapas en flujo con
 * su figura formada.
 *
 * La media query se escucha con `change` (no solo se lee al montar): rotar
 * el dispositivo o achicar la ventana puede cruzar el umbral de alto o de
 * ancho, y ahí hay que montar o desmontar la coreografía (y su
 * `data-modo`), no quedarse con la decisión del primer render.
 */
export function HistoriaMovil({ pasos }: { pasos: HeroInvestigacion["pasos"] }) {
  const zonaRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    const zona = zonaRef.current;
    if (!zona || reduced) return;
    const mq = window.matchMedia("(max-width: 63.999rem) and (min-height: 38.75rem)");
    let limpiar = () => {};
    const decidir = () => {
      limpiar();
      limpiar = () => {};
      if (mq.matches) {
        zona.dataset.modo = "movil";
        limpiar = crearHistoriaMovil(zona);
      } else {
        delete zona.dataset.modo;
      }
    };
    decidir();
    mq.addEventListener("change", decidir);
    return () => {
      mq.removeEventListener("change", decidir);
      limpiar();
      delete zona.dataset.modo;
    };
  }, [reduced]);

  return (
    <div
      ref={zonaRef}
      data-historia-movil
      role="region"
      aria-label="Por qué investigamos, en cuatro pasos"
      className="bg-azul-principal bg-grain-dark relative text-white lg:hidden data-[modo=movil]:h-[var(--alto)]"
      style={{ "--alto": `${ALTO_HISTORIA_LVH}lvh` } as React.CSSProperties}
    >
      <div data-hm-escena className="hidden flex-col px-6 pt-20 pb-10 [[data-modo=movil]_&]:flex [[data-modo=movil]_&]:sticky [[data-modo=movil]_&]:top-0 [[data-modo=movil]_&]:h-lvh md:px-12">
        <p className="text-azul-claro/70 font-mono text-[0.68rem] tracking-[0.2em] uppercase">Archivo ED · Hoja 01 · Por qué investigamos</p>
        {/* La figura: 13 puntos + aristas, viewBox de las láminas. */}
        <svg data-hm-svg viewBox={`0 0 ${VIEWBOX.w} ${VIEWBOX.h}`} aria-hidden="true" className="mx-auto mt-4 h-[38lvh] w-auto max-w-full md:h-[44lvh]">
          <g stroke="var(--color-azul-medio)" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round">
            {Array.from({ length: MAX_ARISTAS }, (_, j) => (
              <line key={j} data-hm-arista x1="0" y1="0" x2="0" y2="0" opacity="0" />
            ))}
          </g>
          {PUNTOS.map((p, i) => (
            <circle key={i} data-hm-punto cx={DISPERSION[i][0]} cy={DISPERSION[i][1]} r={p.r} fill={p.color} />
          ))}
        </svg>
        {/* Riel 01–04, verbo y frase (mismo idioma que la hoja 01). */}
        <div className="mt-auto">
          <div data-hm-riel className="flex items-center gap-3 font-mono text-[0.7rem] tracking-[0.22em] uppercase">
            {FIGURAS.map((f, i) => (
              <Fragment key={f.id}>
                <span data-hm-numero className="text-azul-claro/60 tabular-nums">0{i + 1}</span>
                {i < FIGURAS.length - 1 && (
                  <span className="relative h-px w-10 overflow-hidden bg-white/15">
                    <span data-hm-relleno className="bg-verde-concepto absolute inset-0 origin-left" />
                  </span>
                )}
              </Fragment>
            ))}
          </div>
          <div className="font-display relative mt-4 h-[1.4em] overflow-hidden text-[1.7rem] leading-[1.3] font-extrabold tracking-[-0.02em] md:text-[2.1rem]">
            {FIGURAS.map((f, i) => (
              <span key={f.id} data-hm-verbo className="absolute inset-0">{pasos[i]?.verbo}</span>
            ))}
          </div>
          <div className="text-azul-claro/85 mt-3 grid max-w-[38ch] text-[1rem] leading-relaxed md:text-[1.1rem]">
            {FIGURAS.map((f, i) => (
              <p key={f.id} data-hm-frase className="col-start-1 row-start-1">{pasos[i]?.frase}</p>
            ))}
          </div>
        </div>
      </div>
      {/* Fallback quieto (sin modo movil): las cuatro etapas en flujo. */}
      <ol data-hm-lista className="grid gap-10 px-6 pb-16 md:grid-cols-2 md:px-12 [[data-modo=movil]_&]:hidden">
        {FIGURAS.map((f, i) => (
          <li key={f.id}>
            <svg viewBox={`0 0 ${VIEWBOX.w} ${VIEWBOX.h}`} aria-hidden="true" className="h-40 w-auto">
              <g stroke="var(--color-azul-medio)" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round">
                {f.aristas.map(([a, b], j) => (
                  <line key={j} x1={f.puntos[a][0]} y1={f.puntos[a][1]} x2={f.puntos[b][0]} y2={f.puntos[b][1]} />
                ))}
              </g>
              {f.puntos.map(([x, y], k) => (
                <circle key={k} cx={x} cy={y} r={PUNTOS[k].r} fill={PUNTOS[k].color} />
              ))}
            </svg>
            <p className="text-azul-claro/60 mt-3 font-mono text-[0.68rem] tracking-[0.2em] uppercase">0{i + 1}</p>
            <h3 className="font-display mt-1 text-[1.4rem] font-extrabold">{pasos[i]?.verbo}</h3>
            <p className="text-azul-claro/85 mt-2 text-[1rem] leading-relaxed">{pasos[i]?.frase}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
