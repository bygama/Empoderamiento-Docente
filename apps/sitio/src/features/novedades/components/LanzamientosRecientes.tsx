"use client";

import Link from "next/link";
import { RevealLines } from "@/components/ui/RevealLines";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "@/components/ui/icons";
import type { LanzamientosDeNovedades } from "@/features/novedades/contenido/lanzamientos";
import { FinalDelRiel } from "./lanzamientos/FinalDelRiel";
import { Lanzamiento } from "./lanzamientos/Lanzamiento";
import { useRiel } from "./lanzamientos/useRiel";

/**
 * "Lanzamientos y recursos recientes" — puente a Biblioteca. Riel horizontal
 * que se arrastra con inercia (drag + momentum) en desktop; en touch va el
 * scroll nativo (que ya trae su propia inercia). Sin líneas ni gráficos: pura
 * física de arrastre (`lanzamientos/useRiel.ts`). La última tarjeta es el CTA
 * a Biblioteca.
 *
 * Affordance del gesto (solo puntero fino): el cursor nativo se reemplaza por
 * una pill "arrastrá" que sigue al mouse sobre el riel, y un velo de gris-fondo
 * en el borde derecho insinúa que hay más contenido (se apaga al llegar al
 * final). En touch no hace falta: el riel cortado + scroll nativo ya lo dicen.
 *
 * Los textos y las tarjetas, cada una con el link a su artículo, llegan por
 * props (de `features/novedades/contenido/lanzamientos.ts` o de la base); los
 * dos destinos a la Biblioteca, el link de arriba y la tarjeta del final,
 * quedan acá.
 */
export function LanzamientosRecientes({ contenido }: { contenido: LanzamientosDeNovedades }) {
  const { trackRef, wrapRef, pillRef, fadeRef, progRef, ends, scrollByCard, handlers } = useRiel();

  return (
    <section id="recien-salido" data-indice="Recién salido" className="bg-gris-fondo" aria-label="Lanzamientos y recursos recientes">
      <div className="mx-auto w-full max-w-screen-xl px-5 pt-20 md:px-10 md:pt-28">
        <div className="flex items-end justify-between gap-6">
          {/* Sin max-w: el titular entra en un solo renglón en desktop (con
              42ch se partía en dos). En mobile cae a dos líneas naturalmente. */}
          <div>
            <RevealLines
              as="h2"
              className="font-display text-azul-principal font-bold tracking-[-0.02em]"
              style={{ fontSize: "clamp(1.7rem, 1rem + 2.4vw, 3rem)", lineHeight: 1.08 }}
            >
              {contenido.titulo}
            </RevealLines>
            <p
              data-riel-pista
              className="text-gris-texto mt-3 font-mono text-[0.68rem] tracking-[0.16em] uppercase md:hidden"
            >
              Deslizá →
            </p>
          </div>
          <div className="mb-2 hidden shrink-0 items-center gap-6 md:flex">
            {/* Prev/next: la vía accesible del riel (el drag no existe para
                teclado). Deshabilitadas en los extremos. */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Anteriores"
                disabled={ends.start}
                onClick={() => scrollByCard(-1)}
                className="border-azul-principal/15 text-azul-principal hover:border-verde-concepto/50 hover:text-verde-concepto-texto flex h-10 w-10 items-center justify-center rounded-full border transition-colors disabled:pointer-events-none disabled:opacity-30"
              >
                <ArrowLeft size={16} />
              </button>
              <button
                type="button"
                aria-label="Siguientes"
                disabled={ends.end}
                onClick={() => scrollByCard(1)}
                className="border-azul-principal/15 text-azul-principal hover:border-verde-concepto/50 hover:text-verde-concepto-texto flex h-10 w-10 items-center justify-center rounded-full border transition-colors disabled:pointer-events-none disabled:opacity-30"
              >
                <ArrowRight size={16} />
              </button>
            </div>
            <Link
              href="/biblioteca"
              className="group text-azul-principal hover:text-verde-concepto-texto inline-flex items-center gap-2 font-sans text-[0.95rem] font-medium transition-colors"
            >
              {contenido.enlace}
              <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Riel arrastrable */}
      <div ref={wrapRef} className="relative">
        <div
          ref={trackRef}
          role="region"
          aria-label="Riel de lanzamientos recientes"
          tabIndex={0}
          {...handlers}
          className="scrollbar-none focus-visible:ring-verde-concepto/50 mt-8 flex gap-5 overflow-x-auto px-5 pb-20 select-none focus-visible:ring-2 focus-visible:outline-none max-md:snap-x max-md:snap-mandatory max-md:scroll-px-5 md:cursor-none md:px-10"
        >
          {contenido.lanzamientos.map((l) => (
            <Lanzamiento key={l.titulo} lanzamiento={l} />
          ))}
          <FinalDelRiel final={contenido.final} />
        </div>

        {/* Barra de progreso del riel: solo celular (el prev/next + pill ya
            avisan en desktop). */}
        <div
          aria-hidden="true"
          className="mx-5 -mt-14 mb-6 h-0.5 overflow-hidden rounded-full bg-azul-principal/10 md:hidden"
        >
          <div
            ref={progRef}
            data-riel-progreso
            className="bg-verde-concepto h-full w-full origin-left transition-transform duration-150"
            style={{ transform: "scaleX(0)" }}
          />
        </div>

        {/* Velo derecho: "hay más". Se apaga al llegar al final del riel. */}
        <div
          ref={fadeRef}
          aria-hidden="true"
          className="from-gris-fondo pointer-events-none absolute inset-y-0 right-0 hidden w-28 bg-gradient-to-l to-transparent transition-opacity duration-300 md:block"
        />

        {/* Pill-cursor del gesto: reemplaza al cursor nativo sobre el riel.
            El contenedor se mueve sin transición (sigue al mouse); el interno
            escala con transición al apretar. */}
        <div ref={pillRef} aria-hidden="true" className="pointer-events-none absolute top-0 left-0 z-30 hidden opacity-0 transition-opacity duration-200 md:block">
          <span className="bg-azul-principal flex items-center gap-2.5 rounded-full py-2.5 pr-4 pl-4 font-mono text-[0.62rem] tracking-[0.18em] text-white uppercase shadow-[0_12px_32px_-8px_rgb(15_21_40/0.5)] transition-transform duration-200">
            <ArrowRight size={12} className="-scale-x-100" />
            arrastrá
            <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </section>
  );
}
