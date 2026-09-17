import { MAX_ARISTAS, PUNTOS } from "../constelacion";
import { ESTRELLA, ESTRELLAS } from "./estrellas";

/**
 * La bandada: los 13 puntos de la constelación, dibujados como estrellas
 * del cielo. Una sola capa sobre toda la sección, por encima de la hoja,
 * con el viewBox del cielo: la estrella que la luz toca es la MISMA que
 * baja sobre la hoja, aterriza en la pregunta y después morfea en lupa,
 * red y espiral —sin relevo entre dos dibujos—. Las aristas viven acá
 * también, sin coordenadas hasta que la historia las traza sobre la hoja
 * (coreografia-historia.ts lleva las láminas de 400x480 a este viewBox
 * midiendo el hueco de la hoja).
 *
 * Y la chispa: la luz de la lámpara, pasajera número catorce. Nace del
 * cristal cuando el faro se apaga, vuela con la bandada, la pregunta la
 * guarda y reaparece en el vidrio de la lupa —la luz cambia de instrumento:
 * el faro alumbra el panorama, la lupa concentra en el detalle—. Un halo y
 * un núcleo, nada de conos: no es un segundo faro. Va debajo de los puntos,
 * para que el hallazgo se vea en el centro de la luz.
 *
 * Presentacional. El SSR dibuja el cielo estrellado: es lo que ven touch,
 * reduced-motion y las pantallas sin `lg`.
 */
export function Bandada() {
  return (
    <svg
      data-hero-bandada
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-50 h-full w-full"
    >
      <defs>
        <radialGradient id="hero-chispa-halo">
          <stop offset="0" stopColor="white" stopOpacity="0.85" />
          <stop offset="0.35" style={{ stopColor: "var(--color-azul-claro)" }} stopOpacity="0.32" />
          <stop offset="1" style={{ stopColor: "var(--color-azul-claro)" }} stopOpacity="0" />
        </radialGradient>
      </defs>
      <g stroke="var(--color-azul-medio)" strokeOpacity="0.45" strokeLinecap="round">
        {Array.from({ length: MAX_ARISTAS }, (_, j) => (
          <line key={j} data-hero-arista x1="0" y1="0" x2="0" y2="0" opacity="0" />
        ))}
      </g>
      <g data-hero-chispa opacity="0">
        <circle r="38" fill="url(#hero-chispa-halo)" />
        <circle r="3.6" fill="white" />
      </g>
      {ESTRELLAS.map(([x, y], i) => (
        <circle
          key={`e-${i}`}
          data-hero-estrella
          cx={x}
          cy={y}
          r={PUNTOS[i].r * ESTRELLA.tocada}
          fill={PUNTOS[i].color}
        />
      ))}
    </svg>
  );
}
