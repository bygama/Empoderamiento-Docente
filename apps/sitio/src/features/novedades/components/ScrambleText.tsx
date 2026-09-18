"use client";

import {
  useEffect,
  useRef,
  type CSSProperties,
  type ElementType,
} from "react";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/\\|<>[]{}=+*·";

type Props = {
  text: string;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  /** Duración total del decodificado en ms. Default 900. */
  duration?: number;
};

/**
 * Texto que se "decodifica": arranca como ruido de glifos y se va fijando
 * carácter por carácter (izq→der) hasta resolver la palabra real. Se dispara
 * una sola vez al entrar al viewport. Coherente con la idea de "señal" del
 * faro (algo que llega y se aclara), sin usar ninguna línea.
 *
 * El texto real va como contenido inicial (SSR/lector de pantalla correctos);
 * el JS solo pisa el textContent mientras dura el efecto y lo restituye al
 * final. Con prefers-reduced-motion no se toca nada: queda el texto plano.
 */
export function ScrambleText({
  text,
  as = "span",
  className,
  style,
  duration = 900,
}: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;

    let raf = 0;
    let start = 0;
    const chars = Array.from(text);

    const frame = (t: number) => {
      if (!start) start = t;
      const p = Math.min((t - start) / duration, 1);
      // Cuántos caracteres ya quedaron fijos (avanza izq→der).
      const fijos = Math.floor(p * chars.length);
      let out = "";
      for (let i = 0; i < chars.length; i++) {
        const c = chars[i];
        if (c === " " || i < fijos) {
          out += c;
        } else {
          out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
      }
      el.textContent = out;
      if (p < 1) {
        raf = requestAnimationFrame(frame);
      } else {
        el.textContent = text; // restituir el real (accesible)
      }
    };

    const io = new IntersectionObserver(
      (entries, obs) => {
        if (entries[0]?.isIntersecting) {
          obs.disconnect();
          raf = requestAnimationFrame(frame);
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      el.textContent = text;
    };
  }, [text, duration, reduced]);

  const Tag = as;
  return (
    <Tag ref={ref} className={className} style={style}>
      {text}
    </Tag>
  );
}
