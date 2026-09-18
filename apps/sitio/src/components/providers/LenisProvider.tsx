"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { registerLenis } from "@/lib/lenis";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Instancia única de Lenis para smooth scroll global, integrada con
 * ScrollTrigger (Lenis dispara `scroll` y ScrollTrigger.update se engancha).
 *
 * Si el SO solicita reduced-motion, NO monta Lenis: scroll nativo del
 * navegador, sin smooth.
 */
export function LenisProvider({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    const lenis = new Lenis({
      // Base: valores medidos en blueprintapps.io (lerp 0.1 / duration 1.2).
      // lerp bajado a 0.075 para más inercia — deslizamiento más
      // cinematográfico, a tono con el hero de Qué hacemos.
      lerp: 0.075,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    registerLenis(lenis);
    lenis.on("scroll", ScrollTrigger.update);

    // Lenis corre dentro del ticker de GSAP para compartir el mismo
    // frame que ScrollTrigger — evita el jitter típico de refresh-rates
    // variables (120Hz, ProMotion) y dos RAF loops desincronizados.
    const tickerFn = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    // Re-sincronizar Lenis + ScrollTrigger cuando cambia el alto del contenido
    // (hot-reload en dev, imágenes tardías, secciones que montan después). Sin
    // esto Lenis cachea el alto viejo y clampea el scroll antes del final del
    // documento — síntoma: "no se puede bajar" en mitad de una sección larga.
    //
    // Son dos costos muy distintos. lenis.resize() es leer un scrollHeight y
    // va siempre, en el próximo frame. ScrollTrigger.refresh() recalcula
    // TODOS los triggers y pins de la página —en Investigación, con tres
    // escenas pinneadas y valores por función, ~270 ms medidos— y congela lo
    // que esté pasando. Por eso se reserva para cambios ESTRUCTURALES del
    // alto (una sección que monta, un pin que aparece) y espera a que el alto
    // deje de moverse: una transición CSS dispara el observer en cada frame.
    // Un acordeón que se abre en hover, un tooltip o una fuente que llega
    // mueven la página unos píxeles y no lo justifican; los triggers quedan
    // desfasados esos píxeles hasta el próximo cambio grande y no se nota.
    // (Los casos de Investigación se trababan exactamente por esto: cada
    // hover y cada apertura disparaban dos o tres refresh seguidos.)
    const UMBRAL_REFRESH = 240; // px de alto que separan "estructural" de "cosmético"
    const ESPERA_REFRESH = 120; // ms quieto antes de recalcular
    let resizeRaf = 0;
    let refreshTimer = 0;
    let altoRefrescado = 0;
    const resync = (entradas: ResizeObserverEntry[]) => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => lenis.resize());
      const alto = entradas[entradas.length - 1]?.contentRect.height ?? document.body.scrollHeight;
      if (Math.abs(alto - altoRefrescado) < UMBRAL_REFRESH) return;
      window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => {
        altoRefrescado = alto;
        ScrollTrigger.refresh();
      }, ESPERA_REFRESH);
    };
    const resizeObserver = new ResizeObserver(resync);
    resizeObserver.observe(document.body);

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(resizeRaf);
      window.clearTimeout(refreshTimer);
      gsap.ticker.remove(tickerFn);
      lenis.off("scroll", ScrollTrigger.update);
      registerLenis(null);
      lenis.destroy();
    };
  }, [reducedMotion]);

  return <>{children}</>;
}
