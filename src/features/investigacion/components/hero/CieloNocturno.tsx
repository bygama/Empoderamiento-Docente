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
  [1320, 528, 0.9],
  [44, 264, 0.9],
  [1408, 132, 0.8],
  [396, 396, 0.8],
  [1012, 264, 0.9],
];

/**
 * El cielo del hero: la noche en degradé, el resplandor de la lámpara donde
 * está el foco (lo enciende la coreografía) y el polvo de estrellas de
 * fondo. Las 13 estrellas que importan —los puntos de la constelación—
 * viven en su propia capa, encima de todo (Bandada.tsx). Presentacional;
 * el data-attribute es el gancho de coreografia-encendido.ts.
 */
export function CieloNocturno() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      <span
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in srgb, var(--color-azul-principal) 58%, black) 0%, var(--color-azul-principal) 52%, color-mix(in srgb, var(--color-azul-principal) 76%, black) 100%)",
        }}
      />
      {/* Resplandor de la lámpara sobre el cielo, donde está el foco. */}
      <span
        data-hero-resplandor
        className="absolute inset-0 hidden lg:block"
        style={{
          background:
            "radial-gradient(34% 30% at 84% 28%, color-mix(in srgb, var(--color-azul-claro) 24%, transparent), transparent 70%)",
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
      </svg>
    </div>
  );
}
