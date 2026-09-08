"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { crearEspiral } from "./coreografia-espiral";
import { EspiralEstatica } from "./EspiralEstatica";
import { EspiralLamina } from "./EspiralLamina";

/**
 * Secciones 4 y 5 — Ciclo de investigación aplicada (`#ciclo`) y Volvemos
 * a investigar (`#evidencia`), en UN solo escenario: la ESPIRAL DOBLE como
 * lámina que se dibuja sola.
 *
 * Los dos ciclos de cuatro pasos se cuentan como una sola figura: la
 * espiral de «Transformar» del hero, agrandada a dos vueltas. La escena
 * arranca en primer plano: el personaje recorre la vuelta interior (el
 * ciclo pedagógico) y cada estación se anota sobre la figura. En la cuarta
 * etapa no se va —«no cierra el ciclo»— y la cámara se aleja: lo que
 * parecía la figura entera era la vuelta interior de algo más grande. Ahí
 * cambia el título: «Implementar no es terminar», y recorre la segunda
 * vuelta (la evidencia). Al final un lazo lo devuelve al primer nodo, donde
 * aterriza el remate: la evidencia vuelve al proceso. Hoja 03 del archivo,
 * sobre el mismo papel que el hero. Escena en EspiralLamina.tsx,
 * coreografía en coreografia-espiral.ts, geometría de la lámina en
 * lamina-espiral.ts, copy en estaciones.ts.
 *
 * `#evidencia` es un ancla interna que salta a la bisagra.
 * Touch / reduced-motion: EspiralEstatica (que es también lo que dibuja el SSR).
 */
export function EspiralInvestigacion() {
  const zonaRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();
  const [live, setLive] = useState(false);

  useIsomorphicLayoutEffect(() => {
    if (reduced) {
      setLive(false);
      return;
    }
    setLive(window.matchMedia("(hover: hover) and (min-width: 64rem)").matches);
  }, [reduced]);

  useIsomorphicLayoutEffect(() => {
    if (!live) return;
    const zona = zonaRef.current;
    if (!zona) return;
    let restaurar = () => {};
    const ctx = gsap.context(() => {
      const escena = crearEspiral({ zona });
      restaurar = escena.restaurar;
      const { tl, progresoBisagra } = escena;
      ScrollTrigger.refresh();
      // Llegar por #evidencia aterriza en la bisagra, no al principio.
      if (window.location.hash === "#evidencia") {
        const st = tl.scrollTrigger;
        if (st) {
          requestAnimationFrame(() =>
            window.scrollTo(0, st.start + (st.end - st.start) * progresoBisagra),
          );
        }
      }
    }, zona);
    return () => {
      ctx.revert();
      restaurar();
    };
  }, [live]);

  return (
    <section
      id="ciclo"
      data-indice="Ciclo"
      aria-label="Ciclo de investigación aplicada y evidencia"
      className="bg-gris-fondo"
    >
      {/* ── La hoja 03: el escenario pinneado. La sombra es corta a propósito,
          como la del hero: la sección solo deja 10px de canaleta (p-2.5) y la
          de casos pinta su fondo encima, así que una sombra larga se ve
          cortada al ras. */}
      <div ref={zonaRef} className="p-2.5">
        <div
          className={`ring-azul-principal/10 bg-grain-light text-azul-principal relative isolate overflow-hidden rounded-xl bg-white shadow-[0_4px_12px_-8px_rgb(31_45_77/0.35)] ring-1 ${
            live ? "flex h-[calc(100svh-1.25rem)]" : "min-h-[calc(100svh-1.25rem)]"
          }`}
        >
          <span className="text-gris-texto/70 absolute top-7 right-8 z-10 hidden font-mono text-[0.68rem] tracking-[0.2em] uppercase lg:block">
            Archivo ED · Hoja 03
          </span>

          {live ? <EspiralLamina /> : <EspiralEstatica />}
        </div>
      </div>
    </section>
  );
}
