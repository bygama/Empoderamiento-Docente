import { FIGURAS, PERSONAJE, PUNTOS, VIEWBOX, type Figura } from "./constelacion";

/**
 * Factor sobre el radio de cada punto del hero: la figura se ve chica (una
 * estampa de ~5rem), así que la tinta tiene que ser más gruesa para leerse.
 * coreografia-carta.ts lo usa para formar la figura con el mismo radio.
 */
export const RADIO_ESTAMPA = 2.3;

/**
 * Una figura de la constelación del hero, quieta, como estampa: los mismos
 * 13 puntos y colores de constelacion.ts en una de sus cuatro formas
 * (pregunta / lupa / red / espiral). Es el alfabeto de la página aplicado a
 * un contenido concreto — acá, cada fundamento de investigación lleva la
 * figura que lo dice.
 *
 * El SSR la dibuja formada. Los data-attributes (`data-figura-punto`,
 * `data-figura-arista`) dejan que una coreografía la desarme y la vuelva a
 * formar (puntos que caen en su lugar, aristas que se trazan).
 *
 * `personajeVisible=false` esconde el punto naranja (el personaje) con una
 * transición: la figura queda "sin su personaje" mientras este está en otro
 * lado de la sección (Líneas lo manda a marcar la fila abierta).
 */
export function FiguraConstelacion({
  id,
  className = "",
  personajeVisible = true,
}: {
  id: Figura["id"];
  className?: string;
  personajeVisible?: boolean;
}) {
  const figura = FIGURAS.find((f) => f.id === id) ?? FIGURAS[0];

  return (
    <svg
      data-figura={figura.id}
      viewBox={`0 0 ${VIEWBOX.w} ${VIEWBOX.h}`}
      aria-hidden="true"
      className={`h-auto overflow-visible ${className}`}
    >
      <g
        stroke="var(--color-azul-medio)"
        strokeOpacity="0.5"
        strokeWidth="3"
        strokeLinecap="round"
      >
        {figura.aristas.map(([a, b], j) => (
          <line
            key={j}
            data-figura-arista
            x1={figura.puntos[a][0]}
            y1={figura.puntos[a][1]}
            x2={figura.puntos[b][0]}
            y2={figura.puntos[b][1]}
          />
        ))}
      </g>
      {PUNTOS.map((p, i) => (
        <circle
          key={i}
          data-figura-punto
          cx={figura.puntos[i][0]}
          cy={figura.puntos[i][1]}
          r={p.r * RADIO_ESTAMPA}
          fill={p.color}
          style={
            i === PERSONAJE
              ? {
                  transformBox: "fill-box",
                  transformOrigin: "center",
                  transform: personajeVisible ? "scale(1)" : "scale(0)",
                  transition: "transform 450ms cubic-bezier(0.4, 0, 0.2, 1)",
                }
              : undefined
          }
        />
      ))}
    </svg>
  );
}
