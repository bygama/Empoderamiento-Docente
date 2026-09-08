"use client";

import {
  useEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  // Mismo ease que RevealLines (blueprintapps.io): cubic-bezier(0.65,0.2,0,1).
  // CustomEase.create() es idempotente por nombre → seguro registrarlo acá
  // también aunque RevealLines ya lo haya creado.
  CustomEase.create("bpReveal", "0.65,0.2,0,1");
}

/** Dirección desde la que se descubre la imagen (el borde "limpio" arranca ahí). */
type RevealFrom = "bottom" | "top" | "left" | "right";

type Props = {
  /** Imagen a revelar: <Image>, <ImagePlaceholder> o <img>. */
  children: ReactNode;
  /** clip-path inset inicial según la dirección del wipe. Default "bottom". */
  from?: RevealFrom;
  /** start de ScrollTrigger. Default "top 85%". */
  start?: string;
  /** Duración del wipe + settle en s. Default 1.2. */
  duration?: number;
  /** Overscale inicial del contenido (settle a 1). Default 1.08. */
  scaleFrom?: number;
  /** Delay extra antes de animar (para escalonar varias). Default 0. */
  delay?: number;
  /** Clases sobre el wrapper (p.ej. rounded-2xl, aspect, sombras). */
  className?: string;
  style?: CSSProperties;
};

// clip-path inset inicial (100% tapado del lado opuesto a `from`) → al revelar
// va a inset(0). El borde recto "descubre" la imagen desde `from`.
const INITIAL_CLIP: Record<RevealFrom, string> = {
  bottom: "inset(0 0 100% 0)", // descubre de arriba hacia abajo
  top: "inset(100% 0 0 0)",
  left: "inset(0 100% 0 0)",
  right: "inset(0 0 0 100%)",
};

const FINAL_CLIP = "inset(0 0 0 0)";

/**
 * Reveal de imagen "tope de gama" (idioma de blueprintapps.io portado al target):
 * un wipe con clip-path inset DESCUBRE la imagen tras un borde recto, mientras el
 * contenido interno se asienta con un overscale settle (scale 1.08 → 1). Ease
 * `bpReveal` (cubic-bezier 0.65,0.2,0,1), play-once al entrar al viewport.
 *
 * Wrapper agnóstico: envuelve <Image>, <ImagePlaceholder> o <img>. Solo anima
 * clip-path / transform / opacity (compositor-friendly). Respeta
 * prefers-reduced-motion (estado final visible, sin animación). Usa el mismo
 * ScrollTrigger ya sincronizado con Lenis vía LenisProvider del proyecto.
 */
export function RevealImage({
  children,
  from = "bottom",
  start = "top 85%",
  duration = 1.2,
  scaleFrom = 1.08,
  delay = 0,
  className = "",
  style,
}: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const wrap = wrapRef.current;
    const inner = innerRef.current;
    if (!wrap || !inner) return;

    const ctx = gsap.context(() => {
      gsap.set(wrap, {
        clipPath: INITIAL_CLIP[from],
        webkitClipPath: INITIAL_CLIP[from],
      });
      gsap.set(inner, { scale: scaleFrom, transformOrigin: "center center" });

      const tl = gsap.timeline({
        delay,
        scrollTrigger: { trigger: wrap, start, once: true },
      });

      tl.to(
        wrap,
        {
          clipPath: FINAL_CLIP,
          webkitClipPath: FINAL_CLIP,
          duration,
          ease: "bpReveal",
        },
        0,
      ).to(
        inner,
        { scale: 1, duration, ease: "bpReveal" },
        0, // settle en paralelo al wipe
      );
    }, wrap);

    return () => ctx.revert();
  }, [reduced, from, start, duration, scaleFrom, delay]);

  return (
    <div
      ref={wrapRef}
      data-reveal-image
      className={`overflow-hidden ${className}`}
      style={style}
    >
      {/* Capa interna: aloja el overscale settle SIN romper el clip del wrapper.
          h-full/w-full para que el contenido llene el wrapper. */}
      <div ref={innerRef} className="h-full w-full">
        {children}
      </div>
    </div>
  );
}
