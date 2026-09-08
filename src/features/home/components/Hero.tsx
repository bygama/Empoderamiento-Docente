"use client";

import { useRef, type CSSProperties } from "react";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { useMouseParallax } from "@/lib/hooks/useMouseParallax";
import { crearHero } from "./hero/coreografia-hero";
import { CampoCards } from "./hero/CampoCards";
import { CampoCardsMobile } from "./hero/CampoCardsMobile";
import { HeroCopy } from "./hero/HeroCopy";

/**
 * Hero adaptado a ED: título centrado rodeado por un campo de 9 tarjetas
 * dispersas en un hero alto (~1.85 viewports), sobre el campo de nodos
 * persistente. Animación de las cards portada del proyecto de referencia /
 * blueprintapps.io:
 *  - INTRO (al atravesar el gate): arrancan APILADAS en el centro, aparecen
 *    (scale 0.5→0.62) y se DESPLIEGAN a su lugar (scale →1, power3.inOut 1.7s,
 *    stagger desde el centro).
 *  - SCROLL: parallax por capa (`[data-card-outer]`, scrub).
 *  - MOUSE: un solo RAF con lerp setea `--pnx/--pny` (-1..1) y cada card se
 *    desplaza por su profundidad, EN CONTRA del mouse (`[data-card-mouse]`).
 *
 * Copy (idioma de Empoderamiento Docente): el titular entra LIMPIO, línea por
 * línea (fade-up con stagger, SIN blur), y después la descripción y las acciones
 * suben con un fade suave — así el texto no "molesta" al aparecer.
 * Respeta prefers-reduced-motion (sin animación, estado final visible).
 *
 * Piezas: tarjetas en `hero/hero-cards.ts`, coreografía en
 * `hero/coreografia-hero.ts` (+ `entrada-hero.ts`), campos en `CampoCards` /
 * `CampoCardsMobile`, copy en `HeroCopy`. Este compositor arma la sección y
 * dispara la coreografía desde el layout effect.
 */
export function Hero() {
  const ref = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();

  // Layout effect (síncrono, pre-paint): oculta las cards antes del primer
  // paint para que, sin gate, no haya flash del hero ya armado antes de animar.
  useIsomorphicLayoutEffect(() => {
    const scope = ref.current;
    if (!scope || reduced) return;
    return crearHero(scope);
  }, [reduced]);

  // Parallax de mouse (fórmula de la referencia): --pnx/--pny en -1..1 desde el
  // centro; cada card los multiplica por su profundidad ([data-card-mouse]) y se
  // desplaza EN CONTRA del mouse. El RAF con lerp vive en el hook compartido.
  useMouseParallax(ref, { x: "--pnx", y: "--pny", ease: 0.09, activo: !reduced });

  return (
    <section
      ref={ref}
      data-section="hero"
      className="text-azul-principal relative isolate min-h-[160svh] overflow-hidden lg:h-[93.75vw] lg:min-h-0"
      style={{ "--pnx": "0", "--pny": "0" } as CSSProperties}
    >
      {/* Sentinel del navbar: mientras está a la vista (top del viewport) el
          navbar es transparente; al dejarlo, vira a frosted. */}
      <span
        data-nav-sentinel
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 h-[85vh] w-px"
      />

      {/* Glow verde para profundidad */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-[40vh] left-1/2 z-0 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50 blur-3xl"
        style={{ background: "radial-gradient(circle, rgb(31 154 120 / 0.1) 0%, transparent 70%)" }}
      />

      <CampoCards />
      <CampoCardsMobile />
      <HeroCopy />
    </section>
  );
}
