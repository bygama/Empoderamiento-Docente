"use client";

import { useEffect, useRef, useState } from "react";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { crearVibora } from "./coreografia-vibora";
import { CINTA, GROSOR } from "./vibora-escena";

const TRAZO = {
  fill: "none",
  strokeWidth: GROSOR,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  vectorEffect: "non-scaling-stroke",
} as const;

/**
 * La capa fija de la víbora: la grilla de puntos de fondo y el lazo azul
 * medio con sombra y la cápsula verde perseguidora, sobre un único trazo
 * que va de Niveles al cierre (`vibora-escena.ts`). Va ANTES de las dos
 * secciones en el DOM y con z-index 0: las secciones, que van
 * transparentes en vivo, pintan sus cards y textos por encima, y el gris
 * del body queda por debajo. Solo desktop con mouse y con motion; sin
 * eso, no se monta y cada sección se arregla con su fallback.
 *
 * La coreografía se crea cuando las dos zonas ya midieron su alto (las
 * secciones lo fijan al pasar a vivo, en su propio efecto) y se rehace si
 * cambia el alto de la ventana, porque las zonas se miden en svh.
 */
export function ViboraQueHacemos() {
  const capaRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();
  const [live, setLive] = useState(false);

  useIsomorphicLayoutEffect(() => {
    if (reduced) return;
    if (!window.matchMedia("(hover: hover) and (min-width: 1024px)").matches) return;
    setLive(true);
  }, [reduced]);

  useEffect(() => {
    if (!live) return;
    const capa = capaRef.current;
    const niveles = document.getElementById("niveles");
    const proyectos = document.getElementById("proyectos");
    if (!capa || !niveles || !proyectos) return;
    let cleanup: (() => void) | undefined;
    let cancelado = false;
    let timer = 0;
    const crear = () => {
      if (cancelado) return;
      cleanup?.();
      cleanup = crearVibora(capa, niveles, proyectos);
    };
    // Dos cuadros de espera: que las secciones ya estén en vivo y con su
    // alto puesto antes de medir.
    const arrancar = () => requestAnimationFrame(() => requestAnimationFrame(crear));
    if (document.fonts?.ready) document.fonts.ready.then(arrancar);
    else arrancar();
    const alCambiar = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(crear, 200);
    };
    window.addEventListener("resize", alCambiar);
    return () => {
      cancelado = true;
      window.clearTimeout(timer);
      window.removeEventListener("resize", alCambiar);
      cleanup?.();
    };
  }, [live]);

  if (!live) return null;

  return (
    <div
      ref={capaRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
      style={{ opacity: 0 }}
    >
      {/* La misma grilla de puntos que tenían los dos escenarios: ahora
          es una sola, de fondo, y no cambia en la costura. */}
      <span className="absolute inset-0 opacity-[0.35] [background-image:radial-gradient(circle,color-mix(in_srgb,var(--color-azul-principal)_22%,transparent)_1.1px,transparent_1.6px)] [background-size:22px_22px]" />
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full overflow-visible"
      >
        <path
          data-cinta
          d={CINTA}
          stroke="var(--color-azul-medio)"
          style={{
            filter: "drop-shadow(0 20px 30px color-mix(in srgb, var(--color-azul-medio) 25%, transparent))",
          }}
          {...TRAZO}
        />
        <path data-capsula d={CINTA} stroke="var(--color-verde-concepto)" {...TRAZO} />
      </svg>
    </div>
  );
}
