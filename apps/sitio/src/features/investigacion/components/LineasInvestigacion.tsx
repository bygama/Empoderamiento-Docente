"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ButtonSecondary } from "@/components/ui/ButtonSecondary";
import { Highlight } from "@/components/ui/Highlight";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { alClicIrA } from "@/lib/navegar";
import { alClicVerCaso } from "../casos/abrir-caso";
import { ClipPapel, FlechaManuscrita, Pestana, SubrayadoMarcador } from "../casos/Garabatos";
import { PuntosCampo } from "./PuntosCampo";
import { ROTULO_MICRO, ROTULO_TAB } from "../casos/tintes";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Taxonomía de 6 líneas del doc maestro, en su orden canónico (SÍNTESIS —
 * nombres oficiales en VALIDAR con ED antes del lanzamiento; después,
 * reconciliar el puente de Biblioteca con esta taxonomía). Preguntas
 * literales de docs/content/arquitectura-investigacion.md §5. Solo nombre
 * y pregunta: la protagonista es la pregunta (decisión 2026-09-14: menos
 * es más; los «incluye», la síntesis «buscamos» y el botón por línea se
 * fueron). `clave` es la frase de la pregunta que el marcador subraya, el
 * mismo recurso que usa la espiral en cada etapa: no toca el copy.
 * `caso` es el slug del caso del archivo (casos/data.ts) que la muestra en
 * acción: «Ver en acción» desliza hasta la pila y abre ese expediente. El
 * cruce línea → caso es editorial (Facundo, 2026-09-14) y hay que validarlo
 * con ED.
 */
const LINEAS: ReadonlyArray<{ nombre: string; pregunta: string; clave: string; caso: string }> = [
  {
    nombre: "Empoderamiento y desarrollo profesional docente",
    pregunta:
      "¿Cómo se transforma la relación de las y los docentes con el saber y qué condiciones fortalecen su autonomía y capacidad de acción?",
    clave: "capacidad de acción",
    caso: "oaxaca-transformacion-colectiva",
  },
  {
    nombre: "Socioepistemología y construcción social del conocimiento matemático",
    pregunta:
      "¿Cómo se construye, usa y resignifica el conocimiento matemático en prácticas sociales y contextos educativos?",
    clave: "resignifica",
    caso: "resignificacion-escuelas-tecnicas",
  },
  {
    nombre: "Discurso y problematización de la matemática escolar",
    pregunta:
      "¿Qué formas de presentar la matemática se han naturalizado y cómo pueden revisarse para ampliar sentidos, estrategias y posibilidades de aprendizaje?",
    clave: "se han naturalizado",
    caso: "oaxaca-transformacion-colectiva",
  },
  {
    nombre: "Desarrollo y funcionalidad del pensamiento matemático",
    pregunta:
      "¿Cómo pueden los contenidos escolares convertirse en herramientas para decidir, argumentar, interpretar información y actuar en el mundo?",
    clave: "herramientas para decidir",
    caso: "contenido-curricular-herramienta-pensamiento",
  },
  {
    nombre: "Escenarios, currículum y recursos para el aprendizaje",
    pregunta:
      "¿Qué condiciones, tareas, currículas y materiales habilitan participación, múltiples estrategias, debate y construcción de sentido?",
    clave: "construcción de sentido",
    caso: "contenido-curricular-herramienta-pensamiento",
  },
  {
    nombre: "Evidencia, evaluación y mejora educativa",
    pregunta:
      "¿Qué evidencias permiten comprender una intervención, interpretar sus efectos y tomar mejores decisiones sin reducir el aprendizaje a una cifra?",
    clave: "a una cifra",
    caso: "evaluacion-mas-alla-del-puntaje",
  },
];

/**
 * La mesa de trabajo: seis papeles sobre la carpeta, de TRES materiales que
 * rotan (hoja con clip, nota adhesiva con cinta, ficha de archivo), cada
 * uno dos veces y nunca dos iguales seguidos, apoyados con un giro leve
 * alternado. La variedad es material, no de contenido: la pregunta va
 * siempre en Manrope, al mismo tamaño; el manuscrito queda para las
 * anotaciones (el número de las fichas, la flecha de las notas) y el
 * marcador subraya la clave. Si se sacan los papeles, la información es
 * idéntica.
 */
const MATERIALES = ["hoja", "nota", "ficha"] as const;
const GIROS = [
  "lg:-rotate-[0.8deg]",
  "lg:rotate-[0.6deg]",
  "lg:-rotate-[0.5deg]",
  "lg:rotate-[0.7deg]",
  "lg:-rotate-[0.6deg]",
  "lg:rotate-[0.5deg]",
] as const;

