"use client";

import { useId, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Highlight } from "@/components/ui/Highlight";
import { ButtonSecondary } from "@/components/ui/ButtonSecondary";
import { ChevronDown } from "@/components/ui/icons";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { ClipPapel, Pestana } from "../casos/Garabatos";
import { ROTULO_MICRO, ROTULO_TAB } from "../casos/tintes";
import { FiguraConstelacion } from "./FiguraConstelacion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Taxonomía de 6 líneas del doc maestro (SÍNTESIS — nombres oficiales en
 * VALIDAR con ED antes del lanzamiento; después, reconciliar el puente de
 * Biblioteca con esta taxonomía). «Incluye» según
 * docs/content/arquitectura-investigacion.md §5.
 */
const LINEAS = [
  {
    nombre: "Empoderamiento y desarrollo profesional docente",
    pregunta:
      "¿Cómo se transforma la relación de las y los docentes con el saber y qué condiciones fortalecen su autonomía y capacidad de acción?",
    incluye: [
      "liderazgo",
      "comunidades de aprendizaje",
      "reflexión sobre la práctica",
      "desarrollo profesional sostenido",
      "toma de decisiones",
      "adaptación de situaciones",
    ],
  },
  {
    nombre:
      "Socioepistemología y construcción social del conocimiento matemático",
    pregunta:
      "¿Cómo se construye, usa y resignifica el conocimiento matemático en prácticas sociales y contextos educativos?",
    incluye: [
      "prácticas sociales",
      "contextos de significación",
      "matemática y realidad",
      "construcción social del conocimiento",
      "exclusión y participación",
    ],
  },
  {
    nombre: "Discurso y problematización de la matemática escolar",
    pregunta:
      "¿Qué formas de presentar la matemática se han naturalizado y cómo pueden revisarse para ampliar sentidos, estrategias y posibilidades de aprendizaje?",
    incluye: [
      "discurso matemático escolar",
      "libros de texto",
      "tareas",
      "proporcionalidad",
      "lenguaje simbólico",
      "errores",
      "argumentación",
      "resignificación del saber",
    ],
  },
  {
    nombre: "Desarrollo y funcionalidad del pensamiento matemático",
    pregunta:
      "¿Cómo pueden los contenidos escolares convertirse en herramientas para decidir, argumentar, interpretar información y actuar en el mundo?",
    incluye: [
      "estrategias",
      "algoritmos",
      "razonamiento",
      "toma de decisiones",
      "inferencia",
      "medición",
      "visualización",
      "predicción",
      "ciudadanía",
    ],
  },
  {
    nombre: "Escenarios, currículum y recursos para el aprendizaje",
    pregunta:
      "¿Qué condiciones, tareas, currículas y materiales habilitan participación, múltiples estrategias, debate y construcción de sentido?",
    incluye: [
      "situaciones de aprendizaje",
      "diseño curricular",
      "materiales",
      "tareas disruptivas",
      "voz estudiantil",
      "diálogo",
      "tecnología pertinente",
    ],
  },
  {
    nombre: "Evidencia, evaluación y mejora educativa",
    pregunta:
      "¿Qué evidencias permiten comprender una intervención, interpretar sus efectos y tomar mejores decisiones sin reducir el aprendizaje a una cifra?",
    incluye: [
      "diseño de instrumentos",
      "análisis de resultados",
      "evaluación educativa",
      "estudios de impacto",
      "sistematización",
      "mejora continua",
    ],
  },
] as const;

