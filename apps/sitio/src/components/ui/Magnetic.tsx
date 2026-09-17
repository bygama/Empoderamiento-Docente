"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

type Props = {
  children: ReactNode;
  /** Factor de desplazamiento magnético (0 = nulo, 1 = sigue el cursor). */
  strength?: number;
};

/**
 * Wrapper magnético: el hijo sigue levemente al cursor en hover, dando
 * sensación de "peso" y presencia al interactivo. Solo en dispositivos con
 * puntero fino; respeta useReducedMotion.
 */
export function Magnetic({ children, strength = 0.3 }: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();

  // Matar cualquier tween magnético pendiente al desmontar (evita tweens
  // huérfanos apuntando a un ref nulo si el componente se remonta).
  useEffect(() => {
    const el = wrapRef.current;
    return () => {
      if (el) gsap.killTweensOf(el);
    };
  }, []);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduced) return;
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) * strength;
    const dy = (e.clientY - cy) * strength;
    gsap.to(el, { x: dx, y: dy, duration: 0.4, ease: "power2.out" });
  };

  const handleLeave = () => {
    if (reduced) return;
    const el = wrapRef.current;
    if (!el) return;
    gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1,0.3)" });
  };

  return (
    <div
      ref={wrapRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ display: "inline-block" }}
    >
      {children}
    </div>
  );
}