/** Cinta adhesiva translúcida, como la de las láminas de los casos. */
function Cinta({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute h-6 w-20 border border-white/70 bg-white/35 shadow-sm ${className}`}
    />
  );
}

/** La pregunta con su clave subrayada a marcador (doble pasada, temblor humano). */
function Pregunta({ texto, clave }: { texto: string; clave: string }) {
  const donde = texto.indexOf(clave);
  if (donde < 0) return <>{texto}</>;
  return (
    <>
      {texto.slice(0, donde)}
      <span className="relative whitespace-nowrap">
        {clave}
        <SubrayadoMarcador className="text-verde-concepto pointer-events-none absolute inset-x-0 -bottom-[0.18em] h-[0.5em] w-full" />
      </span>
      {texto.slice(donde + clave.length)}
    </>
  );
}

/** Un papel de la mesa: el material cambia, la pregunta no. */
function Papel({ linea, indice }: { linea: (typeof LINEAS)[number]; indice: number }) {
  const material = MATERIALES[indice % 3];
  const numero = String(indice + 1).padStart(2, "0");
  // Tres tonos que se distinguen entre sí y de la carpeta (que es
  // azul-claro): la hoja blanca, la nota en un azul más claro que la carpeta
  // y la ficha en el gris del sitio, con borde.
  const superficie = {
    hoja: "bg-white bg-grain-light rounded-[4px] pt-9",
    nota: "bg-[color-mix(in_srgb,var(--color-azul-claro)_42%,white)] bg-grain-light rounded-[3px] pt-10",
    ficha: "bg-gris-fondo bg-grain-light rounded-[2px] border border-azul-principal/15 pt-8",
  }[material];
  return (
    <li
      data-linea
      className={`text-azul-principal relative px-7 pb-7 shadow-[0_22px_50px_-26px_rgb(31_45_77/0.55),0_2px_6px_-2px_rgb(31_45_77/0.2)] lg:px-8 ${superficie} ${GIROS[indice] ?? ""}`}
    >
      {material === "hoja" && (
        <ClipPapel className="text-azul-principal/45 absolute -top-3 right-7 h-11 w-6" />
      )}
      {material === "nota" && <Cinta className="-top-3 left-1/2 -translate-x-1/2 -rotate-3" />}

      {/* Número: mono en la hoja y la nota; a mano en la ficha (la única
          anotación manuscrita de ese papel). */}
      {material === "ficha" ? (
        <span aria-hidden="true" className="font-hand text-azul-medio absolute top-3 right-6 text-[2rem] leading-none">
          {numero}
        </span>
      ) : null}
      <div className="flex items-center gap-3">
        <span
          className={`font-display text-verde-concepto-texto text-[1.05rem] font-bold tabular-nums ${material === "ficha" ? "sr-only" : ""}`}
        >
          {numero}
        </span>
        <span className={`${ROTULO_MICRO} text-gris-texto/80`}>{linea.nombre}</span>
      </div>
      <h3 className="font-display mt-4 text-[1.32rem] leading-[1.24] font-bold tracking-[-0.015em] text-balance lg:text-[1.42rem]">
        {material === "nota" && (
          <FlechaManuscrita className="text-verde-concepto float-left mt-1 mr-2 h-5 w-8 rotate-[12deg]" />
        )}
        <Pregunta texto={linea.pregunta} clave={linea.clave} />
      </h3>
      {/* Al caso que la muestra en acción: en la misma página desliza hasta
          la pila y abre el expediente (abrir-caso.ts); el href es el link
          directo del caso, por si se abre en otra pestaña. */}
      <Link
        href={`#${linea.caso}`}
        onClick={alClicVerCaso(linea.caso)}
        aria-label={`Ver en acción: ${linea.nombre}`}
        className="group text-azul-principal hover:bg-azul-principal focus-visible:outline-verde-concepto mt-5 inline-flex items-center gap-2 rounded-full border border-current px-3 py-1.5 text-[0.78rem] font-medium transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        Ver en acción
        <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none">
          →
        </span>
      </Link>
    </li>
  );
}

/** Inclinación de la carpeta al entrar y al salir (grados, sentido de la referencia). */
const INCLINACION = -5;

/** Puntas de papel asomando por la boca de la carpeta (mal guardadas). */
const PAPELES = [
  "left-[42%] -top-[9px] h-4 w-24 rotate-[0.6deg] bg-white/95",
  "left-[54%] -top-[6px] h-3.5 w-14 -rotate-[1deg] bg-white/75",
  "left-[70%] -top-[8px] h-4 w-28 rotate-[0.3deg] bg-white/90",
] as const;

