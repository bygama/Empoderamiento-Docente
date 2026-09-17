type Props = {
  children: React.ReactNode;
  /** Tema: dark = sobre claro, light = sobre navy. */
  variant?: "dark" | "light";
  /** Largo del dash en clases Tailwind (default w-10). */
  dashClass?: string;
  className?: string;
};

/**
 * Eyebrow editorial: dash verde corto + label uppercase letterspaced.
 * Identidad recurrente del manual de marca (eyebrow de cada placa).
 */
export function Eyebrow({
  children,
  variant = "dark",
  dashClass = "w-10",
  className = "",
}: Props) {
  const labelColor =
    variant === "dark" ? "text-gris-texto" : "text-azul-claro/90";

  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <span
        aria-hidden="true"
        className={`bg-verde-concepto block h-px ${dashClass}`}
      />
      <span
        className={`font-sans text-[0.78rem] font-medium tracking-[0.22em] uppercase ${labelColor}`}
      >
        {children}
      </span>
    </span>
  );
}
