import Link from "next/link";
import type { MouseEventHandler, ReactNode } from "react";
import { ArrowUpRight } from "./icons";

type Props = {
  href: string;
  children: ReactNode;
  /** light = sobre fondo claro · dark = sobre navy. */
  variant?: "light" | "dark";
  /** Flecha ↗ a la derecha del texto, como en el primario. Default false. */
  withArrow?: boolean;
  /** Para interceptar la navegación (por ejemplo, viajar con Lenis). */
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

/**
 * Botón secundario. Transparente + border. No compite con el primario
 * (no usa naranja). Foco accesible con outline verde-concepto.
 */
export function ButtonSecondary({
  href,
  children,
  variant = "light",
  withArrow = false,
  onClick,
}: Props) {
  const themed =
    variant === "light"
      ? "border-azul-principal/80 text-azul-principal hover:bg-azul-principal hover:text-white"
      : "border-white/70 text-white hover:bg-white hover:text-azul-principal";

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group focus-visible:outline-verde-concepto inline-flex items-center justify-center gap-2 rounded-lg border bg-transparent px-6 py-3 font-sans text-[0.95rem] font-medium transition-all focus-visible:outline-2 focus-visible:outline-offset-2 ${themed}`}
    >
      <span>{children}</span>
      {withArrow && (
        <ArrowUpRight
          size={16}
          className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      )}
    </Link>
  );
}
