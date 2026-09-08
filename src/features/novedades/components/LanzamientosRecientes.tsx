"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { RevealLines } from "@/components/ui/RevealLines";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "@/components/ui/icons";
import { LANZAMIENTOS } from "../data";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

/**
 * "Lanzamientos y recursos recientes" — puente a Biblioteca. Riel horizontal
 * que se arrastra con inercia (drag + momentum) en desktop; en touch va el
 * scroll nativo (que ya trae su propia inercia). Sin líneas ni gráficos: pura
 * física de arrastre. La última tarjeta es el CTA a Biblioteca.
 *
 * Affordance del gesto (solo puntero fino): el cursor nativo se reemplaza por
 * una pill "arrastrá" que sigue al mouse sobre el riel, y un velo de gris-fondo
 * en el borde derecho insinúa que hay más contenido (se apaga al llegar al
 * final). En touch no hace falta: el riel cortado + scroll nativo ya lo dicen.
 */
export function LanzamientosRecientes() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const pillRef = useRef<HTMLDivElement | null>(null);
  const fadeRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();
  const st = useRef({ down: false, startX: 0, startScroll: 0, vx: 0, lastX: 0, raf: 0 });

  const hoverFine = () => window.matchMedia("(hover: hover)").matches;

  /* La pill se posiciona directo al DOM (transform instantáneo, sin estado
     React); el "apretar" se transmite escalando el contenido interno, que sí
     tiene transición CSS. */
  const movePill = (e: ReactPointerEvent<HTMLDivElement>) => {
    const pill = pillRef.current;
    const wrap = wrapRef.current;
    if (!pill || !wrap) return;
    const r = wrap.getBoundingClientRect();
    pill.style.transform = `translate(${e.clientX - r.left}px, ${e.clientY - r.top}px) translate(-50%, -50%)`;
  };

  const setPillPressed = (pressed: boolean) => {
    const inner = pillRef.current?.firstElementChild as HTMLElement | null;
    if (inner) inner.style.transform = pressed ? "scale(0.9)" : "scale(1)";
  };

  const onEnter = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!hoverFine() || !pillRef.current) return;
    movePill(e);
    pillRef.current.style.opacity = "1";
  };

  const onLeave = () => {
    if (pillRef.current) pillRef.current.style.opacity = "0";
    onUp();
  };

  /* Extremos del riel: apagan el velo derecho (directo al DOM) y deshabilitan
     las flechas prev/next (estado React, solo cambia en los bordes). */
  const [ends, setEnds] = useState({ start: true, end: false });
  const syncEdges = () => {
    const el = trackRef.current;
    if (!el) return;
    const start = el.scrollLeft <= 8;
    const end = el.scrollLeft >= el.scrollWidth - el.clientWidth - 8;
    if (fadeRef.current) fadeRef.current.style.opacity = end ? "0" : "1";
    setEnds((prev) => (prev.start === start && prev.end === end ? prev : { start, end }));
  };

  useEffect(() => {
    syncEdges();
    window.addEventListener("resize", syncEdges);
    return () => window.removeEventListener("resize", syncEdges);
  }, []);

  // Una card por paso: ancho de la primera card + gap del riel (gap-5 = 20px).
  const scrollByCard = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector("article");
    const paso = (card ? card.getBoundingClientRect().width : el.clientWidth * 0.8) + 20;
    el.scrollBy({ left: dir * paso, behavior: reduced ? "auto" : "smooth" });
  };

  const onKey = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    scrollByCard(e.key === "ArrowLeft" ? -1 : 1);
  };

  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!hoverFine()) return; // touch → scroll nativo
    const el = trackRef.current;
    if (!el) return;
    cancelAnimationFrame(st.current.raf);
    Object.assign(st.current, {
      down: true,
      startX: e.clientX,
      startScroll: el.scrollLeft,
      lastX: e.clientX,
      vx: 0,
    });
    el.setPointerCapture?.(e.pointerId);
    setPillPressed(true);
  };

  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    movePill(e);
    const s = st.current;
    const el = trackRef.current;
    if (!s.down || !el) return;
    el.scrollLeft = s.startScroll - (e.clientX - s.startX);
    s.vx = e.clientX - s.lastX;
    s.lastX = e.clientX;
  };

  const onUp = () => {
    setPillPressed(false);
    const s = st.current;
    const el = trackRef.current;
    if (!s.down || !el) return;
    s.down = false;
    if (reduced) return;
    let v = s.vx;
    const decay = () => {
      v *= 0.92;
      el.scrollLeft -= v;
      if (Math.abs(v) > 0.4) s.raf = requestAnimationFrame(decay);
    };
    s.raf = requestAnimationFrame(decay);
  };

  return (
    <section
      id="recien-salido"
      data-indice="Recién salido"
      className="bg-gris-fondo"
      aria-label="Lanzamientos y recursos recientes"
    >
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
              Recién salido, para el aula.
            </RevealLines>
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
              Ir a Biblioteca
              <ArrowUpRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
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
          onKeyDown={onKey}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerEnter={onEnter}
          onPointerLeave={onLeave}
          onScroll={syncEdges}
          className="scrollbar-none focus-visible:ring-verde-concepto/50 mt-8 flex gap-5 overflow-x-auto px-5 pb-20 select-none focus-visible:ring-2 focus-visible:outline-none md:cursor-none md:px-10"
        >
          {LANZAMIENTOS.map((l) => (
            <article
              key={l.id}
              className="group relative aspect-[3/4] w-[76vw] shrink-0 overflow-hidden rounded-2xl sm:w-[42vw] lg:w-[23rem]"
            >
              <Image
                src={l.imagen}
                alt=""
                fill
                sizes="(max-width: 640px) 76vw, (max-width: 1024px) 42vw, 368px"
                draggable={false}
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="from-azul-principal/90 via-azul-principal/10 absolute inset-0 bg-gradient-to-t to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <span className="text-azul-claro font-mono text-[0.66rem] tracking-[0.14em] uppercase">
                  {l.tipo}
                </span>
                <h3 className="font-display mt-1.5 text-[1.15rem] leading-snug font-bold">
                  {l.titulo}
                </h3>
              </div>
            </article>
          ))}

          {/* CTA final del riel */}
          <Link
            href="/biblioteca"
            className="group border-azul-principal/15 hover:border-verde-concepto/50 flex aspect-[3/4] w-[60vw] shrink-0 flex-col items-start justify-end rounded-2xl border bg-white p-6 transition-colors sm:w-[32vw] lg:w-[17rem]"
          >
            <span className="bg-verde-concepto/10 text-verde-concepto-texto mb-4 flex h-11 w-11 items-center justify-center rounded-xl">
              <ArrowUpRight size={22} />
            </span>
            <h3 className="font-display text-azul-principal text-[1.2rem] leading-snug font-bold">
              Toda la biblioteca
            </h3>
            <p className="text-gris-texto mt-2 font-sans text-[0.9rem] leading-relaxed">
              Publicaciones, materiales y proyectos, abiertos para llevar al aula.
            </p>
          </Link>
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
        <div
          ref={pillRef}
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-0 z-30 hidden opacity-0 transition-opacity duration-200 md:block"
        >
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
