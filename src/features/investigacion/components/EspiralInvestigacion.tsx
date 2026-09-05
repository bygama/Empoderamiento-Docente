"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Highlight } from "@/components/ui/Highlight";
import { ButtonSecondary } from "@/components/ui/ButtonSecondary";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { CINTA } from "../data";
import { ROTULO_MICRO } from "../casos/tintes";
import {
  BISAGRA,
  NODOS,
  PATH_ESPIRAL,
  PATH_LAZO,
  RADIO_NODO,
  RADIO_PERSONAJE,
  VIEWBOX_ESPIRAL,
  rotuloNodo,
} from "./espiral";
import { crearEspiral } from "./coreografia-espiral";

/**
 * Las ocho estaciones de la espiral. Vuelta 1 = ciclo pedagógico (copy
 * según docs/content/arquitectura-investigacion.md §6); vuelta 2 = ciclo
 * de evidencia (§7). Los textos son los canónicos del doc maestro.
 */
type Estacion = { nombre: string; texto: string; destacado?: string };

const VUELTA_1: ReadonlyArray<Estacion> = [
  {
    nombre: "Fase experiencial",
    texto:
      "Las y los participantes viven situaciones que permiten cuestionar sentidos, explorar estrategias y problematizar la matemática escolar desde su propia experiencia.",
    destacado:
      "«Vivir para hacer vivir»: para diseñar nuevos escenarios, el cuerpo docente necesita experimentar otra relación con la matemática.",
  },
  {
    nombre: "Implementación en contexto",
    texto:
      "Las propuestas se interpretan y se llevan a aulas, instituciones o programas reales. No se reproducen mecánicamente: se contextualizan desde el conocimiento profesional de quienes las implementan.",
  },
  {
    nombre: "Práctica reflexiva",
    texto:
      "Se analiza lo ocurrido, se intercambian experiencias, se confrontan decisiones y se observan las respuestas, estrategias y argumentos que produjo la situación.",
  },
  {
    nombre: "Resignificación del conocimiento matemático escolar",
    texto:
      "La experiencia permite revisar sentidos, usos y formas de participación. El conocimiento deja de ser solo un contenido a transmitir: se convierte en una herramienta para comprender y actuar.",
  },
];

const VUELTA_2: ReadonlyArray<Estacion> = [
  {
    nombre: "Registrar evidencias",
    texto:
      "Recuperamos producciones, decisiones, interacciones, resultados y testimonios, siempre con resguardo ético de docentes, estudiantes e instituciones.",
  },
  {
    nombre: "Analizar e interpretar",
    texto:
      "Leemos las evidencias en relación con las preguntas, el contexto y los objetivos. Una cifra aislada no explica por sí sola qué ocurrió ni por qué.",
  },
  {
    nombre: "Sistematizar y producir conocimiento",
    texto:
      "Organizamos aprendizajes, reconocemos patrones y elaboramos explicaciones: la experiencia se convierte en conocimiento que puede comunicarse, discutirse y transferirse.",
  },
  {
    nombre: "Retroalimentar y ajustar",
    texto:
      "Volvemos sobre el diseño, acompañamos nuevas decisiones y abrimos otro ciclo de investigación y acción.",
  },
];

const BISAGRA_TEXTO =
  "La cuarta etapa no cierra el ciclo: abre nuevas preguntas. Por eso volvemos a investigar.";

const REMATE_TEXTO =
  "Implementar es generar una nueva oportunidad para observar, comprender y decidir. La evidencia vuelve al proceso: mejora la intervención y fortalece la capacidad de los equipos.";

const numero = (i: number) => String(i + 1).padStart(2, "0");

/** La espiral doble como dibujo: nodos, personaje, lazo. El SSR la dibuja formada. */
function EspiralSvg({ className = "" }: { className?: string }) {
  return (
    <svg
      data-espiral-svg
      viewBox={`0 0 ${VIEWBOX_ESPIRAL.w} ${VIEWBOX_ESPIRAL.h}`}
      role="img"
      aria-label="Espiral de dos vueltas con ocho estaciones: el ciclo pedagógico y el ciclo de evidencia, unidos por un lazo que vuelve al inicio"
      className={`h-auto w-full overflow-visible ${className}`}
    >
      <path
        data-espiral-path
        d={PATH_ESPIRAL}
        fill="none"
        stroke="var(--color-azul-medio)"
        strokeOpacity="0.55"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        data-espiral-lazo
        d={PATH_LAZO}
        fill="none"
        stroke="var(--color-verde-concepto)"
        strokeOpacity="0.85"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {NODOS.map(([x, y], k) => {
        const [rx, ry] = rotuloNodo(k);
        return (
          <g key={k}>
            <circle
              data-espiral-nodo
              cx={x}
              cy={y}
              r={RADIO_NODO}
              fill={k < BISAGRA ? "var(--color-azul-medio)" : "var(--color-verde-concepto)"}
            />
            <text
              data-espiral-rotulo
              x={rx}
              y={ry}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="var(--color-gris-texto)"
              fontSize="11"
              letterSpacing="0.14em"
              className="font-mono"
            >
              {numero(k)}
            </text>
          </g>
        );
      })}
      {/* El personaje, en el primer nodo (posición SSR = nodo 0). */}
      <g data-espiral-personaje transform={`translate(${NODOS[0][0]} ${NODOS[0][1]})`}>
        <circle r={RADIO_PERSONAJE * 1.9} fill="var(--color-naranja-accion)" opacity="0.16" />
        <circle r={RADIO_PERSONAJE} fill="var(--color-naranja-accion)" />
      </g>
    </svg>
  );
}

