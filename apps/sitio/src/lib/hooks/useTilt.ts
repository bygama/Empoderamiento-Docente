"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

/**
 * Inclina un elemento en 3D hacia el cursor (rotateX/rotateY según la posición
 * del puntero sobre la caja) + un leve levantamiento. Da esa sensación "física"
 * de que la card te responde. Devuelve un ref para colgar del elemento.
 *
 * Solo con puntero fino; respeta prefers-reduced-motion. El padre debería tener
 * perspective para que la inclinación se lea en profundidad.
 */
export function useTilt<T extends HTMLElement = HTMLDivElement>({
  max = 9,
  lift = 6,
}: { max?: number; lift?: number } = {}) {
  const ref = useRef<T | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    if (!window.matchMedia("(hover: hover)").matches) return;

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5; // -0.5..0.5
      const py = (e.clientY - r.top) / r.height - 0.5;
      gsap.to(el, {
        rotateY: px * max * 2,
        rotateX: -py * max * 2,
        y: -lift,
        duration: 0.4,
        ease: "power2.out",
        transformPerspective: 900,
        transformOrigin: "center center",
      });
    };
    const onLeave = () => {
      gsap.to(el, {
        rotateX: 0,
        rotateY: 0,
        y: 0,
        duration: 0.6,
        ease: "elastic.out(1,0.4)",
      });
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      gsap.killTweensOf(el);
    };
  }, [reduced, max, lift]);

  return ref;
}
