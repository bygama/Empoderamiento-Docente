"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { esPaginaActiva } from "@/config/nav";
import { alClicSubirEnPagina } from "@/lib/navegar";

/**
 * Link de página del pie (logo, navegación y Contacto). Desde otra página
 * navega Next y aterriza arriba, en el hero; si ya estamos en esa página un
 * Link a la misma ruta no haría nada, así que pasa a subir al hero
 * deslizando, igual que el rótulo del navbar (Facundo, 2026-09-14: «desde
 * el nav o desde el pie, siempre al hero»). Es lo único de cliente que
 * necesita el pie, por eso vive aparte.
 */
export function LinkPie({
  href,
  className,
  children,
  ...resto
}: {
  href: string;
  className?: string;
  children: ReactNode;
  "aria-label"?: string;
}) {
  const pathname = usePathname();
  return (
    <Link href={href} onClick={alClicSubirEnPagina(esPaginaActiva(pathname, href))} className={className} {...resto}>
      {children}
    </Link>
  );
}
