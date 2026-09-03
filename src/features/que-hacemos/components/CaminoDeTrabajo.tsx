"use client";

import { Fragment, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PASOS_TRABAJO } from "../data";
import { getLenis } from "@/lib/lenis";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * "Cómo trabajamos" (sitemap: 4 pasos) — VIAJE HORIZONTAL: la página gira
 * 90 grados. La escena se pinea y el scroll vertical se traduce en un
 * travelling lateral por los 4 pasos del camino de un proyecto, cada uno a
 * pantalla completa (número gigante en contorno, verbo display, texto corto
 * y foto real del método). Las fotos llevan un parallax propio: derivan en
 * contra del viaje, lo que vende la profundidad. Es la única sección del
 * sitio que se mueve en horizontal — un idioma nuevo para un contenido que
 * ES un recorrido.
 *
 * El método completo (5 pasos, copy oficial) vive en el home: esta es la
 * versión "qué significa contratarnos", corta y al pie. PENDIENTE validar.
 *
 * Mobile / prefers-reduced-motion: los 4 pasos apilados en vertical.
 */
export function CaminoDeTrabajo() {
  const zoneRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const numeroRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const rellenoRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const reduced = useReducedMotion();
  const [live, setLive] = useState(false);

  useIsomorphicLayoutEffect(() => {
    if (reduced) return;
    if (!window.matchMedia("(hover: hover) and (min-width: 768px)").matches) return;
    setLive(true);
  }, [reduced]);

  useIsomorphicLayoutEffect(() => {
    if (!live) return;
    const zone = zoneRef.current;
    const stage = stageRef.current;
    const track = trackRef.current;
    if (!zone || !stage || !track) return;

    const ctx = gsap.context(() => {
      const fotos = gsap.utils.toArray<HTMLElement>("[data-cam-foto]");
      const n = PASOS_TRABAJO.length;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: zone,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });

      // RIEL 01–04 (el mismo de Investigación): el camino dibujado. El
      // segmento entre dos pasos se RELLENA con el viaje del tren (mismo
      // scroll, mismo ritmo) y el número siguiente se enciende cuando el
      // panel terminó de llegar. Antes había un contador "01 / 04" que
      // saltaba en un frame mientras el tren se deslizaba continuo.
      // Directo al DOM (sin re-render por tick), en el onUpdate del
      // TIMELINE: el scrub sigue moviéndose después de que el scroll paró y
      // el del trigger leería viejo.
      gsap.set(rellenoRefs.current.filter(Boolean), { scaleX: 0 });
      let activo = -1;
      tl.eventCallback("onUpdate", () => {
        const p = tl.progress() * (n - 1);
        rellenoRefs.current.forEach((r, k) => {
          if (r) r.style.transform = `scaleX(${Math.min(1, Math.max(0, p - k))})`;
        });
        // El número siguiente se enciende cuando su panel TERMINÓ de llegar
        // (85% del tramo), no a mitad de camino: primero se llena la línea,
        // después se prende el número.
        const i = Math.min(n - 1, Math.max(0, Math.floor(p + 0.15)));
        if (i !== activo) {
          activo = i;
          numeroRefs.current.forEach((el, k) => {
            if (el) el.dataset.active = String(k === i);
          });
        }
      });

      // El travelling: todo el tren de paneles hacia la izquierda.
      tl.to(
        track,
        {
          x: () => -(track.scrollWidth - window.innerWidth),
          ease: "none",
          duration: n - 1,
        },
        0,
      );

      // Parallax de las fotos: derivan en contra del viaje mientras su panel
      // cruza la pantalla (el panel i está al frente alrededor de t = i).
      fotos.forEach((foto, i) => {
        tl.fromTo(
          foto,
          { xPercent: 8 },
          { xPercent: -8, ease: "none", duration: 1 },
          Math.max(0, i - 0.5),
        );
      });
    }, stage);

    return () => ctx.revert();
  }, [live]);

  // Click en un número del riel → viajar a ese paso (misma cuenta que el
  // scrub: el panel i está al frente en progress = i/(n-1)).
  const saltarA = (i: number) => {
    const zone = zoneRef.current;
    if (!zone) return;
    const top = zone.getBoundingClientRect().top + window.scrollY;
    const destino =
      top + (zone.offsetHeight - window.innerHeight) * (i / (PASOS_TRABAJO.length - 1));
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(destino, { duration: 1.2 });
    else window.scrollTo({ top: destino, behavior: "smooth" });
  };

  return (
    <section className="bg-gris-fondo relative" aria-label="Cómo trabajamos">
      <div ref={zoneRef} className={"relative " + (live ? "h-[380svh]" : "")}>
        <div
          ref={stageRef}
          className={
            live
              ? "sticky top-0 flex h-[100svh] flex-col overflow-clip"
              : "flex flex-col"
          }
        >
          {/* Título en display, como Niveles: antes la sección solo tenía
              una etiqueta mono de 11px y los verbos de los pasos (80px) se
              leían como titulares sueltos, sin saber que eran un método. */}
          <div className="mx-auto flex w-full max-w-screen-xl items-end justify-between px-5 pt-24 md:px-10 md:pt-28">
            <div>
              <h2
                className="font-display text-azul-principal font-extrabold tracking-[-0.02em]"
                style={{ fontSize: "clamp(1.6rem, 1rem + 1.6vw, 2.15rem)", lineHeight: 1.1 }}
              >
                Cómo trabajamos
              </h2>
              <p className="text-gris-texto mt-2 font-sans text-[1rem] leading-relaxed">
                El camino de un proyecto, en cuatro pasos.
              </p>
            </div>
            {live && (
              /* Riel 01–04: el camino dibujado (misma pieza que el hero de
                 Investigación). Números clicables; el relleno verde avanza
                 con el tren. Sin flecha: el camino ya dice que avanza. */
              <nav
                aria-label="Pasos del camino"
                className="flex items-center gap-3 pb-1 font-mono text-[0.7rem] tracking-[0.22em] uppercase"
              >
                {PASOS_TRABAJO.map((paso, i) => (
                  <Fragment key={paso.n}>
                    <button
                      ref={(el) => {
                        numeroRefs.current[i] = el;
                      }}
                      type="button"
                      data-active={i === 0}
                      onClick={() => saltarA(i)}
                      aria-label={`Ir al paso ${i + 1}: ${paso.verbo}`}
                      className="text-gris-texto/50 hover:text-azul-principal data-[active=true]:text-azul-principal cursor-pointer tabular-nums transition-colors duration-300"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </button>
                    {i < PASOS_TRABAJO.length - 1 && (
                      <span className="bg-azul-principal/15 relative h-px w-12 overflow-hidden">
                        <span
                          ref={(el) => {
                            rellenoRefs.current[i] = el;
                          }}
                          className="bg-verde-concepto absolute inset-0 origin-left"
                          style={{ transform: "scaleX(0)" }}
                        />
                      </span>
                    )}
                  </Fragment>
                ))}
              </nav>
            )}
          </div>

          {live ? (
            /* ── El tren horizontal ─────────────────────────────────────── */
            <div className="relative min-h-0 flex-1">
              <div ref={trackRef} className="flex h-full w-max will-change-transform">
                {PASOS_TRABAJO.map((paso) => (
                  <article
                    key={paso.n}
                    // Anclado ARRIBA, no centrado: al entrar la sección desde
                    // abajo, título y primer paso llegan juntos en vez de
                    // media pantalla hueca antes del contenido.
                    className="flex h-full w-screen items-start pt-8 md:pt-10"
                  >
                    <div className="mx-auto grid w-full max-w-screen-xl items-center gap-10 px-5 md:grid-cols-[1.05fr_1fr] md:px-10">
                      <div className="relative">
                        {/* Número gigante en contorno, detrás del verbo. */}
                        <span
                          aria-hidden="true"
                          className="font-display pointer-events-none absolute -top-[0.55em] left-0 leading-none font-extrabold text-transparent select-none [-webkit-text-stroke:2px_color-mix(in_srgb,var(--color-azul-claro)_65%,transparent)]"
                          style={{ fontSize: "clamp(6rem, 3rem + 10vw, 12rem)" }}
                        >
                          {paso.n}
                        </span>
                        <h3
                          className="font-display text-azul-principal relative font-extrabold tracking-[-0.02em]"
                          style={{
                            fontSize: "clamp(2.6rem, 1rem + 4.6vw, 5rem)",
                            lineHeight: 1,
                          }}
                        >
                          {paso.verbo}
                        </h3>
                        <p className="text-gris-texto relative mt-5 max-w-[38ch] font-sans text-[1.05rem] leading-relaxed md:text-[1.15rem]">
                          {paso.texto}
                        </p>
                      </div>
                      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-[0_30px_70px_-30px_rgb(15_23_42/0.4)]">
                        {/* La foto es más ancha que su marco: el excedente
                            banca el parallax sin mostrar bordes. */}
                        <div data-cam-foto className="absolute -inset-x-[12%] inset-y-0">
                          <Image
                            src={paso.foto}
                            alt=""
                            fill
                            sizes="(min-width: 768px) 55vw, 100vw"
                            className="object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ) : (
            /* ── Fallback vertical ──────────────────────────────────────── */
            <div className="mx-auto w-full max-w-screen-xl px-5 pb-20 md:px-10">
              {PASOS_TRABAJO.map((paso) => (
                <article
                  key={paso.n}
                  className="border-azul-principal/10 grid gap-6 border-t py-12 first:border-t-0 md:grid-cols-[1fr_1fr] md:items-center md:gap-10"
                >
                  <div>
                    <p className="text-gris-texto font-mono text-[0.7rem] tracking-[0.14em] uppercase">
                      Paso {paso.n}
                    </p>
                    <h3
                      className="font-display text-azul-principal mt-3 font-extrabold tracking-[-0.02em]"
                      style={{ fontSize: "clamp(2rem, 1rem + 3.4vw, 3.4rem)", lineHeight: 1.05 }}
                    >
                      {paso.verbo}
                    </h3>
                    <p className="text-gris-texto mt-4 max-w-[44ch] font-sans text-[1rem] leading-relaxed">
                      {paso.texto}
                    </p>
                  </div>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                    <Image
                      src={paso.foto}
                      alt=""
                      fill
                      sizes="100vw"
                      className="object-cover"
                    />
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
