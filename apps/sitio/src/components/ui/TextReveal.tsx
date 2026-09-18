"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type Props = {
  /** Texto a animar (se rompe en palabras). */
  text: string;
  /** Tag a renderizar como contenedor. Default `<span>`. */
  as?: "span" | "h1" | "h2" | "p";
  /** Clases sobre el contenedor (tipografía, color, size). */
  className?: string;
  /** Stagger entre palabras en s. Default 0.05. */
  stagger?: number;
  /** Duración por palabra. Default 0.7. */
  duration?: number;
  /** Delay total antes de arrancar. Default 0. */
  delay?: number;
  /** Cuándo animar: `mount` = al cargar la pieza · `scroll` = al entrar viewport. */
  trigger?: "mount" | "scroll";
  /** Si true, no animar (queda visible plano). */
  disabled?: boolean;
};

/**
 * Text reveal editorial — splittea el texto en palabras, las envuelve en
 * un wrapper con overflow:hidden, y cada palabra "sube" desde abajo con
 * stagger. Equivalente al "split text mask reveal" sin la lib paga de GSAP.
 *
 * Accesibilidad: el texto original sigue siendo leído de corrido por
 * lectores de pantalla (no rompe ARIA).
 */
export function TextReveal({
  text,
  as = "span",
  className = "",
  stagger = 0.05,
  duration = 0.7,
  delay = 0,
  trigger = "scroll",
  disabled = false,
}: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (disabled || reducedMotion) return;
    const target = ref.current;
    if (!target) return;

    const words = target.querySelectorAll<HTMLSpanElement>("[data-word-inner]");
    if (words.length === 0) return;

    const context = gsap.context(() => {
      gsap.set(words, { yPercent: 110 });

      gsap.to(words, {
        yPercent: 0,
        duration,
        ease: "power3.out",
        stagger,
        delay,
        ...(trigger === "scroll"
          ? {
              scrollTrigger: {
                trigger: target,
                start: "top 85%",
                once: true,
              },
            }
          : {}),
      });
    }, target);

    return () => context.revert();
  }, [disabled, reducedMotion, duration, stagger, delay, trigger]);

  const palabras = text.split(/\s+/).filter(Boolean);

  const inner = (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="inline">
        {palabras.map((palabra, i) => (
          <span
            key={`${palabra}-${i}`}
            data-word
            className="inline-block overflow-hidden align-bottom"
          >
            <span
              data-word-inner
              className="inline-block"
              style={
                disabled || reducedMotion
                  ? undefined
                  : { transform: "translateY(110%)" }
              }
            >
              {palabra}
            </span>
            {i < palabras.length - 1 && <span>&nbsp;</span>}
          </span>
        ))}
      </span>
    </>
  );

  // Render tag dinámico — TS necesita una keys-of-union por seguridad.
  if (as === "h1") {
    return (
      <h1
        ref={ref as React.RefObject<HTMLHeadingElement>}
        className={className}
      >
        {inner}
      </h1>
    );
  }
  if (as === "h2") {
    return (
      <h2
        ref={ref as React.RefObject<HTMLHeadingElement>}
        className={className}
      >
        {inner}
      </h2>
    );
  }
  if (as === "p") {
    return (
      <p
        ref={ref as React.RefObject<HTMLParagraphElement>}
        className={className}
      >
        {inner}
      </p>
    );
  }
  return (
    <span ref={ref as React.RefObject<HTMLSpanElement>} className={className}>
      {inner}
    </span>
  );
}