/**
 * Sección 3 — Líneas de investigación (`#lineas`): UNA CARPETA A PANTALLA
 * COMPLETA, la Hoja 02 del archivo, con la lista de las seis preguntas.
 *
 * Seis papeles sobre la carpeta (ver MATERIALES): número, nombre de la
 * línea chico y la pregunta grande, en el orden del doc maestro. Nada más
 * que leer, y un solo CTA al pie hacia los casos («Mirá la investigación
 * en acción», el de la arquitectura editorial).
 *
 * Como en la referencia, la carpeta ocupa toda la pantalla y lleva su
 * título adentro, con aire. Entra inclinada sobre el navy de la sección
 * anterior y se asienta al centrarse (scrub corto ligado a su entrada, sin
 * pin); las filas se revelan en cascada al llegar. Touch / reduced-motion:
 * carpeta plana y filas quietas.
 */
export function LineasInvestigacion() {
  const zonaRef = useRef<HTMLElement | null>(null);
  const carpetaRef = useRef<HTMLDivElement | null>(null);
  const listaRef = useRef<HTMLOListElement | null>(null);
  const reduced = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    if (reduced) return;
    if (!window.matchMedia("(hover: hover) and (min-width: 64rem)").matches)
      return;
    const zona = zonaRef.current;
    const carpeta = carpetaRef.current;
    const lista = listaRef.current;
    if (!zona || !carpeta || !lista) return;
    const ctx = gsap.context(() => {
      // El hint acompaña al giro por scroll y se va con el contexto.
      gsap.set(carpeta, { willChange: "transform" });
      // La regla de la referencia: la carpeta está derecha solo cuando está
      // CENTRADA en la ventana. Viene inclinada, se aplana al llegar al
      // medio y se vuelve a inclinar (mismo ángulo, mismo sentido) al irse.
      // El tramo "top bottom → bottom top" tiene su mitad exacta cuando el
      // centro de la carpeta pasa por el centro de la ventana. Pivote en el
      // centro para que al girar no se desplace.
      const tl = gsap.timeline({
        defaults: { transformOrigin: "50% 50%" },
        scrollTrigger: {
          trigger: carpeta,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
      tl.fromTo(
        carpeta,
        { rotation: INCLINACION },
        { rotation: 0, duration: 0.42, ease: "power2.out", immediateRender: false },
        0,
      );
      tl.to(carpeta, { rotation: INCLINACION, duration: 0.42, ease: "power2.in" }, 0.58);

      // Las filas se revelan en cascada, una vez, cuando la lista llega.
      gsap.fromTo(
        lista.querySelectorAll("[data-linea]"),
        { autoAlpha: 0, y: 18 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: { trigger: lista, start: "top 78%", once: true },
        },
      );
    }, zona);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      ref={zonaRef}
      id="lineas"
      data-indice="Líneas de investigación"
      aria-label="Líneas de investigación"
      // isolate: el grano mezcla adentro. El clip recorta a los costados y
      // por abajo (la carpeta que sale inclinada se mete bajo la sección
      // siguiente en vez de colgar sobre su hoja) y deja el tope abierto
      // para no cortar la esquina que se levanta al entrar. overflow-x-clip:
      // el clip-path esconde lo pintado pero NO saca la carpeta de 120vw del
      // área de scroll (la página tenía scroll horizontal).
      className="bg-azul-principal bg-grain-dark relative isolate overflow-x-clip pt-24 [clip-path:inset(-100vh_0_0)]"
    >
      {/* El campo navy de la sección anterior sigue acá: mismo grain y misma
          grilla de puntos, que asoma en el respiro de arriba y en las cuñas
          que deja la carpeta al entrar inclinada. */}
      <PuntosCampo anclaje="arriba" />
      {/* Piso de la sección: la carpeta sale inclinada y deja una cuña a la
          derecha. Ahí tiene que verse lo que sigue (gris-fondo), no el navy:
          la carpeta se apoya sobre la sección de abajo. */}
      <span
        aria-hidden="true"
        className="bg-gris-fondo pointer-events-none absolute inset-x-0 bottom-0 h-[6vw]"
      />

      {/* La carpeta: más ancha que el viewport (120vw) para que, inclinada,
          no deje huecos en los costados; en mobile va al ancho justo. */}
      <div
        ref={carpetaRef}
        data-lineas-carpeta
        className="bg-azul-claro bg-grain-light relative z-10 w-full shadow-[0_-28px_70px_-30px_rgb(0_0_0/0.65)] lg:-ml-[10vw] lg:w-[120vw]"
      >
        {/* Pestaña troquelada, grande como en la referencia. */}
        <span
          aria-hidden="true"
          className="text-azul-claro absolute -top-12 left-[4vw] z-0 block h-12 w-[22rem] lg:-top-14 lg:left-[13vw] lg:h-14 lg:w-[26rem]"
        >
          <Pestana className="h-full w-full">
            <span className={`${ROTULO_TAB} text-azul-principal whitespace-nowrap`}>
              02 · Líneas de investigación
            </span>
          </Pestana>
        </span>

        {/* Papeles mal guardados asomando por la boca. */}
        {PAPELES.map((clases) => (
          <span
            key={clases}
            aria-hidden="true"
            className={`pointer-events-none absolute z-0 block rounded-t-[3px] shadow-[0_-2px_5px_-2px_rgb(31_45_77/0.4)] ${clases}`}
          />
        ))}

        {/* Canto iluminado de la tapa. */}
        <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-white/40" />

        {/* Contenido: dentro del viewport (en desktop compensa el ancho extra). */}
        <div className="relative px-6 pt-28 pb-24 md:px-10 lg:mx-[10vw] lg:pt-32 lg:pb-28">
          {/* Número fantasma: rotulación de archivo. */}
          <span
            aria-hidden="true"
            className="font-display text-azul-principal/[0.08] pointer-events-none absolute top-10 left-6 text-[8rem] leading-none font-extrabold tracking-tight select-none md:left-10 lg:top-12 lg:text-[10rem]"
          >
            02
          </span>

          {/* Folio de archivo: número de hoja + nombre de la sección en el
              sitemap, como en todas las hojas de la página. */}
          <span
            aria-hidden="true"
            className={`${ROTULO_MICRO} text-azul-principal/60 border-azul-principal/40 absolute top-14 right-6 hidden rotate-[-4deg] rounded-[3px] border px-3 py-1.5 md:right-10 lg:block`}
          >
            ARCHIVO ED · HOJA 02 · LÍNEAS DE INVESTIGACIÓN
          </span>

          <div className="text-azul-principal relative mx-auto max-w-screen-xl">
            {/* Encabezado adentro de la carpeta, centrado. */}
            <div className="flex flex-col items-center text-center">
              <span className="text-azul-principal/75 inline-flex items-end gap-3">
                <span className="border-azul-principal/60 font-display border-b-2 pb-0.5 text-[0.95rem] font-medium tracking-wide uppercase">
                  No son servicios. Son preguntas.
                </span>
                <FlechaManuscrita className="text-verde-concepto h-6 w-12 shrink-0 rotate-[40deg]" />
              </span>
              <h2
                className="font-display mt-5 font-extrabold tracking-[-0.02em] text-balance"
                style={{ fontSize: "clamp(1.7rem, 0.9rem + 1.7vw, 2.6rem)", lineHeight: 1.12 }}
              >
                Qué <Highlight>estudiamos</Highlight> y qué buscamos comprender.
              </h2>
              <p className={`${ROTULO_MICRO} text-azul-principal/70 mt-4 uppercase`}>
                Los grandes temas que estudia ED
              </p>
            </div>

            {/* La mesa: seis papeles en dos columnas, la pregunta como
                protagonista. Se lee en zigzag, como una lista. */}
            <ol ref={listaRef} className="mt-14 grid items-start gap-x-8 gap-y-10 lg:mt-16 lg:grid-cols-2 lg:gap-y-12">
              {LINEAS.map((linea, i) => (
                <Papel key={linea.nombre} linea={linea} indice={i} />
              ))}
            </ol>

            {/* Un solo CTA: mirar de cerca una línea es ir a ver dónde se
                investiga. */}
            <div className="mt-12 flex justify-center lg:mt-14">
              <ButtonSecondary href="#en-accion" withArrow onClick={alClicIrA("en-accion")}>
                Mirá la investigación en acción
              </ButtonSecondary>
            </div>
          </div>

          {/* Marca seca ED en la base. */}
          <Image
            src="/brand/logotipo-principal-ed.png"
            alt=""
            aria-hidden="true"
            width={395}
            height={433}
            className="pointer-events-none absolute right-6 bottom-8 h-12 w-auto opacity-[0.16] select-none md:right-10 lg:bottom-10 lg:h-14"
          />
        </div>
      </div>
    </section>
  );
}
