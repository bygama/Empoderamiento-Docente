"use client";

import type { Ref } from "react";
import { FIGURAS, MAX_ARISTAS, PUNTOS, VIEWBOX } from "./constelacion";

/**
 * La constelación de las láminas ED: 13 puntos de tinta sobre el papel que
 * morfean entre cuatro figuras (pregunta → lupa → red → espiral).
 *
 * Componente presentacional: el SSR renderiza la PREGUNTA formada (estado
 * estático para touch / reduced-motion y lo que se ve sin JS). Toda la
 * animación — reposo, entrega e historia scrolleada — vive en el hero vía
 * coreografia-hero.ts, que se engancha a los data-attributes de acá.
 */
export function ConstelacionInvestigacion({
  ref,
  className = "",
  figuraActiva,
}: {
  ref?: Ref<HTMLDivElement>;
  className?: string;
  /** Índice de la figura que anuncia el rótulo mono (estado del reposo). */
  figuraActiva: number;
}) {
  const figuraBase = FIGURAS[0];

  return (
    <div ref={ref} className={`relative ${className}`}>
      <svg
        data-constelacion-svg
        viewBox={`0 0 ${VIEWBOX.w} ${VIEWBOX.h}`}
        role="img"
        aria-label="Constelación de puntos que forma un signo de pregunta y se transforma en lupa, red y espiral"
        className="h-auto w-full overflow-visible"
      >
        <g stroke="var(--color-azul-medio)" strokeOpacity="0.45" strokeWidth="1.5" strokeLinecap="round">
          {Array.from({ length: MAX_ARISTAS }, (_, j) => {
            const arista = figuraBase.aristas[j];
            const [a, b] = arista ?? [0, 0];
            return (
              <line
                key={j}
                data-arista
                x1={figuraBase.puntos[a][0]}
                y1={figuraBase.puntos[a][1]}
                x2={figuraBase.puntos[b][0]}
                y2={figuraBase.puntos[b][1]}
                opacity={arista ? 1 : 0}
              />
            );
          })}
        </g>
        {PUNTOS.map((p, i) => (
          <circle
            key={i}
            data-punto
            cx={figuraBase.puntos[i][0]}
            cy={figuraBase.puntos[i][1]}
            r={p.r}
            fill={p.color}
          />
        ))}
      </svg>

      {/* Rótulo mono de la figura activa (solo en reposo: la historia lo
          releva con el riel 01–04). */}
      {/* Caja holgada (1.4em) con texto centrado: la fuente mono desborda
          una caja de 1em justo y las letras se cortaban abajo. */}
      <div
        data-constelacion-rotulo
        aria-hidden="true"
        className="text-gris-texto/80 mt-4 flex items-center gap-3 font-mono text-[0.7rem] tracking-[0.22em] uppercase"
      >
        <span className="tabular-nums">
          0{figuraActiva + 1} / 04
        </span>
        <span className="relative block h-[1.4em] flex-1 overflow-hidden">
          {FIGURAS.map((f, i) => (
            <span
              key={f.id}
              className={`absolute inset-0 flex items-center transition-all duration-500 ${
                i === figuraActiva
                  ? "translate-y-0 opacity-100"
                  : "translate-y-3 opacity-0"
              }`}
            >
              {f.etiqueta}
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}
