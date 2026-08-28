"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "@/components/ui/icons";
import { getLenis } from "@/lib/lenis";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { ACCION, DESTACADOS, MATERIALES } from "../data/materiales";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// DESTACADOS referencia materiales del catálogo por título; si un título no
// matchea (typo al editar la data), el destacado simplemente no se lista.
const ITEMS = DESTACADOS.flatMap((d) => {
  const material = MATERIALES.find((m) => m.titulo === d.titulo);
  return material ? [{ ...d, material }] : [];
});

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
 */
export function DestacadosBiblioteca() {
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

    const ctx = gsap.context(() => {
      // Foco por fila (todas las resoluciones): índice + atenuado.
      itemRefs.current.forEach((el, i) => {
        if (!el) return;
        ScrollTrigger.create({
          trigger: el,
          start: "top center",
          end: "bottom center",
          onToggle: (self) => {
            if (self.isActive) setActivo(i);
          },
        });
      });

      // Coreografía de las imágenes: solo desktop (en mobile van inline).
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        const row = rowRef.current;
        const slot = slotRef.current;
        const wrap = artsWrapRef.current;
        if (!row || !slot || !wrap) return;

        const imgs = gsap.utils.toArray<HTMLElement>("[data-viajera]", row);
        const arts = itemRefs.current.filter((el): el is HTMLElement => !!el);

        // Geometría del destino: la pila vive centrada verticalmente en el
        // viewport (top S, alto H), sobre la columna de medios (slot).
        const H = () => slot.getBoundingClientRect().height;
        const S = () => (window.innerHeight - H()) / 2;

        // z invertido: la primera portada arriba de la pila.
        imgs.forEach((img, i) => gsap.set(img, { zIndex: imgs.length - i }));

        // ── Fase 2a: pin de la fila al centro; la banda sube por detrás ──
        ScrollTrigger.create({
          trigger: row,
          start: "center center",
          endTrigger: wrap,
          end: "bottom center",
          pin: true,
          pinSpacing: false,
          anticipatePin: 1,
        });

        // ── Fase 2b: convergencia 4 → 1 sobre el slot ───────────────────
        // Deltas medidos por función (invalidateOnRefresh): los x/left no
        // cambian con el pin, y el top pineado se deduce del alto de la fila
        // (quedó clavada en "center center").
        gsap.timeline({
          scrollTrigger: {
            trigger: wrap,
            start: "top 95%",
            end: "top 30%",
            scrub: true,
            invalidateOnRefresh: true,
          },
        }).to(imgs, {
          x: (_i, el) =>
            slot.getBoundingClientRect().left -
            (el as HTMLElement).getBoundingClientRect().left,
          y: (_i, el) => {
            const rowRect = row.getBoundingClientRect();
            const offsetEnFila =
              (el as HTMLElement).getBoundingClientRect().top - rowRect.top;
            const topPineado =
              (window.innerHeight - rowRect.height) / 2 + offsetEnFila;
            return S() - topPineado;
          },
          scale: (_i, el) =>
            slot.getBoundingClientRect().width /
            (el as HTMLElement).getBoundingClientRect().width,
          transformOrigin: "0 0",
          stagger: 0.06,
          ease: "none",
        });

        // ── Fase 3: barrido por divisoria ───────────────────────────────
        // La divisoria del artículo i recorre la pila de abajo (S+H) hacia
        // arriba (S); el clip de la imagen anterior avanza en el mismo rango
        // de scroll, así el borde del recorte ES la línea.
        arts.slice(1).forEach((art, k) => {
          gsap.fromTo(
            imgs[k],
            { clipPath: "inset(0% 0% 0% 0%)" },
            {
              clipPath: "inset(0% 0% 100% 0%)",
              ease: "none",
              scrollTrigger: {
                trigger: art,
                start: () => `top ${S() + H()}`,
                end: () => `top ${S()}`,
                scrub: true,
                invalidateOnRefresh: true,
              },
            },
          );
        });

        // ── Cierre: desvanecer ANTES del unpin (evita el salto) ─────────
        gsap.to(row, {
          autoAlpha: 0,
          ease: "none",
          scrollTrigger: {
            trigger: wrap,
            start: "bottom 70%",
            end: "bottom 55%",
            scrub: true,
            invalidateOnRefresh: true,
          },
        });
      });
    }, root);

    return () => ctx.revert();
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

  // Con reduced-motion no hay pila fija: las imágenes inline se muestran
  // también en desktop.
  const claseImagenInline = reduced ? "" : "lg:hidden";

  return (
    <section ref={rootRef} aria-label="Material destacado">
      {/* ── Fase 1: intro con pantalla propia ───────────────────────────── */}
      {/* Alto por contenido (sin min-h de pantalla): así la banda azul viene
          enseguida después de las portadas. Los espacios son todos fijos:
          pt corto (cerca del hero), gap generoso titular→portadas y un pb
          moderado antes de la banda. */}
      <div className="mx-auto w-full max-w-screen-xl px-5 pt-14 pb-16 md:px-10 md:pt-20 md:pb-20">
        <div className="md:grid md:grid-cols-12 md:gap-x-8">
          <p className="text-gris-texto font-mono text-[0.7rem] tracking-[0.14em] uppercase md:col-span-3">
            Material destacado
          </p>
          <h2
            className="font-display mt-6 font-extrabold tracking-[-0.02em] md:col-span-9 md:mt-0"
            style={{ fontSize: "clamp(2.2rem, 1rem + 4.5vw, 4.25rem)", lineHeight: 1.05 }}
          >
            <span className="text-verde-concepto">Cuatro materiales</span>{" "}
            <span className="text-azul-principal">para entrar a la biblioteca</span>
          </h2>
        </div>

        <div className="mt-20 md:mt-36 md:grid md:grid-cols-12 md:items-end md:gap-x-8">
          <p className="text-gris-texto max-w-[38ch] font-sans text-[0.97rem] leading-relaxed md:col-span-3">
            Una selección corta del equipo: la investigación que da origen a
            ED y tres materiales listos para el aula. Si llegás por primera
            vez, empezá por acá.
          </p>
          {/* Las 4 portadas "viajeras": acá son la fila de la intro; en
              desktop se pinean, convergen sobre el slot y las barre cada
              divisoria. */}
          <div
            ref={rowRef}
            className="z-30 mt-10 grid grid-cols-2 gap-3 md:col-span-9 md:mt-0 md:grid-cols-4 md:gap-4"
          >
            {ITEMS.map(({ titulo, material }) => (
              <div
                key={titulo}
                data-viajera
                className="bg-azul-claro/30 relative aspect-[3/4] overflow-hidden rounded-xl will-change-transform"
              >
                <Image
                  src={material.portada}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 25vw, 50vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Fases 2 y 3: banda azul con índice + artículos ──────────────── */}
      <div className="bg-azul-principal relative">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:radial-gradient(circle,#fff_1.1px,transparent_1.6px)] [background-size:22px_22px]"
        />
        <div className="relative z-10 mx-auto max-w-screen-xl px-5 pt-20 pb-16 md:px-10 lg:pt-28 lg:pb-24">
          <div className="lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-x-12">
            {/* Índice lateral (solo desktop) */}
            <aside className="hidden lg:sticky lg:top-[24svh] lg:block lg:self-start">
              <nav aria-label="Índice de destacados">
                <p className="bg-white/10 px-3.5 py-2 font-mono text-[0.66rem] tracking-[0.14em] text-white/50 uppercase">
                  Destacados
                </p>
                <ul>
                  {ITEMS.map(({ titulo, rotulo }, i) => (
                    <li key={titulo} className="border-b border-white/12">
                      <button
                        type="button"
                        aria-current={activo === i}
                        onClick={() => irAlItem(i)}
                        className={`w-full px-3.5 py-3 text-left font-mono text-[0.78rem] tracking-[0.1em] uppercase transition-colors duration-300 ${
                          activo === i
                            ? "text-azul-principal bg-white"
                            : "text-white/65 hover:text-white"
                        }`}
                      >
                        {rotulo}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>

            {/* Artículos: SIN imagen propia en desktop — la columna de medios
                queda vacía para la pila fija de viajeras. */}
            <div ref={artsWrapRef} className="lg:border-l lg:border-dashed lg:border-white/15 lg:pl-12">
              {ITEMS.map(({ titulo, tagline, detalle, material }, i) => (
                <article
                  key={titulo}
                  ref={(el) => {
                    itemRefs.current[i] = el;
                  }}
                  className={`grid gap-6 border-t border-white/15 py-10 transition-opacity duration-700 md:py-12 lg:min-h-[46svh] lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10 ${
                    !reduced && activo !== i ? "lg:opacity-35" : ""
                  }`}
                >
                  {/* Columna de medios: el primer artículo lleva el slot que
                      define la geometría de la pila; el resto, hueco vacío. */}
                  {i === 0 ? (
                    <div
                      ref={slotRef}
                      aria-hidden="true"
                      className="hidden w-full lg:block lg:aspect-[3/4]"
                    />
                  ) : (
                    <div aria-hidden="true" className="hidden lg:block" />
                  )}

                  <div className="flex min-w-0 flex-col">
                    <div
                      className={`${claseImagenInline} bg-azul-medio/25 relative mb-6 aspect-[16/9] overflow-hidden rounded-xl`}
                    >
                      <Image
                        src={material.portada}
                        alt=""
                        fill
                        sizes="100vw"
                        className="object-cover"
                      />
                    </div>

                    {/* hyphens + break-words: títulos con palabras largas
                        ("proporcionalidad") desbordaban la columna en anchos
                        intermedios (~1024) y estiraban la página 7px. */}
                    <h3
                      className="font-display font-extrabold tracking-[-0.02em] break-words hyphens-auto text-white"
                      lang="es"
                      style={{ fontSize: "clamp(1.8rem, 1.1rem + 2.4vw, 2.7rem)", lineHeight: 1.08 }}
                    >
                      {titulo}
                    </h3>
                    <p className="text-verde-concepto mt-3 font-sans text-[1.05rem] font-semibold">
                      {tagline}
                    </p>
                    <p className="mt-6 max-w-[58ch] font-sans text-[0.98rem] leading-relaxed text-white/80">
                      {material.descripcion}
                    </p>
                    <p className="mt-4 max-w-[58ch] font-sans text-[0.98rem] leading-relaxed text-white/80">
                      {detalle}
                    </p>

                    <div className="mt-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-4 lg:mt-auto lg:pt-8">
                      <p className="font-mono text-[0.72rem] tracking-[0.08em] text-white/45 uppercase">
                        {material.tipo} · {material.fecha} ·{" "}
                        {material.paginas
                          ? `${material.paginas} páginas`
                          : material.formato}
                      </p>
                      {/* Placeholder hasta tener los archivos reales del catálogo. */}
                      <a
                        href="#materiales"
                        className="bg-naranja-accion inline-flex items-center gap-2 rounded-lg px-5 py-2.5 font-sans text-[0.92rem] font-medium text-white transition-opacity hover:opacity-90"
                      >
                        {ACCION[material.formato]}
                        <ArrowUpRight size={17} />
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
