import Link from "next/link";

// Sobre azul-principal: el texto en azul-claro da 7,68:1 y el activo, blanco
// sobre el fondo blanco al 10 %, más. Ni naranja ni verde en la sidebar: el
// naranja es el CTA de cada pantalla y el verde, los conceptos (DESIGN.md §1).
const BASE = "relative flex items-center gap-2 rounded-lg px-3 py-2 text-admin-meta transition-colors";
export const ESTILO_ACTIVO =
  "bg-white/10 font-medium text-white before:absolute before:inset-y-2 before:left-0 before:w-1 before:rounded-full before:bg-azul-claro";
export const ESTILO_INACTIVO = "text-azul-claro hover:bg-white/5 hover:text-white";

/** Un link de la sidebar. El activo lleva `aria-current="page"`: se anuncia, no solo se ve. */
export function ItemDeNavegacion({ href, activo, children }: { href: string; activo: boolean; children: React.ReactNode }) {
  return (
    <Link href={href} aria-current={activo ? "page" : undefined} className={`${BASE} ${activo ? ESTILO_ACTIVO : ESTILO_INACTIVO}`}>
      {children}
    </Link>
  );
}
