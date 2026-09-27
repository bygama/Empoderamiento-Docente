import Link from "next/link";
import { FlechaIzquierda } from "./iconos";

export type DestinoDeVolver = { href: string; etiqueta: string };

/**
 * «← Contacto»: la vuelta de un detalle a su lista (DESIGN.md §11,
 * «Volver»). Va arriba del título, adentro del encabezado, donde el editor
 * lleva sus migas: un detalle tiene dos niveles y no necesita más. Meta
 * medium `azul-medio` (5,11:1 · 7,14:1), o `azul-claro` sobre el encabezado
 * navy (7,68:1). La flecha es decorativa: el link se lee «Contacto». No sabe
 * de ED.
 */
export function Volver({ href, etiqueta, resaltado = false }: DestinoDeVolver & { resaltado?: boolean }) {
  const color = resaltado ? "text-azul-claro focus-visible:outline-azul-claro" : "text-azul-medio focus-visible:outline-azul-medio";
  return (
    <Link
      href={href}
      className={`inline-flex min-h-6 items-center gap-1 rounded-sm text-admin-meta font-medium underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 ${color}`}
    >
      <FlechaIzquierda size={16} aria-hidden="true" className="shrink-0" />
      {etiqueta}
    </Link>
  );
}
