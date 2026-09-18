import Link from "next/link";
import { LogotipoEDInline } from "@/components/brand/LogotipoEDInline";
import { siteConfig } from "@/config/site";

type Props = {
  /** Variante del lockup. `full` = isotipo + wordmark en CSS · `compact` = solo isotipo. */
  variant?: "compact" | "full";
  /** Tema del logo. `dark` = sobre claro · `light` = sobre navy. */
  tone?: "dark" | "light";
  className?: string;
  /** Si es true, envuelve en `<Link href="/">`. */
  asLink?: boolean;
};

/**
 * Marca de ED.
 * - `compact` = solo el isotipo oficial (caja del faro + monograma ED).
 * - `full` = isotipo + wordmark "Empoderamiento Docente" ensamblado en CSS,
 *   no via `LogoED` con wordmark embebido en el SVG. Esto da control fino
 *   sobre el tamaño y peso del wordmark, que en el SVG oficial queda
 *   ilegible a las alturas que necesita el header.
 */
export function Brand({
  variant = "compact",
  tone = "dark",
  className = "",
  asLink = true,
}: Props) {
  const logoVariant = tone === "dark" ? "principal" : "negativo";
  // Manual de marca DESIGN.md §10: el wordmark usa dos colores —
  // "Empoderamiento" en el color base (navy / blanco) y "Docente" en
  // un azul secundario (azul-medio sobre claro, azul-claro sobre navy).
  const primaryColor = tone === "dark" ? "text-azul-principal" : "text-white";
  const secondaryColor =
    tone === "dark" ? "text-azul-medio" : "text-azul-claro";

  const content =
    variant === "full" ? (
      <span className={`inline-flex items-center gap-3 ${className}`}>
        <LogotipoEDInline
          variant={logoVariant}
          animate={false}
          className="h-12 w-auto md:h-14"
        />
        <span className="font-display text-lg leading-[1.05] font-bold tracking-tight md:text-xl">
          <span className={primaryColor}>Empoderamiento</span>
          <br />
          <span className={secondaryColor}>Docente</span>
        </span>
      </span>
    ) : (
      <LogotipoEDInline
        variant={logoVariant}
        animate={false}
        className={`h-12 w-auto md:h-14 ${className}`}
      />
    );

  if (!asLink) return content;

  return (
    <Link
      href="/"
      aria-label={`${siteConfig.name} — Inicio`}
      className="inline-flex"
    >
      {content}
    </Link>
  );
}
