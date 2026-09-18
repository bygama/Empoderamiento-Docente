type Shape = {
  type: "circle" | "ring" | "dots";
  className: string;
  /** Factor de parallax: + baja más lento, - sube. ~-0.3 a 0.3 */
  speed: number;
};

// Sets de formas ambientales por variante. Posiciones pensadas para
// vivir en los márgenes / aire, no sobre el contenido central.
const presets: Record<string, readonly Shape[]> = {
  left: [
    {
      type: "circle",
      className:
        "bg-verde-concepto/10 -left-24 top-[12%] h-72 w-72 blur-2xl",
      speed: 0.18,
    },
    {
      type: "ring",
      className: "border-verde-concepto/20 left-[6%] bottom-[14%] h-20 w-20",
      speed: -0.22,
    },
    {
      type: "dots",
      className: "left-[3%] top-[44%] h-28 w-28 opacity-60",
      speed: 0.1,
    },
  ],
  right: [
    {
      type: "circle",
      className:
        "bg-verde-concepto/10 -right-28 bottom-[18%] h-80 w-80 blur-2xl",
      speed: -0.16,
    },
    {
      type: "ring",
      className: "border-naranja-accion/30 right-[8%] top-[18%] h-14 w-14",
      speed: 0.24,
    },
    {
      type: "dots",
      className: "right-[4%] bottom-[10%] h-24 w-24 opacity-50",
      speed: -0.12,
    },
  ],
  split: [
    {
      type: "circle",
      className:
        "bg-verde-concepto/[0.08] -left-20 top-[20%] h-64 w-64 blur-2xl",
      speed: 0.2,
    },
    {
      type: "ring",
      className: "border-verde-concepto/20 right-[10%] top-[24%] h-16 w-16",
      speed: -0.2,
    },
    {
      type: "dots",
      className: "right-[5%] bottom-[16%] h-28 w-28 opacity-50",
      speed: 0.14,
    },
    {
      type: "ring",
      className: "border-azul-principal/15 left-[12%] bottom-[12%] h-10 w-10",
      speed: -0.26,
    },
  ],
};

/**
 * Capa de elementos gráficos ambientales del manual de marca (círculos
 * verdes, anillos, parches de puntos) que viven en el aire de una
 * sección y hacen parallax con el scroll. Decorativa, no interactiva.
 */
export function AmbientShapes({
  variant = "split",
}: {
  variant?: keyof typeof presets;
}) {
  const shapes = presets[variant] ?? presets.split;
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 hidden overflow-hidden md:block"
    >
      {shapes.map((s, i) => {
        if (s.type === "circle") {
          return (
            <span
              key={i}
              data-ambient
              data-ambient-speed={s.speed}
              className={`absolute rounded-full ${s.className}`}
            />
          );
        }
        if (s.type === "ring") {
          return (
            <span
              key={i}
              data-ambient
              data-ambient-speed={s.speed}
              className={`absolute rounded-full border-2 ${s.className}`}
            />
          );
        }
        // dots
        return (
          <span
            key={i}
            data-ambient
            data-ambient-speed={s.speed}
            className={`pattern-dots absolute ${s.className}`}
          />
        );
      })}
    </div>
  );
}
