import Link from "next/link";
import type { ComponentType } from "react";
import type { IconProps } from "@/components/ui/icons";

// Sobre gris-fondo: el texto en azul-principal al 80 % da 6,78:1 y el activo,
// azul-principal sobre la pastilla blanca, 13,63:1. Ni naranja ni verde en la
// sidebar: el naranja es el CTA de cada pantalla y el verde, los conceptos
// (DESIGN.md §1).
const BASE =
  "flex h-11 items-center gap-3 rounded-xl px-3 text-admin-cuerpo transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azul-medio";
const ACTIVO = "bg-white font-medium text-azul-principal shadow-sm shadow-azul-principal/10";
const INACTIVO = "text-azul-principal/80 hover:bg-white/60 hover:text-azul-principal";

/** Un link de la sidebar. El activo lleva `aria-current="page"`: se anuncia, no solo se ve. */
export function ItemDeNavegacion({
  href,
  activo,
  Icono,
  children,
}: {
  href: string;
  activo: boolean;
  Icono: ComponentType<IconProps>;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} aria-current={activo ? "page" : undefined} className={`${BASE} ${activo ? ACTIVO : INACTIVO}`}>
      <Icono size={20} className="shrink-0" />
      {children}
    </Link>
  );
}
