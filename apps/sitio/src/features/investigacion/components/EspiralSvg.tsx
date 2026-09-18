import {
  BISAGRA,
  NODOS,
  PATH_ESPIRAL,
  PATH_LAZO,
  RADIO_NODO,
  RADIO_PERSONAJE,
  VIEWBOX_ESPIRAL,
  rotuloNodo,
} from "./espiral";
import { numero } from "./estaciones";
import { ANOTACIONES, guiaAnotacion } from "./lamina-espiral";

/**
 * La espiral doble como dibujo: nodos, personaje, lazo. El SSR la dibuja
 * formada. En modo `lamina` todo va dentro de un grupo de cámara (que la
 * coreografía acerca y aleja) y se suman las guías de las anotaciones,
 * apagadas hasta que la coreografía las dibuja.
 */
export function EspiralSvg({ className = "", lamina = false }: { className?: string; lamina?: boolean }) {
  const dibujo = (
    <>
      <path
        data-espiral-path
        d={PATH_ESPIRAL}
        fill="none"
        stroke="var(--color-azul-medio)"
        strokeOpacity="0.55"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        data-espiral-lazo
        d={PATH_LAZO}
        fill="none"
        stroke="var(--color-verde-concepto)"
        strokeOpacity="0.85"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {NODOS.map(([x, y], k) => {
        const [rx, ry] = rotuloNodo(k);
        return (
          <g key={k}>
            <circle
              data-espiral-nodo
              cx={x}
              cy={y}
              r={RADIO_NODO}
              fill={k < BISAGRA ? "var(--color-azul-medio)" : "var(--color-verde-concepto)"}
            />
            <text
              data-espiral-rotulo
              x={rx}
              y={ry}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="var(--color-gris-texto)"
              fontSize="11"
              letterSpacing="0.14em"
              className="font-mono"
            >
              {numero(k)}
            </text>
          </g>
        );
      })}
      {lamina
        ? ANOTACIONES.map((_, i) => {
            const { x1, y1, x2, y2 } = guiaAnotacion(i);
            return (
              <line
                key={i}
                data-espiral-guia
                data-indice={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="var(--color-azul-medio)"
                strokeOpacity="0.55"
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0"
              />
            );
          })
        : null}
      {/* El personaje, en el primer nodo (posición SSR = nodo 0). */}
      <g data-espiral-personaje transform={`translate(${NODOS[0][0]} ${NODOS[0][1]})`}>
        <circle r={RADIO_PERSONAJE * 1.9} fill="var(--color-naranja-accion)" opacity="0.16" />
        <circle r={RADIO_PERSONAJE} fill="var(--color-naranja-accion)" />
      </g>
    </>
  );

  return (
    <svg
      data-espiral-svg
      viewBox={`0 0 ${VIEWBOX_ESPIRAL.w} ${VIEWBOX_ESPIRAL.h}`}
      role="img"
      aria-label="Espiral de dos vueltas con ocho estaciones: el ciclo pedagógico y el ciclo de evidencia, unidos por un lazo que vuelve al inicio"
      className={`h-auto w-full overflow-visible ${className}`}
    >
      {lamina ? <g data-espiral-camara>{dibujo}</g> : dibujo}
    </svg>
  );
}
