"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

/**
 * Cursor personalizado con interpolación suave (gsap.quickTo). Solo se
 * monta en dispositivos con puntero fino (desktop). En touch/pointer:coarse
 * no muestra nada. Respeta useReducedMotion. El cursor nativo se oculta vía
 * clase en <html> solo cuando este cursor está activo.
 */
export function CustomCursor() {
  const reduced = useReducedMotion();
  const dotRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Solo en dispositivos con puntero fino (mouse real).
    if (!window.matchMedia("(pointer:fine)").matches) return;
    if (reduced) return;

    const dot = dotRef.current;
    if (!dot) return;

    // Mostrar el dot y ocultar cursor nativo
    dot.style.display = "block";
    document.documentElement.classList.add("has-custom-cursor");

    gsap.set(dot, { xPercent: -50, yPercent: -50, scale: 1 });

    const xTo = gsap.quickTo(dot, "x", { duration: 0.4, ease: "power3" });
    const yTo = gsap.quickTo(dot, "y", { duration: 0.4, ease: "power3" });

    const onMove = (e: MouseEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
    };

    const onEnter = () =>
      gsap.to(dot, { scale: 2.5, duration: 0.3, ease: "power2.out" });
    const onLeave = () =>
      gsap.to(dot, { scale: 1, duration: 0.3, ease: "power2.out" });

    const interactives = document.querySelectorAll("a, button, [data-cursor]");
    interactives.forEach((el) => {
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
    });

    window.addEventListener("mousemove", onMove);

    return () => {
      window.removeEventListener("mousemove", onMove);
      interactives.forEach((el) => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
      });
      dot.style.display = "none";
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, [reduced]);

  return (
    <div
      ref={dotRef}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-[9999] h-[10px] w-[10px] rounded-full bg-verde-concepto"
      style={{ display: "none", mixBlendMode: "difference" }}
    />
  );
}
