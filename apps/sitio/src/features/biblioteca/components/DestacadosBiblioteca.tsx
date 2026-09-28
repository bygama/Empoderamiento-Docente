"use client";

import { useRef, useState } from "react";
import { getLenis } from "@/lib/lenis";
import type { Destacados } from "@/features/biblioteca/contenido/destacados";
import type { DestacadoDelSitio } from "@/features/biblioteca/contenido/material";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { crearDestacados } from "./destacados/coreografia-destacados";
import { IntroDestacados } from "./destacados/IntroDestacados";
import { IndiceDestacados } from "./destacados/IndiceDestacados";
import { ArticuloDestacado } from "./destacados/ArticuloDestacado";
import { BarajaMovil } from "./destacados/BarajaMovil";

/**
 * Material destacado (sitemap) — coreografía de la referencia, en tres fases:
 *
 * 1. INTRO con pantalla propia (min-h-svh): eyebrow, titular a dos azules,
 *    párrafo del equipo y la fila de las 4 portadas abajo.
 *
 * 2. VIAJE (desktop): la fila se PINEA al centro del viewport (pinSpacing
 *    false → la banda azul sube por detrás) y un scrub la hace CONVERGER
 *    en una sola pila sobre la columna de medios, junto al primer artículo.
 *
 * 3. BARRIDO: los artículos NO llevan imagen propia; la pila fija es la
 *    imagen de todos. Cada divisoria entre artículos, al cruzar la pila,
 *    "barre" la imagen de arriba con un clip-path cuyo borde acompaña
 *    EXACTAMENTE a la línea (mismo rango de scroll → mismo pixel), y así
 *    revela la del artículo siguiente. Al final la pila se desvanece antes
 *    de despinnearse (evita el salto del unpin).
 *
 * El índice lateral sticky marca el artículo en foco (ScrollTrigger por
 * fila, que además atenúa los no activos) y navega con Lenis.
 *
 * Mobile (<lg) y reduced-motion: sin pin ni barrido — cada artículo muestra
 * su imagen inline y todo queda visible y pleno.
 *
 * Piezas: los destacados, que son materiales de la base con su lugar, su
 * rótulo, su frase y su detalle; la coreografía en
 * `destacados/coreografia-destacados.ts`, el markup en `IntroDestacados`,
 * `IndiceDestacados` y `ArticuloDestacado`. Los textos propios de la sección
 * llegan por props (de `features/biblioteca/contenido/destacados.ts` o de la
 * base).
 */
export function DestacadosBiblioteca({ contenido, destacados }: { contenido: Destacados; destacados: readonly DestacadoDelSitio[] }) {
  const rootRef = useRef<HTMLElement | null>(null);
  const rowRef = useRef<HTMLDivElement | null>(null);
  const slotRef = useRef<HTMLDivElement | null>(null);
  const artsWrapRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const [activo, setActivo] = useState(0);
  const reduced = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    if (reduced) return;
    const root = rootRef.current;
    if (!root) return;
    return crearDestacados({
      root,
      row: rowRef.current,
      slot: slotRef.current,
      artsWrap: artsWrapRef.current,
      items: itemRefs.current,
      setActivo,
    });
  }, [reduced]);

  const irAlItem = (i: number) => {
    const el = itemRefs.current[i];
    if (!el) return;
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(el.getBoundingClientRect().top + window.scrollY - 120);
    } else {
      el.scrollIntoView();
    }
  };

  return (
    <section
      ref={rootRef}
      id="destacados"
      data-indice="Destacados"
      // Desde el navbar se aterriza al final de la escena (ver irASeccion).
      data-aterrizaje="fin"
      aria-label="Material destacado"
    >
      {/* ── Fase 1: intro con pantalla propia ───────────────────────────── */}
      <IntroDestacados contenido={contenido} items={destacados} refRow={rowRef} />

      {/* Bajo `lg`: la baraja deslizable, en vez de la banda azul pineada. */}
      <BarajaMovil items={destacados} />

      {/* ── Fases 2 y 3: banda azul con índice + artículos ──────────────── */}
      <div className="bg-azul-principal relative max-lg:hidden">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:radial-gradient(circle,#fff_1.1px,transparent_1.6px)] [background-size:22px_22px]"
        />
        <div className="relative z-10 mx-auto max-w-screen-xl px-5 pt-20 pb-16 md:px-10 lg:pt-28 lg:pb-24">
          <div className="lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-x-12">
            <IndiceDestacados items={destacados} activo={activo} onIr={irAlItem} />

            {/* Artículos: SIN imagen propia en desktop — la columna de medios
                queda vacía para la pila fija de viajeras. */}
            <div ref={artsWrapRef} className="lg:border-l lg:border-dashed lg:border-white/15 lg:pl-12">
              {destacados.map((item, i) => (
                <ArticuloDestacado
                  key={item.material.id}
                  item={item}
                  i={i}
                  activo={activo}
                  reduced={reduced}
                  refItem={(el) => {
                    itemRefs.current[i] = el;
                  }}
                  refSlot={slotRef}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
