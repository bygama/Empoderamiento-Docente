"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Ciclo } from "@/features/investigacion/contenido/ciclo";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { crearEspiral } from "./coreografia-espiral";
import { crearEspiralMovil } from "./coreografia-espiral-movil";
import { EspiralEstatica } from "./EspiralEstatica";
import { EspiralLamina } from "./EspiralLamina";
import { EspiralMovil } from "./EspiralMovil";

/**
 * Secciones 4 y 5 — Ciclo de investigación aplicada (`#ciclo`) y Volvemos
 * a investigar (`#evidencia`), en UN solo escenario: la ESPIRAL DOBLE como
 * lámina que se dibuja sola.
 *
 * Los dos ciclos de cuatro pasos se cuentan como una sola figura: la
 * espiral de «Transformar» del hero, agrandada a dos vueltas. La escena
 * arranca en primer plano con el título de la hoja y el papel vacío: los
 * nodos bajan en bandada, como las estrellas del hero sobre la hoja 01 (el
 * personaje primero, que aterriza en la 01; los demás caen sueltos), y el
 * título vuela en cuanto el personaje arranca: recorre la vuelta interior
 * (el ciclo pedagógico), cada nodo vuela a su lugar justo antes de que
 * llegue y cada estación se anota sobre la figura (la bandada,
 * 2026-09-14: bandada-espiral.ts). En la cuarta etapa no se va —«no
 * cierra el ciclo»— y la cámara se aleja: lo que parecía la figura entera
 * era la vuelta interior de algo más grande. Recorre la segunda vuelta (la
 * evidencia) y al final un lazo lo devuelve al primer nodo, donde aterriza
 * el remate: la evidencia vuelve al proceso. Hoja 03 del archivo,
 * sobre el mismo papel que el hero. Escena en EspiralLamina.tsx,
 * coreografía en coreografia-espiral.ts, geometría de la lámina en
 * lamina-espiral.ts; el copy llega por props (de
 * `features/investigacion/contenido/ciclo.ts` o de la base).
 *
 * `#evidencia` es un ancla interna que salta a la bisagra.
 * Bajo `lg`, una estación por vez en una escena pegajosa (EspiralMovil.tsx).
 * Reduced-motion y pantallas bajas: EspiralEstatica (que es también lo que
 * dibuja el SSR).
 */
export function EspiralInvestigacion({ contenido }: { contenido: Ciclo }) {
  const zonaRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();
  // quieto = EspiralEstatica sola (lo que dibuja el SSR); vivo = la lámina de
  // escritorio; movil = una estación por vez, en una escena pegajosa bajo lg.
  // Se decide entero en cada corrida y se vuelve a decidir al cambiar cualquier
  // media query (rotar el dispositivo), no solo al montar.
  const [modo, setModo] = useState<"quieto" | "vivo" | "movil">("quieto");
  const live = modo === "vivo";

  useIsomorphicLayoutEffect(() => {
    if (reduced) {
      setModo("quieto");
      return;
    }
    const mqVivo = window.matchMedia("(hover: hover) and (min-width: 64rem)");
    const mqMovil = window.matchMedia("(max-width: 63.999rem) and (min-height: 38.75rem)");
    const decidir = () => {
      setModo(mqVivo.matches ? "vivo" : mqMovil.matches ? "movil" : "quieto");
    };
    decidir();
    mqVivo.addEventListener("change", decidir);
    mqMovil.addEventListener("change", decidir);
    return () => {
      mqVivo.removeEventListener("change", decidir);
      mqMovil.removeEventListener("change", decidir);
    };
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

  // Bajo `lg`: la escena de una estación por vez (EspiralMovil).
  useIsomorphicLayoutEffect(() => {
    if (modo !== "movil") return;
    const zona = zonaRef.current;
    if (!zona) return;
    return crearEspiralMovil(zona);
  }, [modo]);

  return (
    <section
      id="ciclo"
      data-modo={modo}
      data-indice="Ciclo de investigación aplicada"
      // Desde el navbar se aterriza al final de la escena (ver irASeccion).
      data-aterrizaje="fin"
      aria-label="Ciclo de investigación aplicada y evidencia"
      className="bg-gris-fondo"
    >
      {/* ── La hoja 03: el escenario pinneado. La sombra es corta a propósito,
          como la del hero: la sección solo deja 10px de canaleta (p-2.5) y la
          de casos pinta su fondo encima, así que una sombra larga se ve
          cortada al ras. */}
      <div ref={zonaRef} className="p-2.5">
        <div
          className={`ring-azul-principal/10 bg-grain-light text-azul-principal relative isolate overflow-hidden rounded-xl bg-white shadow-[0_4px_12px_-8px_rgb(31_45_77/0.35)] ring-1 [[data-modo=movil]_&]:overflow-clip ${
            live ? "flex h-[calc(100svh-1.25rem)]" : "min-h-[calc(100svh-1.25rem)]"
          }`}
        >
          <span className="text-gris-texto/70 absolute top-7 right-8 z-10 hidden font-mono text-[0.68rem] tracking-[0.2em] uppercase lg:block">
            Archivo ED · Hoja 03 · Ciclo de investigación aplicada
          </span>

          {live ? (
            <EspiralLamina contenido={contenido} />
          ) : modo === "movil" ? (
            <EspiralMovil contenido={contenido} />
          ) : (
            <EspiralEstatica contenido={contenido} />
          )}
        </div>
      </div>
    </section>
  );
}
