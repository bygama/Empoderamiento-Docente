"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getLenis } from "@/lib/lenis";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";

/** Debajo del logo y el menú flotantes: donde queda la cabecera del área abierta. */
const TOPE_PX = 76;

/**
 * Los desplegables de las áreas en celular: UNA abierta por vez.
 *
 * Al abrir una se cierra la anterior, y si esa estaba más arriba la página
 * se acortaría de golpe y el área tocada saltaría hacia arriba. Por eso, en
 * el mismo frame del cambio, se compensa el scroll para que la cabecera
 * tocada quede exactamente donde estaba, y recién ahí se desliza (Lenis)
 * hasta dejarla arriba, que es donde queda pegada mientras se lee.
 *
 * Llegar con `#area-<id>` en la dirección la abre.
 */
export function useDesplegableAreas(ids: string[]) {
  const [abierta, setAbierta] = useState<number | null>(null);
  const ancla = useRef<{ el: HTMLElement; top: number } | null>(null);

  const alternar = useCallback((i: number, cabecera: HTMLElement) => {
    ancla.current = { el: cabecera, top: cabecera.getBoundingClientRect().top };
    setAbierta((a) => (a === i ? null : i));
  }, []);

  useIsomorphicLayoutEffect(() => {
    const a = ancla.current;
    ancla.current = null;
    if (!a) return;
    const lenis = getLenis();
    const salto = a.el.getBoundingClientRect().top - a.top;
    if (Math.abs(salto) > 0.5) {
      if (lenis) lenis.scrollTo(window.scrollY + salto, { immediate: true, force: true });
      else window.scrollTo(0, window.scrollY + salto);
    }
    if (abierta === null) return;
    const articulo = a.el.closest("article");
    if (!articulo) return;
    const suave = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // En número y no el elemento: con el elemento, Lenis suma su
    // scroll-margin-top (scroll-mt-28, pensado para las anclas) y la
    // cabecera quedaba 112px más abajo.
    const destino = articulo.getBoundingClientRect().top + window.scrollY - TOPE_PX;
    if (lenis) lenis.scrollTo(destino, { duration: suave ? 0.9 : 0, immediate: !suave });
    else window.scrollTo({ top: destino, behavior: suave ? "smooth" : "auto" });
  }, [abierta]);

  // Llegar con el ancla de un área (los chips del hero, otra página) la
  // abre. Al cargar se mira en el frame siguiente, no durante el efecto.
  useEffect(() => {
    const desdeAncla = () => {
      if (!window.matchMedia("(max-width: 63.999rem)").matches) return;
      const i = ids.indexOf(window.location.hash.slice(1));
      if (i >= 0) setAbierta(i);
    };
    const raf = requestAnimationFrame(desdeAncla);
    window.addEventListener("hashchange", desdeAncla);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("hashchange", desdeAncla);
    };
  }, [ids]);

  return { abierta, alternar };
}
