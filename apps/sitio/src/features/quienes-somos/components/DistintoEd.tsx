"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * "Cómo trabaja distinto ED" (sección 5 del sitemap de Qué es ED): no
 * enlatados — escucha del contexto y capacidad instalada. Sin CTA (sitemap).
 *
 * Concepto: LA COMPARATIVA VIVA. Lámina clara, sin pin (el ritmo de la página
 * alterna clavado / flujo). Dos caminos se DIBUJAN con el scroll (scrub):
 *
 *  A. "Una capacitación genérica": línea recta gris que recorre 3 pasos
 *     (empieza → termina → no deja impacto)… y MUERE en una ✗ — la tarjeta
 *     entera queda apagada (gris, levemente hundida).
 *  B. "Trabajar con ED": línea VERDE que crece por 4 pasos (escucha →
 *     a medida → acompañamiento → capacidad instalada) y al final SE
 *     RAMIFICA en brotes que siguen creciendo solos — la capacidad queda
 *     instalada, el camino no termina.
 *
 * Remate (reveal aparte): «Trabajamos para que dejen de necesitarnos.»
 *
 * Contenido de los videos 4, 11 y 12 (enlatados sin impacto duradero, escucha
 * del contexto, especialistas convocados a medida, largo plazo, capacidad
 * instalada / enfoque emancipador, comunidades de aprendizaje).
 * Reduced-motion / sin JS: todo dibujado y legible, estático.
 */

const PASOS_GENERICO = ["Empieza", "Termina", "No deja impacto"];

const PASOS_ED = [
  { t: "Escucha del contexto", d: "Compartís tu problema real; no hay fórmula previa." },
  { t: "Propuesta a medida", d: "Convocamos especialistas y diseñamos en conjunto." },
  { t: "Acompañamiento sostenido", d: "Análisis continuo de lo que pasa en las aulas." },
  { t: "Capacidad instalada", d: "El equipo docente queda con herramientas y comunidad propia." },
];