/**
 * Sección 3 — Líneas de investigación (`#lineas`): LA CARPETA.
 *
 * Costura con la carta: sobre el mismo navy, una carpeta manila (azul
 * claro, con pestaña troquelada) entra INCLINADA desde abajo y se asienta
 * plana a medida que llega — el gesto de la referencia (la carpeta que tapa
 * la noche), sin pin: un scrub corto ligado a la entrada de la sección.
 * Adentro, la hoja blanca con clip: título grande fijo a la izquierda con
 * la lupa («Mirar de cerca», la figura de esta sección) y, a la derecha,
 * las seis líneas como filas con regla punteada. Nombre y pregunta siempre
 * visibles; «incluye» como chips al abrir. Una fila abierta por vez.
 *
 * El punto naranja —el personaje— deja la lupa para marcar la fila abierta
 * y vuelve a la figura cuando se cierra.
 *
 * Touch / reduced-motion: carpeta plana desde el principio (el acordeón
 * funciona igual).
 */
export function LineasInvestigacion() {
  const zonaRef = useRef<HTMLElement | null>(null);
  const carpetaRef = useRef<HTMLDivElement | null>(null);
  const listaRef = useRef<HTMLOListElement | null>(null);
  const filasRef = useRef<(HTMLLIElement | null)[]>([]);
  const reduced = useReducedMotion();
  const [abierta, setAbierta] = useState<number | null>(null);
  const [marcaTop, setMarcaTop] = useState<number | null>(null);
  const baseId = useId();

  // ── La costura: la carpeta entra inclinada y se asienta con el scroll.
  useIsomorphicLayoutEffect(() => {
    if (reduced) return;
    if (!window.matchMedia("(hover: hover) and (min-width: 64rem)").matches)
      return;
    const zona = zonaRef.current;
    const carpeta = carpetaRef.current;
    if (!zona || !carpeta) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        carpeta,
        { rotation: -4.5, y: 110, transformOrigin: "50% 100%" },
        {
          rotation: 0,
          y: 0,
          ease: "none",
          scrollTrigger: {
            trigger: zona,
            start: "top bottom",
            end: "top 12%",
            scrub: true,
            invalidateOnRefresh: true,
          },
        },
      );
    }, zona);
    return () => ctx.revert();
  }, [reduced]);

  // ── El personaje se posa junto a la fila abierta (medido en layout).
  useIsomorphicLayoutEffect(() => {
    if (abierta === null) {
      setMarcaTop(null);
      return;
    }
    const li = filasRef.current[abierta];
    if (!li) return;
    // Alineado con el número de la fila (padding superior del botón).
    setMarcaTop(li.offsetTop + 34);
  }, [abierta]);

  return (
    <section
      ref={zonaRef}
      id="lineas"
      aria-label="Líneas de investigación"
      className="bg-azul-principal overflow-x-clip px-2.5 pt-16 pb-2.5"
    >
      {/* ── La carpeta manila con su pestaña. */}
      <div
        ref={carpetaRef}
        data-lineas-carpeta
        className="bg-azul-claro bg-grain-light relative mx-auto max-w-[110rem] rounded-xl p-3 shadow-[0_-24px_60px_-30px_rgb(0_0_0/0.6)] will-change-transform"
      >
        <span
          aria-hidden="true"
          className="text-azul-claro absolute -top-10 left-[3%] z-0 block h-10 w-[21rem] lg:-top-11 lg:h-11"
        >
          <Pestana className="h-full w-full">
            <span className={`${ROTULO_TAB} text-azul-principal whitespace-nowrap`}>
              LÍNEAS DE INVESTIGACIÓN
            </span>
          </Pestana>
        </span>

        {/* ── La hoja. */}
        <div className="bg-grain-light text-azul-principal relative rounded-lg bg-white px-8 py-14 lg:px-16 lg:py-20">
          <ClipPapel
            className="text-azul-principal/40 absolute -top-3 right-14 hidden h-12 w-7 lg:block"
          />

          <div className="mx-auto grid max-w-screen-xl gap-x-16 gap-y-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
            {/* ── Izquierda: título grande fijo + la lupa + CTA. */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <Eyebrow>Líneas de investigación</Eyebrow>
              <h2
                className="font-display mt-6 max-w-[12ch] font-extrabold tracking-[-0.025em]"
                style={{ fontSize: "clamp(2.2rem, 1rem + 3vw, 3.8rem)", lineHeight: 1.04 }}
              >
                Qué <Highlight>estudiamos</Highlight> y qué buscamos
                comprender.
              </h2>
              <p className="mt-6 max-w-[38ch] text-[1.02rem] leading-[1.7] lg:text-[1.08rem]">
                Estas líneas no describen servicios: describen preguntas. Son
                los grandes temas que investigamos y los que sostienen, por
                debajo, cada intervención que diseñamos y acompañamos.
              </p>

              <div className="mt-10 flex items-end gap-6">
                <FiguraConstelacion
                  id="lupa"
                  personajeVisible={abierta === null}
                  className="w-28 shrink-0 lg:w-32"
                />
                <span className={`text-gris-texto/80 mb-2 block ${ROTULO_MICRO} uppercase`}>
                  02 / 04 · Mirar de cerca
                </span>
              </div>

              <div className="mt-10">
                <ButtonSecondary href="#en-accion" withArrow>
                  Mirá la investigación en acción
                </ButtonSecondary>
              </div>
            </div>

            {/* ── Derecha: las seis líneas, filas con regla punteada. */}
            <ol ref={listaRef} className="relative">
              {/* El personaje, posado junto a la fila abierta. */}
              <span
                aria-hidden="true"
                data-lineas-personaje
                className="bg-naranja-accion absolute -left-6 h-3 w-3 rounded-full transition-[top,opacity,transform] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
                style={{
                  top: marcaTop ?? 0,
                  opacity: marcaTop === null ? 0 : 1,
                  transform: marcaTop === null ? "scale(0)" : "scale(1)",
                }}
              />
              {LINEAS.map((linea, i) => {
                const estaAbierta = abierta === i;
                const panelId = `${baseId}-panel-${i}`;
                return (
                  <li
                    key={linea.nombre}
                    ref={(el) => {
                      filasRef.current[i] = el;
                    }}
                    className="border-azul-principal/25 border-b border-dashed first:border-t"
                  >
                    <button
                      type="button"
                      aria-expanded={estaAbierta}
                      aria-controls={panelId}
                      onClick={() => setAbierta(estaAbierta ? null : i)}
                      className="group focus-visible:outline-verde-concepto grid w-full grid-cols-[2.75rem_minmax(0,1fr)_2rem] items-start gap-x-4 py-7 text-left focus-visible:outline-2 focus-visible:outline-offset-4"
                    >
                      <span className={`${ROTULO_MICRO} text-gris-texto/80 pt-1.5 tabular-nums`}>
                        0{i + 1}
                      </span>
                      <span>
                        <span className="font-display group-hover:text-azul-medio block text-[1.2rem] leading-tight font-bold transition-colors lg:text-[1.3rem]">
                          {linea.nombre}
                        </span>
                        <span className="text-azul-principal/85 mt-2.5 block text-[0.98rem] leading-[1.6]">
                          {linea.pregunta}
                        </span>
                      </span>
                      <span
                        className={`text-azul-principal/70 mt-1 flex h-7 w-7 items-center justify-center rounded-full border border-current transition-transform duration-500 ${
                          estaAbierta ? "rotate-180" : ""
                        }`}
                      >
                        <ChevronDown size={14} />
                      </span>
                    </button>
                    <div
                      id={panelId}
                      role="region"
                      aria-hidden={!estaAbierta}
                      className="grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
                      style={{ gridTemplateRows: estaAbierta ? "1fr" : "0fr" }}
                    >
                      <div className="min-h-0 overflow-hidden">
                        <div className="flex flex-wrap items-center gap-2 pb-7 pl-[3.75rem]">
                          <span className={`${ROTULO_MICRO} text-gris-texto/80 mr-2 uppercase`}>
                            Incluye
                          </span>
                          {linea.incluye.map((chip) => (
                            <span
                              key={chip}
                              className="border-azul-medio/40 text-azul-principal rounded-full border px-3 py-1 text-[0.82rem] leading-none"
                            >
                              {chip}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
