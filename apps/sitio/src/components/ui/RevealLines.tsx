"use client";

import {
  useEffect,
  useRef,
  type CSSProperties,
  type ElementType,
  type ReactNode,
  type Ref,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
  // Easing exacto del reveal de blueprintapps.io: cubic-bezier(0.65,0.2,0,1)
  CustomEase.create("bpReveal", "0.65,0.2,0,1");
}

type Props = {
  children: ReactNode;
  /** Tag a renderizar (h1, h2, p, div...). Default: div. */
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  /** start de ScrollTrigger. Default: "top 85%". */
  start?: string;
  /** delay extra antes de animar. */
  delay?: number;
  /**
   * false = texto plano sin reveal. Para remontajes donde el reveal ya se
   * vio (p. ej. un índice que se desmonta y vuelve): sin esto, cada
   * remontaje re-dispararía el SplitText completo.
   */
  enabled?: boolean;
};

/**
 * Reveal de líneas estilo blueprintapps.io: el texto SUBE desde detrás de un
 * borde recto, línea por línea, con stagger. Split por líneas reales con
 * SplitText (mask:"lines"), easing bpReveal (cubic-bezier 0.65,0.2,0,1) 1.5s,
 * stagger 0.1s. Play-once al entrar al viewport; al terminar revierte el
 * split (vuelve a texto normal → sin problemas de resize). Respeta
 * prefers-reduced-motion (muestra el texto plano).
 */
export function RevealLines({
  children,
  as = "div",
  className,
  style,
  start = "top 85%",
  delay = 0,
  enabled = true,
}: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced || !enabled) return;

    let split: SplitText | null = null;
    let trigger: ScrollTrigger | null = null;
    let cancelled = false;

    const run = () => {
      if (cancelled || !el) return;
      split = SplitText.create(el, { type: "lines", mask: "lines" });
      gsap.set(split.lines, { yPercent: 110 });
      const tween = gsap.to(split.lines, {
        yPercent: 0,
        duration: 1.5,
        ease: "bpReveal",
        stagger: 0.1,
        delay,
        scrollTrigger: { trigger: el, start, once: true },
        onComplete: () => {
          split?.revert();
          split = null;
        },
      });
      trigger = tween.scrollTrigger ?? null;
    };

    // Esperamos a que las fuentes carguen para que el corte de líneas sea
    // correcto (si no, SplitText divide con la fuente fallback).
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(run);
    } else {
      run();
    }

    return () => {
      cancelled = true;
      trigger?.kill();
      split?.revert();
    };
  }, [reduced, start, delay, enabled]);

  const Tag = as;
  return (
    <Tag ref={ref as Ref<HTMLElement>} className={className} style={style}>
      {children}
    </Tag>
  );
}
