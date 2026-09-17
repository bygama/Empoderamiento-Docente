"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

interface MagneticButtonProps {
  readonly children: ReactNode;
  readonly className?: string;
  /** Cuánto sigue al cursor (0–1). */
  readonly strength?: number;
}

/**
 * Envuelve un control y lo hace "magnético": sigue al cursor con easing y
 * vuelve a su lugar al salir. Solo `transform` (compositor-friendly).
 * Con reduced-motion no engancha listeners — queda estático.
 * (Portado fiel del navbar de la rama `nuevo-frontend`.)
 */
export function MagneticButton({
  children,
  className,
  strength = 0.4,
}: MagneticButtonProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reducedMotion = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    if (reducedMotion) return;
    const el = ref.current;
    if (!el) return;

    // El hint vive lo que vive el listener: promover el botón toda la sesión
    // (como hacía la clase) es una capa por CTA sin nadie que la use.
    el.style.willChange = "transform";
    const moveX = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3.out" });
    const moveY = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" });

    const onMove = (event: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      moveX((event.clientX - (rect.left + rect.width / 2)) * strength);
      moveY((event.clientY - (rect.top + rect.height / 2)) * strength);
    };
    const onLeave = () => {
      moveX(0);
      moveY(0);
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      el.style.willChange = "";
    };
  }, [reducedMotion, strength]);

  return (
    <span
      ref={ref}
      className={`inline-block ${className ?? ""}`}
    >
      {children}
    </span>
  );
}
