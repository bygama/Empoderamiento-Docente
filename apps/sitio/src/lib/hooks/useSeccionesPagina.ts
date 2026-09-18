"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export type SeccionPagina = { id: string; label: string };

/**
 * Lee las secciones de la página actual que se declaran para el índice:
 * cualquier elemento dentro de <main> con `data-indice="Rótulo"` y un `id`.
 * La lista sale del DOM, no de una config aparte, así el rótulo vive al lado
 * de la sección que nombra y no hay dos lugares que mantener. Se relee al
 * cambiar de ruta.
 */
export function useSeccionesPagina(): SeccionPagina[] {
  const pathname = usePathname();
  const [secciones, setSecciones] = useState<SeccionPagina[]>([]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const lista: SeccionPagina[] = [];
      document
        .querySelectorAll<HTMLElement>("main [data-indice]")
        .forEach((el) => {
          const label = el.dataset.indice?.trim();
          if (label && el.id) lista.push({ id: el.id, label });
        });
      setSecciones(lista);
    });
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  return secciones;
}
