"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, type ReactNode } from "react";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Reveal de foto "la señal se enfoca": la imagen llega desenfocada, desaturada
 * y un toque apagada, y se ENFOCA al entrar al viewport — el mismo idioma del
 * faro que el ScrambleText (una señal que se aclara), en vez del wipe de
 * clip-path que usa el resto del sitio. Play-once; al terminar limpia filter y
 * transform para no dejar costo de compositing. Con prefers-reduced-motion la
 * foto queda estática y nítida. Lo usan la tapa de Novedades y la ficha de
 * cada nota (Gastón, 2026-09-11: la foto de la ficha aparecía de una).
 */
export function RevealFoco({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    const inner = el.firstElementChild as HTMLElement | null;
    if (!inner) return;
    const ctx = gsap.context(() => {
      gsap.set(inner, {
        autoAlpha: 0,
        scale: 1.1,
        filter: "blur(18px) saturate(0.3) brightness(0.85)",
      });
      const tl = gsap.timeline({
        delay,
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
      });
      tl.to(inner, { autoAlpha: 1, duration: 0.45, ease: "power1.out" }, 0).to(
        inner,
        {
          filter: "blur(0px) saturate(1) brightness(1)",
          scale: 1,
          duration: 1.25,
          ease: "power2.out",
          clearProps: "filter,transform",
        },
        0.05,
      );
    }, el);
    return () => ctx.revert();
  }, [reduced, delay]);

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      {/* El overscale 1.1 cubre el sangrado de bordes que produce el blur. */}
      <div className="h-full w-full">{children}</div>
    </div>
  );
}
