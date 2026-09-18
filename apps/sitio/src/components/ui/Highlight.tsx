type Props = {
  children: React.ReactNode;
  /** Color del highlight. Default verde-concepto. Acepta tokens del @theme. */
  tone?: "verde" | "naranja";
};

/**
 * <mark> semántico con el highlight tipo marcador del manual de marca.
 * Anuncia "highlighted" en lectores de pantalla. El tinte default verde
 * respeta la regla del manual ("verde para conceptos"); naranja queda
 * disponible para CTAs textuales puntuales — usar con cuidado.
 */
export function Highlight({ children, tone = "verde" }: Props) {
  const decoration =
    tone === "verde"
      ? "decoration-verde-concepto"
      : "decoration-naranja-accion";
  return (
    <mark
      className={`bg-transparent text-inherit underline decoration-[0.12em] underline-offset-[0.15em] ${decoration}`}
    >
      {children}
    </mark>
  );
}