function Bloque({
  numeroTexto,
  nombre,
  texto,
  destacado,
  live,
}: Estacion & { numeroTexto: string; live: boolean }) {
  return (
    <div
      data-espiral-bloque={live ? "" : undefined}
      className={live ? "absolute inset-0" : "relative"}
    >
      <span className={`${ROTULO_MICRO} text-gris-texto/80 block tabular-nums`}>
        {numeroTexto}
      </span>
      <h3 className="font-display mt-2 text-[1.35rem] leading-tight font-bold lg:text-[1.55rem]">
        {nombre}
      </h3>
      <p className="mt-3 max-w-[42ch] text-[1rem] leading-[1.65] lg:text-[1.05rem]">{texto}</p>
      {destacado ? (
        <p className="text-azul-principal mt-3 max-w-[42ch] text-[1rem] leading-[1.6] font-medium">
          {destacado}
        </p>
      ) : null}
    </div>
  );
}

function Nota({ texto, live }: { texto: string; live: boolean }) {
  return (
    <div
      data-espiral-bloque={live ? "" : undefined}
      className={live ? "absolute inset-0" : "relative"}
    >
      <p className="font-display max-w-[34ch] text-[1.35rem] leading-[1.4] font-medium lg:text-[1.5rem]">
        {texto}
      </p>
    </div>
  );
}

/**
 * Secciones 4 y 5 — Ciclo de investigación aplicada (`#ciclo`) y Volvemos
 * a investigar (`#evidencia`), en UN solo escenario: la ESPIRAL DOBLE.
 *
 * Los dos ciclos de cuatro pasos se cuentan como una sola figura: la
 * espiral de «Transformar» del hero, agrandada a dos vueltas. El personaje
 * recorre la primera (el ciclo pedagógico); al llegar a la cuarta etapa no
 * se va —«no cierra el ciclo»— y sigue girando por la segunda (la
 * evidencia). Ahí cambia el título: «Implementar no es terminar». Al final
 * un lazo lo devuelve al primer nodo: abrimos otro ciclo. Hoja 03 del
 * archivo, sobre el mismo papel que el hero. Coreografía en
 * coreografia-espiral.ts.
 *
 * Afuera del pin: la cinta navy con producción real de ED y el CTA a
 * Biblioteca. `#evidencia` es un ancla interna que salta a la bisagra.
 * Touch / reduced-motion: las dos listas en flujo con la espiral formada.
 */
