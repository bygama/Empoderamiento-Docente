type Ratio = "1:1" | "4:3" | "16:9" | "3:4" | "3:2";

const aspectClass: Record<Ratio, string> = {
  "1:1": "aspect-square",
  "4:3": "aspect-[4/3]",
  "16:9": "aspect-video",
  "3:4": "aspect-[3/4]",
  "3:2": "aspect-[3/2]",
};

type ImagePlaceholderProps = {
  label: string;
  ratio?: Ratio;
  hint?: string;
  variant?: "light" | "dark";
  className?: string;
};

/**
 * Slot visual para fotos pendientes. Sustituir por <Image> cuando esté
 * el activo. Indica claramente qué foto va y en qué ratio.
 */
export function ImagePlaceholder({
  label,
  ratio = "4:3",
  hint,
  variant = "light",
  className = "",
}: ImagePlaceholderProps) {
  const isDark = variant === "dark";
  return (
    <div
      role="img"
      aria-label={`Slot de imagen pendiente: ${label}`}
      className={`relative w-full overflow-hidden rounded-2xl border-2 border-dashed ${aspectClass[ratio]} ${
        isDark
          ? "border-white/20 bg-white/[0.04]"
          : "border-azul-principal/15 bg-gris-fondo/40"
      } ${className}`}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`h-10 w-10 ${isDark ? "text-white/40" : "text-azul-principal/30"}`}
          aria-hidden="true"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-5-5L5 21" />
        </svg>
        <div className="space-y-1.5">
          <p
            className={`font-display text-[0.95rem] leading-tight font-bold ${
              isDark ? "text-white/80" : "text-azul-principal/80"
            }`}
          >
            {label}
          </p>
          {hint ? (
            <p
              className={`max-w-[14rem] font-sans text-[0.78rem] leading-snug ${
                isDark ? "text-white/50" : "text-gris-texto"
              }`}
            >
              {hint}
            </p>
          ) : null}
          <p
            className={`font-sans text-[0.65rem] font-medium tracking-[0.22em] uppercase ${
              isDark ? "text-white/30" : "text-azul-principal/30"
            }`}
          >
            {ratio} · imagen pendiente
          </p>
        </div>
      </div>
    </div>
  );
}