export function DistintoEd() {
  const rootRef = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return;

    const ctx = gsap.context(() => {
      // ── Acople de la lámina clara sobre el navy de la Red ────────────────
      gsap.fromTo(
        root,
        { scale: 0.97, y: 36 },
        {
          scale: 1,
          y: 0,
          ease: "none",
          scrollTrigger: { trigger: root, start: "top 96%", end: "top 14%", scrub: true },
        },
      );

      const q = (sel: string) => root.querySelector<HTMLElement>(sel);
      const qa = (sel: string) => gsap.utils.toArray<HTMLElement>(sel);

      const header = qa("[data-dist-head]");
      const lineA = q("[data-line-a]");
      const lineB = q("[data-line-b]");
      const stepsA = qa("[data-step-a]");
      const stepsB = qa("[data-step-b]");
      const cardA = q("[data-card-a]");
      const cross = q("[data-cross]");
      const brotes = gsap.utils.toArray<SVGPathElement>("[data-brote]");
      const broteDots = gsap.utils.toArray<SVGCircleElement>("[data-brote-dot]");
      const finale = qa("[data-dist-final]");

      // Estados iniciales (solo con motion)
      gsap.set(header, { autoAlpha: 0, y: 24 });
      if (lineA) gsap.set(lineA, { scaleY: 0, transformOrigin: "top center" });
      if (lineB) gsap.set(lineB, { scaleY: 0, transformOrigin: "top center" });
      gsap.set([...stepsA, ...stepsB], { autoAlpha: 0, x: -14 });
      if (cross) gsap.set(cross, { scale: 0, autoAlpha: 0 });
      brotes.forEach((b) => {
        const len = b.getTotalLength();
        gsap.set(b, { strokeDasharray: len, strokeDashoffset: len });
      });
      gsap.set(broteDots, { scale: 0, autoAlpha: 0, transformOrigin: "50% 50%" });
      gsap.set(finale, { autoAlpha: 0, y: 30 });

      // Header: reveal al entrar (una vez)
      gsap.to(header, {
        autoAlpha: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: root, start: "top 70%", once: true },
      });

      // ── Los dos caminos, conducidos por el scroll ────────────────────────
      const grid = q("[data-dist-grid]");
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: grid ?? root,
          start: "top 78%",
          end: "bottom 55%",
          scrub: true,
        },
      });

      // Camino A: se dibuja… y muere
      if (lineA) tl.to(lineA, { scaleY: 1, duration: 1.6 }, 0);
      stepsA.forEach((s, i) => {
        tl.to(s, { autoAlpha: 1, x: 0, duration: 0.35, ease: "power2.out" }, 0.2 + i * 0.5);
      });
      if (cross) tl.to(cross, { scale: 1, autoAlpha: 1, duration: 0.4, ease: "back.out(2.5)" }, 1.75);
      if (cardA) tl.to(cardA, { opacity: 0.55, filter: "grayscale(1)", y: 6, duration: 0.5 }, 1.85);

      // Camino B: se dibuja… y se ramifica
      if (lineB) tl.to(lineB, { scaleY: 1, duration: 2.2 }, 2.1);
      stepsB.forEach((s, i) => {
        tl.to(s, { autoAlpha: 1, x: 0, duration: 0.35, ease: "power2.out" }, 2.3 + i * 0.52);
      });
      brotes.forEach((b, i) => {
        tl.to(b, { strokeDashoffset: 0, duration: 0.6, ease: "power2.out" }, 4.4 + i * 0.18);
      });
      tl.to(
        broteDots,
        { scale: 1, autoAlpha: 1, duration: 0.35, stagger: 0.1, ease: "back.out(3)" },
        4.9,
      );

      // ── Remate (reveal aparte, una vez) ──────────────────────────────────
      gsap.to(finale, {
        autoAlpha: 1,
        y: 0,
        duration: 0.9,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: { trigger: "[data-dist-final-wrap]", start: "top 78%", once: true },
      });
    }, root);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      ref={rootRef}
      id="distinto"
      className="bg-grain-light relative z-50 -mt-[4svh] overflow-clip rounded-t-[2.5rem] bg-gradient-to-b from-white to-gris-fondo/60 shadow-[0_-24px_60px_-30px_rgb(15_23_42/0.35)]"
      aria-label="Cómo trabaja distinto ED"
    >
      <div className="mx-auto max-w-screen-xl px-5 py-24 md:px-10 md:py-32">
        {/* ── Encabezado ──────────────────────────────────────────────────── */}
        <div className="max-w-3xl">
          <span data-dist-head className="text-gris-texto font-mono text-[0.78rem] font-medium tracking-[0.24em] uppercase">
            Cómo trabaja distinto ED
          </span>
          <h2
            data-dist-head
            className="font-display text-azul-principal mt-6 font-bold tracking-[-0.02em]"
            style={{ fontSize: "clamp(2rem, 1rem + 3.4vw, 3.4rem)", lineHeight: 1.08 }}
          >
            Los cursos genéricos empiezan y terminan.
            <br />
            <span className="text-verde-concepto">Lo nuestro queda.</span>
          </h2>
          <p data-dist-head className="text-gris-texto mt-6 max-w-[56ch] font-sans text-[1rem] leading-relaxed md:text-[1.1rem]">
            Las instituciones suelen llegar después de capacitaciones que no
            dejaron huella. Nuestro punto de partida es otro: escuchar el
            contexto y construir una solución a la medida de cada comunidad.
          </p>
        </div>

        {/* ── Los dos caminos ─────────────────────────────────────────────── */}
        <div data-dist-grid className="mt-16 grid gap-8 md:mt-20 md:grid-cols-2 md:gap-10">
          {/* Camino A: la capacitación genérica */}
          <div
            data-card-a
            className="border-azul-principal/10 relative rounded-3xl border bg-white p-8 md:p-10"
          >
            <p className="text-gris-texto font-mono text-[0.72rem] font-medium tracking-[0.22em] uppercase">
              Una capacitación genérica
            </p>
            <div className="relative mt-8 pl-8">
              {/* La línea recta que muere */}
              <span aria-hidden="true" className="bg-azul-principal/12 absolute top-1 bottom-10 left-[7px] w-[2px]">
                <span data-line-a className="bg-gris-texto/70 absolute inset-0 block" />
              </span>
              <ul className="space-y-9">
                {PASOS_GENERICO.map((p) => (
                  <li key={p} data-step-a className="relative">
                    <span aria-hidden="true" className="bg-gris-texto/60 absolute top-[7px] -left-8 ml-[2px] h-3 w-3 rounded-full" />
                    <p className="font-display text-azul-principal/80 text-[1.1rem] font-bold">{p}</p>
                  </li>
                ))}
              </ul>
              {/* La ✗ final */}
              <div data-cross className="mt-9 flex items-center gap-3">
                <span className="border-gris-texto/50 text-gris-texto flex h-9 w-9 items-center justify-center rounded-full border-2 text-lg font-bold">
                  ✕
                </span>
                <p className="text-gris-texto font-sans text-[0.9rem]">
                  Sin impacto duradero.
                </p>
              </div>
            </div>
          </div>

          {/* Camino B: trabajar con ED */}
          <div className="border-verde-concepto/25 relative rounded-3xl border bg-white p-8 shadow-[0_24px_60px_-30px_rgb(31_154_120/0.25)] md:p-10">
            <p className="text-verde-concepto font-mono text-[0.72rem] font-medium tracking-[0.22em] uppercase">
              Trabajar con ED
            </p>
            <div className="relative mt-8 pl-8">
              {/* La línea que crece */}
              <span aria-hidden="true" className="bg-verde-concepto/15 absolute top-1 bottom-24 left-[7px] w-[2px]">
                <span data-line-b className="bg-verde-concepto absolute inset-0 block" />
              </span>
              <ul className="space-y-8">
                {PASOS_ED.map((p) => (
                  <li key={p.t} data-step-b className="group relative">
                    <span aria-hidden="true" className="bg-verde-concepto absolute top-[7px] -left-8 ml-[2px] h-3 w-3 rounded-full" />
                    <p className="font-display text-azul-principal text-[1.1rem] font-bold transition-colors duration-300 group-hover:text-verde-concepto">
                      {p.t}
                    </p>
                    <p className="text-gris-texto mt-1 font-sans text-[0.88rem] leading-snug">{p.d}</p>
                  </li>
                ))}
              </ul>
              {/* Las ramas que siguen creciendo solas */}
              <svg viewBox="0 0 200 90" className="mt-4 -ml-1 h-auto w-44" aria-hidden="true">
                <path data-brote d="M 9 0 C 9 30 9 42 9 42 C 9 62 40 74 72 78" fill="none" stroke="#1f9a78" strokeWidth="2" strokeLinecap="round" />
                <path data-brote d="M 9 42 C 9 60 22 78 40 86" fill="none" stroke="#1f9a78" strokeWidth="2" strokeLinecap="round" />
                <path data-brote d="M 9 42 C 30 52 92 56 132 50" fill="none" stroke="#1f9a78" strokeWidth="2" strokeLinecap="round" />
                <circle data-brote-dot cx="72" cy="78" r="4" fill="#1f9a78" />
                <circle data-brote-dot cx="40" cy="86" r="4" fill="#1f9a78" />
                <circle data-brote-dot cx="132" cy="50" r="4" fill="#e07a2f" />
              </svg>
              <p data-step-b className="text-verde-concepto -mt-1 font-sans text-[0.9rem] font-medium">
                …y la comunidad sigue creciendo sola.
              </p>
            </div>
          </div>
        </div>

        {/* ── Remate: el enfoque emancipador ──────────────────────────────── */}
        <div data-dist-final-wrap className="mt-24 text-center md:mt-32">
          <span data-dist-final className="text-gris-texto font-mono text-[0.78rem] font-medium tracking-[0.24em] uppercase">
            Capacidad instalada · enfoque emancipador
          </span>
          <h3
            data-dist-final
            className="font-display text-azul-principal mx-auto mt-6 max-w-[22ch] font-bold tracking-[-0.02em]"
            style={{ fontSize: "clamp(2rem, 1rem + 3.8vw, 3.8rem)", lineHeight: 1.1 }}
          >
            Trabajamos para que dejen de{" "}
            <span className="text-verde-concepto underline decoration-[0.06em] underline-offset-[0.14em]">
              necesitarnos
            </span>
            .
          </h3>
          <p data-dist-final className="text-gris-texto mx-auto mt-6 max-w-[54ch] font-sans text-[1rem] leading-relaxed md:text-[1.1rem]">
            Comunidades de aprendizaje con herramientas y decisiones propias,
            que siguen transformando sus aulas cuando nosotros ya no estamos.
          </p>
        </div>
      </div>
    </section>
  );
}
