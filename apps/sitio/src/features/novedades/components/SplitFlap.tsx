"use client";

import {
  useEffect,
  useRef,
  type CSSProperties,
  type ElementType,
} from "react";
import gsap from "gsap";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

const SETS = {
  auto: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  digits: "0123456789",
} as const;

const CELL_H = "1.06em";

type Props = {
  text: string;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  /** Glifos al azar que giran antes de fijar el real. Default 12. */
  cycles?: number;
  /** Retardo entre celdas (izq→der) en s. Default 0.05. */
  stagger?: number;
  /** Duración del giro de cada celda en s. Default 0.9. */
  duration?: number;
  /** Alfabeto del ruido. Default "auto". */
  charset?: keyof typeof SETS;
  /** Cuándo dispara: al montar o al entrar al viewport. Default "inview". */
  trigger?: "mount" | "inview";
};

/**
 * Tablero split-flap (tipo panel de aeropuerto): cada carácter gira por una
 * pila de glifos al azar y frena sobre el real, escalonado de izquierda a
 * derecha. Da la energía de "algo que acaba de llegar" — perfecto para las
 * novedades. Sin ninguna línea: es una bobina de texto que se detiene.
 *
 * El SSR es determinista: cada celda renderiza SOLO el carácter final (sizer
 * invisible + bobina con el real). Los glifos al azar se insertan recién en el
 * cliente, dentro del efecto — así no hay hydration mismatch ni Math.random en
 * el render. Truco anti-salto: el sizer reserva el ancho del carácter final,
 * la bobina va absoluta encima. Respeta prefers-reduced-motion (texto plano).
 */
export function SplitFlap({
  text,
  as = "span",
  className,
  style,
  cycles = 12,
  stagger = 0.05,
  duration = 0.9,
  charset = "auto",
  trigger = "inview",
}: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const root = ref.current;
    if (!root || reduced) return;

    const cells = gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll("[data-cell]"),
    );
    if (!cells.length) return;
    const glyphs = SETS[charset];
    const tweens: gsap.core.Tween[] = [];

    const run = () => {
      cells.forEach((cell, i) => {
        const reel = cell.querySelector<HTMLElement>("[data-reel]");
        const finalSpan = reel?.querySelector<HTMLElement>("[data-final]");
        if (!reel || !finalSpan || reel.dataset.built) return;
        reel.dataset.built = "1";

        // Insertar glifos al azar ANTES del carácter real (client-only).
        const frag = document.createDocumentFragment();
        for (let k = 0; k < cycles; k++) {
          const s = document.createElement("span");
          s.className = "block text-center";
          s.style.height = CELL_H;
          s.style.lineHeight = CELL_H;
          s.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
          frag.appendChild(s);
        }
        reel.insertBefore(frag, finalSpan);

        // OJO: offsetHeight redondea a entero y la celda mide 1.06em, que casi
        // nunca cae redondo. Con fuentes chicas (la fecha del hero: 12.8px →
        // celda de 13.56px) el redondeo a 14px acumula ~5px sobre 12 glifos y
        // la bobina frena a media celda del carácter real. getBoundingClientRect
        // devuelve el alto fraccional y frena exacto.
        const cellH =
          finalSpan.getBoundingClientRect().height ||
          cell.getBoundingClientRect().height;
        const n = reel.children.length; // cycles + 1
        tweens.push(
          gsap.fromTo(
            reel,
            { y: 0 },
            {
              y: -(n - 1) * cellH,
              duration,
              delay: i * stagger,
              ease: "power4.out",
            },
          ),
        );
      });
    };

    let io: IntersectionObserver | null = null;
    if (trigger === "mount") {
      if (document.fonts?.ready) document.fonts.ready.then(run);
      else run();
    } else {
      io = new IntersectionObserver(
        (entries, obs) => {
          if (entries[0]?.isIntersecting) {
            obs.disconnect();
            if (document.fonts?.ready) document.fonts.ready.then(run);
            else run();
          }
        },
        { threshold: 0.5 },
      );
      io.observe(root);
    }

    return () => {
      io?.disconnect();
      tweens.forEach((t) => t.kill());
    };
  }, [text, cycles, stagger, duration, reduced, trigger, charset]);

  const chars = Array.from(text);
  const Tag = as;

  return (
    <Tag ref={ref} className={className} style={style} aria-label={text}>
      {/* Texto real, invisible pero SELECCIONABLE. Las bobinas guardan ~12
          glifos al azar por celda que overflow-hidden tapa pero el portapapeles
          igual levanta: van select-none y esto es lo único que se copia. */}
      <span className="sr-only">{text}</span>
      {chars.map((ch, i) =>
        ch === " " ? (
          <span key={i} aria-hidden="true" className="inline-block select-none">
            &nbsp;
          </span>
        ) : (
          <span
            key={i}
            data-cell
            aria-hidden="true"
            className="relative inline-block overflow-hidden align-bottom select-none"
            style={{ height: CELL_H, lineHeight: CELL_H }}
          >
            {/* Sizer invisible: fija el ancho al carácter final. */}
            <span className="invisible block">{ch}</span>
            {/* Bobina: en SSR solo el real; los randoms se insertan en cliente. */}
            <span
              data-reel
              className="absolute inset-x-0 top-0 block"
            >
              <span
                data-final
                className="block text-center"
                style={{ height: CELL_H, lineHeight: CELL_H }}
              >
                {ch}
              </span>
            </span>
          </span>
        ),
      )}
    </Tag>
  );
}
