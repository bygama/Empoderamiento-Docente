"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "@/components/ui/icons";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ── Datos de los 5 pasos ──────────────────────────────────────────────────
// Copy oficial del cliente [[ed-copy-oficial]]. `resumen` = la frase destacada
// (verde); `detalle` = el texto debajo. Títulos y frases sin punto final; los
// párrafos descriptivos sí lo llevan.
const PASOS = [
  {
    n: "01",
    slug: "dialogamos",
    titulo: "Dialogamos",
    resumen: "Toda solución nace de una realidad comprendida",
    detalle:
      "Dialogamos con las personas, comprendemos los contextos y analizamos la realidad para construir una lectura compartida que oriente cada decisión.",
    foto: "/metodo/escuchamos.webp",
    fotoAlt: "Docentes en conversación — etapa de diálogo",
  },
  {
    n: "02",
    slug: "investigamos",
    titulo: "Investigamos",
    resumen: "La práctica también produce conocimiento",
    detalle:
      "Investigamos en diálogo permanente con la práctica para comprender los desafíos de cada realidad, generar evidencia y construir soluciones educativas que transformen la enseñanza y el aprendizaje de las matemáticas.",
    foto: "/hero/hero-3.webp",
    fotoAlt: "Equipo investigando en conjunto — etapa de investigación",
  },
  {
    n: "03",
    slug: "diseñamos",
    titulo: "Diseñamos",
    resumen: "Cada realidad inspira una solución distinta",
    detalle:
      "Diseñamos soluciones educativas que integran investigación, currículo, evaluación, materiales didácticos y desarrollo profesional docente para responder a los desafíos de cada contexto.",
    foto: "/metodo/disenamos.webp",
    fotoAlt: "Selección de materiales educativos — etapa de diseño",
  },
  {
    n: "04",
    slug: "implementamos",
    titulo: "Implementamos",
    resumen: "Vivimos para hacer vivir",
    detalle:
      "Construimos procesos donde la experiencia, la implementación y la práctica reflexiva fortalecen el desarrollo profesional y generan nuevas formas de relacionarse con las matemáticas y de fortalecer las decisiones pedagógicas.",
    foto: "/metodo/acompanamos.webp",
    fotoAlt: "Trabajo situado junto a docentes — etapa de implementación",
  },
  {
    n: "05",
    slug: "evaluamos",
    titulo: "Evaluamos",
    resumen: "La evidencia orienta cada nuevo paso",
    detalle:
      "Analizamos procesos, interpretamos evidencias y generamos conocimiento para fortalecer decisiones, consolidar aprendizajes y potenciar nuevas transformaciones.",
    foto: "/metodo/evaluamos.webp",
    fotoAlt: "Revisión de materiales y avances — etapa de evaluación",
  },
] as const;

/**
 * Bloque sticky scroll-telling. h-[500vh] (380vh en celular: cinco
 * pantallas para cinco pasos se hacían largas con el dedo) + sticky top-0 h-screen
 * (sin pin:true — compatible con Lenis). 5 pasos con fotos reales que
 * se cross-fadean con el progreso del scroll. Timeline scrubbed mapea
 * 0→1 a las N fases (el número de pasos se lee de PASOS). Nav lateral de
 * puntos sincronizado. Mask reveal del título de cada paso. Foto alterna
 * izq/der por índice.
 */
