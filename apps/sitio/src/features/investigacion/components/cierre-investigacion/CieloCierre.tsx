import { PUNTOS } from "../constelacion";

/**
 * Los 13 puntos de la constelación del hero, de vuelta como estrellas
 * alrededor de la linterna (coordenadas del cielo, viewBox 1440x900). El haz
 * las va tocando al girar (coreografia-cierre: sin tocar → iluminada →
 * tocada). El naranja —el personaje— vive a la derecha, bajo: es el último
 * que la luz toca antes de posarse sobre el cierre.
 */
const ESTRELLAS: ReadonlyArray<readonly [number, number]> = [
  [396, 262],
  [484, 176],
  [572, 128],
  [660, 96],
  [808, 88],
  [900, 118],
  [988, 172],
  [1060, 258],
  [352, 372],
  [1096, 372],
  [440, 470],
  [776, 150],
  [1190, 330],
];

/** Estrellas de fondo: escasas, alineadas al grid de 44px del manual §6. */
const CIELO: ReadonlyArray<readonly [number, number, number]> = [
  [88, 132, 1.2],
  [220, 88, 0.9],
  [308, 220, 1.1],
  [176, 352, 0.8],
  [528, 44, 1],
  [704, 44, 0.9],
  [880, 44, 1.2],
  [1144, 88, 1],
  [1276, 176, 0.9],
  [1364, 308, 1.1],
  [1232, 440, 0.8],
  [132, 484, 1],
  [1320, 528, 0.9],
  [44, 264, 0.9],
  [1408, 132, 0.8],
];

/** El cielo del cierre: cae la noche sobre el archivo, con el resplandor de la linterna y las estrellas. */
export function CieloCierre() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      <span
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in srgb, var(--color-azul-principal) 58%, black) 0%, var(--color-azul-principal) 46%, color-mix(in srgb, var(--color-azul-principal) 76%, black) 100%)",
        }}
      />
      {/* Resplandor de la linterna sobre el cielo (la luz vive ahí). Solo
          desde `lg`: está puesto donde va el faro de escritorio, al centro; en
          celular el faro va abajo a la derecha y esto quedaba como una columna
          de luz suelta en medio del cielo. */}
      <span
        className="absolute inset-0 max-lg:hidden"
        style={{
          background:
            "radial-gradient(38% 34% at 50% 44%, color-mix(in srgb, var(--color-azul-claro) 22%, transparent), transparent 70%)",
        }}
      />
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
      >
        {CIELO.map(([x, y, r]) => (
          <circle key={`c-${x}-${y}`} cx={x} cy={y} r={r} fill="white" opacity="0.28" />
        ))}
        {ESTRELLAS.map(([x, y], i) => (
          <circle
            key={`e-${i}`}
            data-cierre-estrella
            cx={x}
            cy={y}
            r={PUNTOS[i].r * 0.95}
            fill={PUNTOS[i].color}
          />
        ))}
      </svg>
    </div>
  );
}
