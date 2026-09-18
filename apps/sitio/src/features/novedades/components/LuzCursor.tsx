"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

/**
 * La luz del faro, despojada de los puntos §6. Es lo único que nos traemos de
 * Biblioteca: un glow cálido que sigue al cursor sobre el navy. Ese es el puente
 * coherente Biblioteca → Novedades, sin repetir el patrón de nodos/puntos.
 *
 * Dos capas:
 *  1. Un halo base fijo en el horizonte (arriba-centro) que siempre está: la
 *     luz del faro "prendida".
 *  2. Un halo que sigue al cursor con lerp suave (RAF que solo toca CSS vars).
 *     Si el puntero no está sobre la sección (o es touch), se apaga con fade.
 *
 * Los listeners van sobre la SECTION contenedora (closest): esta capa es
 * pointer-events-none. Con prefers-reduced-motion queda solo el halo base.
 */
const EASE = 0.1;

export function LuzCursor({
  /** Posición del halo base, en % del alto. Default: horizonte alto. */
  horizonte = 32,
}: {
  horizonte?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    const host = el?.closest("section");
    if (!el || !host || reduced) return;
    if (!window.matchMedia("(hover: hover)").matches) return;

    const setVar = (n: string, v: string) => el.style.setProperty(n, v);
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let raf = 0;
    let listo = false;

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      tx = e.clientX - r.left;
      ty = e.clientY - r.top;
      if (!listo) {
        cx = tx;
        cy = ty;
        listo = true;
      }
      setVar("--luz-alpha", "1");
    };
    const onLeave = () => setVar("--luz-alpha", "0");

    const tick = () => {
      cx += (tx - cx) * EASE;
      cy += (ty - cy) * EASE;
      if (listo) {
        setVar("--luz-x", `${cx.toFixed(1)}px`);
        setVar("--luz-y", `${cy.toFixed(1)}px`);
      }
      raf = requestAnimationFrame(tick);
    };

    host.addEventListener("mousemove", onMove, { passive: true });
    host.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(tick);

    return () => {
      host.removeEventListener("mousemove", onMove);
      host.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      style={{ "--luz-alpha": "0" } as CSSProperties}
    >
      {/* Halo base: la luz del faro en el horizonte, siempre presente. */}
      <span
        className="absolute inset-0"
        style={{
          background: `radial-gradient(60% 42% at 50% ${horizonte}%, color-mix(in srgb, var(--color-azul-claro) 22%, transparent), transparent 68%)`,
        }}
      />
      {/* Halo que sigue al cursor (más cálido/concentrado). */}
      <span
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          opacity: "var(--luz-alpha)",
          background:
            "radial-gradient(circle 320px at var(--luz-x, 50%) var(--luz-y, 40%), color-mix(in srgb, var(--color-azul-claro) 26%, transparent), transparent 70%)",
        }}
      />
    </div>
  );
}