export function ComoTrabajamos() {
  const rootRef = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    const el = rootRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const pasos = el.querySelectorAll<HTMLElement>("[data-paso]");
      const navDots = el.querySelectorAll<HTMLElement>("[data-nav-dot]");
      const glowBg = el.querySelector<HTMLElement>("[data-glow-bg]");

      // ── Estado inicial: paso 0 visible, el resto ocultos ──────────
      const N = pasos.length;
      if (N >= 2) {
        gsap.set(pasos[0], { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" });
        gsap.set(Array.from(pasos).slice(1), {
          opacity: 0,
          y: 64,
          scale: 0.97,
          filter: "blur(8px)",
        });

        // ── Timeline scrubbed — N fases en 0→1 ───────────────────────
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
          },
        });

        // N-1 transiciones uniformes: cada una centrada en (i+1)/N (el paso
        // saliente se va un poco antes y el entrante llega justo después).
        const TRANSITIONS = Array.from({ length: N - 1 }, (_, i) => {
          const outAt = (i + 1) / N - 0.05;
          return { outAt, inAt: outAt + 0.06 };
        });

        TRANSITIONS.forEach(({ outAt, inAt }, i) => {
          tl.to(
            pasos[i],
            {
              opacity: 0,
              y: -56,
              scale: 0.97,
              filter: "blur(8px)",
              duration: 0.1,
              ease: "power2.in",
            },
            outAt,
          ).to(
            pasos[i + 1],
            {
              opacity: 1,
              y: 0,
              scale: 1,
              filter: "blur(0px)",
              duration: 0.14,
              ease: "power3.out",
            },
            inAt,
          );
        });

        // ── Nav dots sincronizados ─────────────────────────────────
        if (navDots.length === N) {
          const dotsTl = gsap.timeline({
            scrollTrigger: {
              trigger: el,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.6,
            },
          });
          for (let i = 0; i < N - 1; i++) {
            const t = (i + 1) / N;
            dotsTl
              .to(
                navDots[i],
                {
                  height: 8,
                  backgroundColor: "rgb(31 45 77 / 0.18)",
                  ease: "power2.inOut",
                  duration: 0.1,
                },
                t,
              )
              .to(
                navDots[i + 1],
                {
                  height: 36,
                  backgroundColor: "var(--color-naranja-accion)",
                  ease: "power2.inOut",
                  duration: 0.1,
                },
                t,
              );
          }
        }
      }

      // ── Glow bg parallax ─────────────────────────────────────────
      if (glowBg) {
        gsap.fromTo(
          glowBg,
          { x: 0, y: 0 },
          {
            x: -120,
            y: -100,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top top",
              end: "bottom bottom",
              scrub: 2,
            },
          },
        );
      }
    }, el);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section
      ref={rootRef}
      id="como-trabajamos"
      data-indice="Cómo trabajamos"
      data-section="metodo"
      className="bg-grain-light relative overflow-clip bg-gradient-to-b from-white via-white to-gris-fondo/20"
      aria-label="Cómo trabajamos"
    >
      <div className="relative h-[380vh] md:h-[500vh]">
        <div className="sticky top-0 flex h-screen flex-col overflow-hidden">

          {/* Glow verde ambiental */}
          <div
            data-glow-bg
            aria-hidden="true"
            className="pointer-events-none absolute -right-40 bottom-0 z-0 h-[44rem] w-[44rem] rounded-full opacity-40 blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgb(31 154 120 / 0.18) 0%, transparent 65%)",
            }}
          />

          {/* ── Recorrido de pasos (foto + indicador + texto). Sin encabezado:
              la composición ocupa todo el alto y se centra verticalmente. ── */}
          <div className="relative z-10 min-h-0 flex-1 overflow-hidden">

            {/* Indicador de pasos — eje vertical (centro en desktop, margen
                izquierdo compacto en mobile). Funciona igual con la
                alternancia: siempre queda entre la foto y el texto. */}
            <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-start pl-4 md:justify-center md:pl-0">
              <div className="relative flex flex-col items-center gap-2.5">
                {/* Línea fina conectora */}
                <span
                  aria-hidden="true"
                  className="bg-azul-principal/10 absolute top-1 bottom-1 left-1/2 w-px -translate-x-1/2"
                />
                {PASOS.map((p, idx) => (
                  <span
                    key={p.n}
                    data-nav-dot={idx}
                    className="relative w-1.5 rounded-full"
                    style={{
                      height: idx === 0 ? 36 : 8,
                      backgroundColor:
                        idx === 0
                          ? "var(--color-naranja-accion)"
                          : "rgb(31 45 77 / 0.18)",
                      transition: "none",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Pasos apilados */}
            <div className="absolute inset-0 flex items-center">
              {PASOS.map((paso, idx) => {
                // Alternancia: 01 izq · 02 der · 03 izq · 04 der.
                const fotoRight = idx % 2 === 1;
                return (
                  <div
                    key={paso.n}
                    data-paso={idx}
                    className="absolute inset-0 flex items-center"
                    style={{ willChange: "opacity, transform, filter" }}
                  >
                    <div className="mx-auto grid w-full max-w-screen-xl grid-cols-12 items-center gap-x-6 px-5 md:gap-x-8 md:px-10">

                      {/* Foto real — pegada al eje central (alterna lado) */}
                      <div
                        className={`hidden md:col-span-5 md:row-start-1 md:block ${
                          fotoRight ? "md:col-start-8" : "md:col-start-1"
                        }`}
                      >
                        <div
                          className={`relative w-full max-w-[25rem] overflow-hidden rounded-2xl shadow-[0_28px_72px_-18px_rgb(31_45_77/0.20)] ${
                            fotoRight ? "mr-auto" : "ml-auto"
                          }`}
                        >
                          <Image
                            src={paso.foto}
                            alt={paso.fotoAlt}
                            width={400}
                            height={533}
                            className="aspect-[3/4] max-h-[66vh] w-full object-cover"
                            sizes="(max-width: 768px) 90vw, 400px"
                            priority={idx === 0}
                          />
                          {/* Overlay tenue de marca */}
                          <div
                            aria-hidden="true"
                            className="bg-verde-concepto/10 absolute inset-0 mix-blend-multiply"
                          />
                        </div>
                      </div>

                      {/* Contenido — pega al eje central en AMBOS lados (espejo):
                          el texto-derecha alinea a la izquierda y el texto-izquierda
                          a la derecha, ambos arrancando/terminando en el centro →
                          simétrico al intercalar. Mismo ancho de bloque que la foto
                          (25rem) para que los bordes exteriores coincidan. */}
                      <div
                        className={`relative col-span-12 col-start-1 pl-10 md:col-span-5 md:row-start-1 md:pl-0 ${
                          fotoRight
                            ? "md:col-start-1 md:text-right"
                            : "md:col-start-8 md:text-left"
                        }`}
                      >
                        {/* Número watermark — sangra hacia el borde EXTERIOR */}
                        <span
                          aria-hidden="true"
                          className={`font-display text-azul-principal/[0.05] pointer-events-none absolute -top-20 z-0 select-none text-[9rem] leading-none font-bold tabular-nums md:text-[14rem] ${
                            fotoRight ? "-left-2" : "-right-2"
                          }`}
                        >
                          {paso.n}
                        </span>

                        {/* Bloque de texto de ancho fijo, anclado al eje central. */}
                        <div
                          className={`relative z-10 max-w-[25rem] ${
                            fotoRight ? "md:ml-auto" : "md:mr-auto"
                          }`}
                        >
                          <h2
                            className="font-display text-azul-principal leading-[1.02] font-bold tracking-[-0.022em]"
                            style={{ fontSize: "clamp(2.1rem, 5vw, 3.7rem)" }}
                          >
                            {paso.titulo}
                          </h2>

                          {/* Resumen — verde concepto (frase destacada). Tamaño
                              ajustado para que la más larga ("Toda solución
                              nace de una realidad comprendida") entre en una
                              línea en desktop; text-balance evita cortes feos
                              cuando igual envuelve en mobile. */}
                          <p className="text-verde-concepto mt-4 font-sans text-[1rem] font-semibold leading-snug text-balance md:text-[1.05rem]">
                            {paso.resumen}
                          </p>

                          <p className="text-gris-texto mt-3 font-sans text-[0.97rem] leading-relaxed md:text-[1.02rem]">
                            {paso.detalle}
                          </p>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── CTA · banda propia, centrada → nunca toca el contenido ───── */}
          <div className="relative z-30 flex shrink-0 justify-center px-5 pt-2 pb-10 md:pb-12">
            <Link
              href="/que-hacemos"
              className="group focus-visible:outline-naranja-accion inline-flex items-center gap-3 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              <span className="border-azul-principal/15 text-azul-principal group-hover:border-naranja-accion group-hover:bg-naranja-accion inline-flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-500 group-hover:text-white">
                <ArrowRight
                  size={17}
                  className="transition-transform duration-300 group-hover:translate-x-0.5"
                />
              </span>
              <span className="text-azul-principal group-hover:text-naranja-accion font-sans text-[0.9rem] font-medium tracking-wide transition-colors duration-500">
                Ver cómo trabajamos en detalle
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
