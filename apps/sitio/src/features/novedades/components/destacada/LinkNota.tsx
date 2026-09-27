"use client";

import Link from "next/link";
import { useRef, type ReactNode } from "react";
import type { NovedadDelSitio } from "@/features/novedades/contenido/novedad";
import { useTransicionFaro } from "../TransicionFaro";

/**
 * «Leer la nota» de la tapa: abre la ficha con la misma transición del faro
 * que las cards del listado (y calienta la ruta al primer hover, por el
 * compile en dev). Sin cuerpo, baja al listado. Nueva pestaña (ctrl, cmd,
 * shift, rueda): navegación normal, sin telón.
 */
export function LinkNota({ n, className, children }: { n: NovedadDelSitio; className: string; children: ReactNode }) {
  const abrir = useTransicionFaro();
  const calentado = useRef(false);
  const conFicha = n.cuerpo.length > 0;
  const href = conFicha ? `/novedades/${n.slug}` : "#ultimas";
  const calentar = () => {
    if (calentado.current || !conFicha) return;
    calentado.current = true;
    fetch(href).catch(() => {});
  };
  return (
    <Link
      href={href}
      className={className}
      onMouseEnter={calentar}
      onFocus={calentar}
      onClick={(e) => {
        if (!conFicha || !abrir || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        abrir(href);
      }}
    >
      {children}
    </Link>
  );
}