export function EspiralInvestigacion() {
  const zonaRef = useRef<HTMLDivElement | null>(null);
  const cintaRef = useRef<HTMLDivElement | null>(null);
  const pieRef = useRef<HTMLDivElement | null>(null);
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

  // La cinta corre mientras está a la vista (loop, no coreografía).
  useIsomorphicLayoutEffect(() => {
    const cinta = cintaRef.current;
    const pie = pieRef.current;
    if (!cinta || !pie || reduced) return;
    const loop = gsap.to(cinta, { xPercent: -50, duration: 28, ease: "none", repeat: -1, paused: true });
    const st = ScrollTrigger.create({
      trigger: pie,
      start: "top bottom",
      end: "bottom top",
      onToggle: (self) => (self.isActive ? loop.play() : loop.pause()),
    });
    return () => {
      st.kill();
      loop.kill();
    };
  }, [reduced]);

  return (
    <section id="ciclo" aria-label="Ciclo de investigación aplicada y evidencia" className="bg-gris-fondo">
      {/* ── La hoja 03: el escenario pinneado. */}
      <div ref={zonaRef} className="p-2.5">
        <div
          className={`ring-azul-principal/10 bg-grain-light text-azul-principal relative isolate overflow-hidden rounded-xl bg-white shadow-[0_24px_60px_-30px_rgb(31_45_77/0.25)] ring-1 ${
            live ? "flex h-[calc(100svh-1.25rem)]" : "min-h-[calc(100svh-1.25rem)]"
          }`}
        >
          <span className="text-gris-texto/70 absolute top-7 right-8 z-10 hidden font-mono text-[0.68rem] tracking-[0.2em] uppercase lg:block">
            Archivo ED · Hoja 03
          </span>

          {live ? (
            <div className="relative z-10 mx-auto my-auto grid w-full max-w-screen-xl items-center gap-x-16 px-6 py-10 md:px-12 lg:grid-cols-[0.95fr_1.05fr]">
              {/* Izquierda: la espiral. */}
              <div className="mx-auto w-full max-w-[min(500px,64svh)]">
                <EspiralSvg />
              </div>

              {/* Derecha: volanta, título y la estación actual (relevos). */}
              <div>
                <div className="relative h-6">
                  <span data-espiral-volanta className="absolute inset-0">
                    <Eyebrow>Ciclo de investigación aplicada</Eyebrow>
                  </span>
                  <span data-espiral-volanta className="absolute inset-0">
                    <Eyebrow>Volvemos a investigar</Eyebrow>
                  </span>
                </div>
                <div className="relative mt-5 min-h-[7.2rem] lg:min-h-[8.4rem]">
                  <h2
                    data-espiral-titulo
                    className="font-display absolute inset-x-0 top-0 max-w-[18ch] font-extrabold tracking-[-0.025em]"
                    style={{ fontSize: "clamp(1.9rem, 0.9rem + 2.2vw, 3rem)", lineHeight: 1.06 }}
                  >
                    Cómo una <Highlight>experiencia</Highlight> se convierte en
                    transformación.
                  </h2>
                  <h2
                    data-espiral-titulo
                    className="font-display absolute inset-x-0 top-0 max-w-[18ch] font-extrabold tracking-[-0.025em]"
                    style={{ fontSize: "clamp(1.9rem, 0.9rem + 2.2vw, 3rem)", lineHeight: 1.06 }}
                  >
                    Implementar no es <Highlight>terminar</Highlight>.
                  </h2>
                </div>
                <div className="relative mt-8 min-h-[15rem] lg:min-h-[16rem]">
                  {VUELTA_1.map((e, i) => (
                    <Bloque key={e.nombre} {...e} numeroTexto={`${numero(i)} / 08`} live />
                  ))}
                  <Nota texto={BISAGRA_TEXTO} live />
                  {VUELTA_2.map((e, i) => (
                    <Bloque
                      key={e.nombre}
                      {...e}
                      numeroTexto={`${numero(i + VUELTA_1.length)} / 08`}
                      live
                    />
                  ))}
                  <Nota texto={REMATE_TEXTO} live />
                </div>
                {/* Ancla interna: Volvemos a investigar vive en la segunda vuelta. */}
                <span id="evidencia" aria-hidden="true" />
              </div>
            </div>
          ) : (
            <div className="relative z-10 mx-auto grid w-full max-w-screen-xl gap-x-16 gap-y-12 px-6 py-20 md:px-12 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="mx-auto w-full max-w-[420px] lg:sticky lg:top-24 lg:self-start">
                <EspiralSvg />
              </div>
              <div className="space-y-16">
                <div>
                  <Eyebrow>Ciclo de investigación aplicada</Eyebrow>
                  <h2 className="font-display mt-5 max-w-[18ch] text-h2 font-extrabold tracking-[-0.02em]">
                    Cómo una <Highlight>experiencia</Highlight> se convierte en
                    transformación.
                  </h2>
                  <ol className="mt-8 space-y-8">
                    {VUELTA_1.map((e, i) => (
                      <li key={e.nombre}>
                        <Bloque {...e} numeroTexto={numero(i)} live={false} />
                      </li>
                    ))}
                  </ol>
                  <p className="font-display mt-8 max-w-[34ch] text-[1.25rem] leading-[1.4] font-medium">
                    {BISAGRA_TEXTO}
                  </p>
                </div>
                <div id="evidencia">
                  <Eyebrow>Volvemos a investigar</Eyebrow>
                  <h2 className="font-display mt-5 max-w-[18ch] text-h2 font-extrabold tracking-[-0.02em]">
                    Implementar no es <Highlight>terminar</Highlight>.
                  </h2>
                  <p className="mt-5 max-w-[42ch] text-body">{REMATE_TEXTO}</p>
                  <ol className="mt-8 space-y-8">
                    {VUELTA_2.map((e, i) => (
                      <li key={e.nombre}>
                        <Bloque {...e} numeroTexto={numero(i + VUELTA_1.length)} live={false} />
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Pie, fuera del pin: la cinta con producción real y el CTA. */}
      <div ref={pieRef}>
        <div className="bg-azul-principal mx-2.5 mt-2.5 overflow-hidden rounded-xl py-3.5" aria-label="Producción reciente">
          <div ref={cintaRef} className="flex w-max gap-10 whitespace-nowrap will-change-transform">
            {[0, 1].map((copia) => (
              <div key={copia} aria-hidden={copia === 1 || undefined} className="flex gap-10">
                {CINTA.map((item) => (
                  <span
                    key={item}
                    className="text-azul-claro/90 flex items-center gap-10 font-mono text-[0.72rem] tracking-[0.16em] uppercase"
                  >
                    {item}
                    <span className="bg-verde-concepto inline-block h-1.5 w-1.5 rounded-full" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="mx-auto flex w-full max-w-screen-xl flex-wrap items-center justify-between gap-6 px-6 pt-10 pb-14 md:px-12">
          <p className="text-azul-principal/85 max-w-[46ch] text-[1rem] leading-[1.6]">
            Lo que la espiral produce se publica: artículos, capítulos, libros y
            materiales que vuelven al aula.
          </p>
          <ButtonSecondary href="/biblioteca" withArrow>
            Conocé lo que publicamos
          </ButtonSecondary>
        </div>
      </div>
    </section>
  );
}
