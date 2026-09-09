import { CINTA, GROSOR } from "./proyectos-escena";

/**
 * La víbora de Niveles siguiendo por Proyectos (solo live, detrás de
 * todo): la misma pieza que `LazoViajero` —lazo azul medio con sombra y
 * cápsula verde perseguidora— sobre el recorrido de este escenario, más
 * una ESTELA: un trazo ancho y tenue que corre atrasado detrás de la cola
 * solo durante el tramo en solitario, como un desenfoque de movimiento. La
 * coreografía la hace viajar por dashoffset.
 */
const TRAZO = {
  fill: "none",
  strokeWidth: GROSOR,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  vectorEffect: "non-scaling-stroke",
} as const;

export function CintaProyectos() {
  return (
    <svg
      data-cinta-svg
      aria-hidden="true"
      viewBox="0 0 1440 900"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 z-0 h-full w-full"
    >
      <path
        data-estela
        d={CINTA}
        stroke="var(--color-azul-medio)"
        {...TRAZO}
        strokeWidth={GROSOR * 2.4}
        style={{ opacity: 0 }}
      />
      <path
        data-cinta
        d={CINTA}
        stroke="var(--color-azul-medio)"
        style={{ filter: "drop-shadow(0 20px 30px rgb(74 111 165 / 0.25))" }}
        {...TRAZO}
      />
      <path
        data-capsula
        d={CINTA}
        stroke="var(--color-verde-concepto)"
        {...TRAZO}
      />
    </svg>
  );
}
