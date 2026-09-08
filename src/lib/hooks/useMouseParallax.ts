"use client";

import type { RefObject } from "react";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";

type OpcionesParallax = {
  /** Custom properties que recibe el elemento, en -1..1 desde el centro del viewport. */
  x: string;
  y: string;
  /** Lerp por frame: más bajo = más retardo (trailing). */
  ease?: number;
  /** false apaga el RAF (reduced-motion, escena que no montó). */
  activo?: boolean;
  /** Exigir hover real (`matchMedia`): en touch el listener nunca dispararía. */
  soloHover?: boolean;
  /**
   * Selector (dentro del elemento) de las capas que de verdad transforman.
   * Reciben el `will-change` mientras el parallax corre y lo pierden al
   * desmontar: el hint es de la coreografía, no de la clase — permanente
   * promovía esas capas toda la sesión aunque nadie moviera el mouse.
   */
  promover?: string;
};

/**
 * Parallax de mouse: un solo RAF con lerp escribe dos custom properties sobre el
 * elemento (-1..1 desde el centro del viewport) y cada capa las multiplica por
 * su profundidad en un `calc()` del transform. GSAP nunca toca esos nodos, así
 * que no hay pelea de transforms. Compartido por el hero del home (`--pnx/--pny`)
 * y el de «Qué hacemos» (`--qhx/--qhy`): antes vivía duplicado en los dos.
 *
 * No escribe nada hasta el primer mousemove (`started`): el estado inicial de
 * las capas es el del SSR.
 */
export function useMouseParallax(
  ref: RefObject<HTMLElement | null>,
  { x, y, ease = 0.09, activo = true, soloHover = false, promover }: OpcionesParallax,
) {
  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el || !activo) return;
    if (soloHover && !window.matchMedia("(hover: hover)").matches) return;

    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let raf = 0;
    let started = false;
    const capas = promover ? Array.from(el.querySelectorAll<HTMLElement>(promover)) : [];
    for (const capa of capas) capa.style.willChange = "transform";
    const clamp = (v: number) => (v < -1 ? -1 : v > 1 ? 1 : v);
    const onMove = (e: MouseEvent) => {
      tx = clamp((e.clientX / window.innerWidth - 0.5) * 2);
      ty = clamp((e.clientY / window.innerHeight - 0.5) * 2);
      started = true;
    };
    const tick = () => {
      cx += (tx - cx) * ease;
      cy += (ty - cy) * ease;
      if (started) {
        el.style.setProperty(x, cx.toFixed(4));
        el.style.setProperty(y, cy.toFixed(4));
      }
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
      for (const capa of capas) capa.style.willChange = "";
    };
  }, [ref, x, y, ease, activo, soloHover, promover]);
}
