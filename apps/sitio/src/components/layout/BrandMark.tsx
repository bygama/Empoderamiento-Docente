import Image from "next/image";
import { siteConfig } from "@/config/site";

// Logos oficiales (public/brand). NUNCA redibujar el logo: se sirven los SVG
// del manual. `unoptimized` evita pasar el SVG por el optimizador de
// next/image (que lo bloquea sin dangerouslyAllowSVG).
// (Copia fiel del `Brand` del proyecto de referencia — el navbar de 3001.)
type Variant = "full" | "isotipo";
type Tone = "negativo" | "principal";

const SRC: Record<Variant, Record<Tone, string>> = {
  full: {
    negativo: "/brand/logo-ed-negativo.svg",
    principal: "/brand/logo-ed-principal.svg",
  },
  isotipo: {
    negativo: "/brand/logotipo-ed-negativo.svg",
    principal: "/brand/logotipo-ed-principal.svg",
  },
};

// Dimensiones intrínsecas (del viewBox) para reservar espacio y evitar CLS.
const DIMS: Record<Variant, { width: number; height: number }> = {
  full: { width: 625, height: 303 },
  isotipo: { width: 237, height: 303 },
};

interface BrandMarkProps {
  readonly variant?: Variant;
  /** `negativo` (blanco) sobre fondo oscuro; `principal` (navy) sobre claro. */
  readonly tone?: Tone;
  /** Controlar el alto con `h-* w-auto`. */
  readonly className?: string;
  readonly priority?: boolean;
}

export function BrandMark({
  variant = "full",
  tone = "principal",
  className,
  priority,
}: BrandMarkProps) {
  const { width, height } = DIMS[variant];
  return (
    <Image
      src={SRC[variant][tone]}
      width={width}
      height={height}
      alt={`Logo de ${siteConfig.name}`}
      className={className}
      priority={priority}
      unoptimized
      draggable={false}
    />
  );
}
