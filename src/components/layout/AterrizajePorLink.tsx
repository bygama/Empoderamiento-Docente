"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { aterrizarEn } from "@/lib/navegar";

/**
 * Al llegar a una página con `#seccion` en la URL (desde el navbar de otra
 * página, o por un link compartido), corta a esa sección una vez que sus
 * escenas pinneadas midieron (ver lib/navegar.ts). Vive en el layout: corre
 * en cada cambio de ruta y en la carga inicial. Si el hash no es una sección
 * (p. ej. el slug de un caso de Investigación, que abre su expediente) no
 * hace nada.
 */
export function AterrizajePorLink() {
  const pathname = usePathname();
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.replace(/^#/, ""));
    if (!id) return;
    return aterrizarEn(id);
  }, [pathname]);
  return null;
}
