"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Cuál de las secciones dadas (ids) está "activa": la última cuyo borde
 * superior ya pasó el 40% de la pantalla. Es la MISMA regla que usa
 * IndicePagina (la columna del borde derecho), así el navbar y el índice
 * nunca marcan dos secciones distintas. Antes de la primera: null.
 *
 * Solo mide si hay ids (el navbar la usa con los destinos de la página
 * actual; en otra página la lista está vacía y no cuesta nada).
 */
export function useSeccionActiva(ids: readonly string[]): string | null {
  const pathname = usePathname();
  const [activa, setActiva] = useState<string | null>(null);
  const clave = ids.join("|");

  useEffect(() => {
    if (!clave) return;
    const lista = clave.split("|");
    let raf = 0;
    const medir = () => {
      raf = 0;
      const vh = window.innerHeight;
      let actual: string | null = null;
      for (const id of lista) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= vh * 0.4) actual = id;
      }
      setActiva(actual);
    };
    const pedir = () => {
      if (!raf) raf = requestAnimationFrame(medir);
    };
    pedir();
    window.addEventListener("scroll", pedir, { passive: true });
    window.addEventListener("resize", pedir);
    return () => {
      window.removeEventListener("scroll", pedir);
      window.removeEventListener("resize", pedir);
      cancelAnimationFrame(raf);
    };
  }, [clave, pathname]);

  // Sin ids (otra página) no hay activa, sin esperar al efecto.
  return clave ? activa : null;
}
