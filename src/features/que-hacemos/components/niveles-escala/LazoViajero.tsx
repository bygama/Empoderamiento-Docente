import { LAZO } from "./niveles-escena";

/**
 * Lazo viajero + cápsula perseguidora (solo live, detrás de las cards). La
 * coreografía los desliza por dashoffset y desvanece el SVG entero antes del
 * último cierre.
 */
export function LazoViajero() {
  return (
    <svg
      data-nivel-cinta
      aria-hidden="true"
      viewBox="0 0 1600 900"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 z-0 h-full w-full"
    >
      <path
        data-nivel-lazo
        d={LAZO}
        fill="none"
        stroke="var(--color-azul-medio)"
        strokeWidth={54}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        style={{ filter: "drop-shadow(0 20px 30px rgb(74 111 165 / 0.25))" }}
      />
      <path
        data-nivel-punto
        d={LAZO}
        fill="none"
        stroke="var(--color-verde-concepto)"
        strokeWidth={54}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
