"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Highlight } from "@/components/ui/Highlight";
import { Search } from "@/components/ui/icons";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { ClipPapel, FlechaManuscrita, Pestana } from "../casos/Garabatos";
import { PuntosCampo } from "./PuntosCampo";
import { ROTULO_MICRO, ROTULO_TAB } from "../casos/tintes";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Taxonomía de 6 líneas del doc maestro (SÍNTESIS — nombres oficiales en
 * VALIDAR con ED antes del lanzamiento; después, reconciliar el puente de
 * Biblioteca con esta taxonomía). Preguntas literales de
 * docs/content/arquitectura-investigacion.md §5; «buscamos» es la síntesis
 * de una línea de cada pregunta; «temas» son tres de los «incluye».
 *
 * Se reparten en dos carpetas con un criterio editorial: las preguntas
 * sobre EL SABER (el conocimiento matemático) y las preguntas sobre LA
 * PRÁCTICA (docentes, escenarios, evidencia). Conocer y transformar.
 */
type Linea = {
  nombre: string;
  pregunta: string;
  buscamos: string;
  temas: readonly [string, string, string];
};

type Carpeta = {
  numero: string;
  rotulo: string;
  /** Anotación manuscrita sobre el título (la instrucción de lectura). */
  anotacion: string;
  /** Título grande adentro de la carpeta (la 01 usa el H2 de la sección). */
  titulo: string;
  /** Rótulo mono bajo el título. */
  subtitulo: string;
  sujecion: "clip" | "cinta";
  lineas: readonly Linea[];
};

const CARPETAS: readonly Carpeta[] = [
  {
    numero: "01",
    rotulo: "EL SABER",
    anotacion: "No son servicios. Son preguntas.",
    titulo: "Qué estudiamos y qué buscamos comprender.",
    subtitulo: "Preguntas sobre el conocimiento",
    sujecion: "clip",
    lineas: [
      {
        nombre: "Socioepistemología y construcción social del conocimiento matemático",
        pregunta:
          "¿Cómo se construye, usa y resignifica el conocimiento matemático en prácticas sociales y contextos educativos?",
        buscamos:
          "cómo el conocimiento matemático toma sentido en las prácticas de quienes lo usan.",
        temas: ["prácticas sociales", "matemática y realidad", "exclusión y participación"],
      },
      {
        nombre: "Discurso y problematización de la matemática escolar",
        pregunta:
          "¿Qué formas de presentar la matemática se han naturalizado y cómo pueden revisarse para ampliar sentidos, estrategias y posibilidades de aprendizaje?",
        buscamos:
          "qué se da por sentado en la matemática escolar y qué se abre al revisarlo.",
        temas: ["libros de texto", "tareas", "argumentación"],
      },
      {
        nombre: "Desarrollo y funcionalidad del pensamiento matemático",
        pregunta:
          "¿Cómo pueden los contenidos escolares convertirse en herramientas para decidir, argumentar, interpretar información y actuar en el mundo?",
        buscamos:
          "cómo los contenidos se vuelven herramientas para pensar y decidir.",
        temas: ["estrategias", "toma de decisiones", "ciudadanía"],
      },
    ],
  },
  {
    numero: "02",
    rotulo: "LA PRÁCTICA",
    anotacion: "Y en la práctica",
    titulo: "Qué preguntamos sobre las condiciones y las personas.",
    subtitulo: "Segunda carpeta del mismo cajón",
    sujecion: "cinta",
    lineas: [
      {
        nombre: "Empoderamiento y desarrollo profesional docente",
        pregunta:
          "¿Cómo se transforma la relación de las y los docentes con el saber y qué condiciones fortalecen su autonomía y capacidad de acción?",
        buscamos:
          "cómo una comunidad docente gana autonomía para decidir sobre su práctica.",
        temas: ["liderazgo", "comunidades de aprendizaje", "reflexión sobre la práctica"],
      },
      {
        nombre: "Escenarios, currículum y recursos para el aprendizaje",
        pregunta:
          "¿Qué condiciones, tareas, currículas y materiales habilitan participación, múltiples estrategias, debate y construcción de sentido?",
        buscamos:
          "qué condiciones y materiales habilitan participación y debate en el aula.",
        temas: ["situaciones de aprendizaje", "tareas disruptivas", "voz estudiantil"],
      },
      {
        nombre: "Evidencia, evaluación y mejora educativa",
        pregunta:
          "¿Qué evidencias permiten comprender una intervención, interpretar sus efectos y tomar mejores decisiones sin reducir el aprendizaje a una cifra?",
        buscamos:
          "qué evidencia explica una intervención más allá de una cifra.",
        temas: ["diseño de instrumentos", "estudios de impacto", "sistematización"],
      },
    ],
  },
];

/** Inclinación de la carpeta al entrar y al salir (grados, sentido de la referencia). */
const INCLINACION = -5;

/** Las hojas puestas a mano: giro y aire distinto por columna. */
const HOJA_POSE = [
  "lg:-rotate-[0.9deg] lg:mt-3",
  "lg:rotate-[0.5deg]",
  "lg:-rotate-[0.4deg] lg:mt-6",
] as const;

/** Puntas de papel asomando por la boca de cada carpeta (mal guardadas). */
const PAPELES: readonly (readonly string[])[] = [
  [
    "left-[42%] -top-[9px] h-4 w-24 rotate-[0.6deg] bg-white/95",
    "left-[54%] -top-[6px] h-3.5 w-14 -rotate-[1deg] bg-white/75",
    "left-[70%] -top-[8px] h-4 w-28 rotate-[0.3deg] bg-white/90",
  ],
  [
    "left-[50%] -top-[8px] h-4 w-20 -rotate-[0.7deg] bg-white/95",
    "left-[63%] -top-[6px] h-3.5 w-24 rotate-[0.9deg] bg-white/80",
    "left-[78%] -top-[9px] h-4 w-16 -rotate-[0.4deg] bg-white/90",
  ],
];

/** Cinta adhesiva en la esquina (sujeción de la carpeta 02). */
function Cinta({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`bg-azul-claro/70 pointer-events-none absolute block h-6 w-20 rotate-[-38deg] shadow-[0_1px_2px_rgb(31_45_77/0.15)] ${className}`}
      style={{
        backgroundImage:
          "repeating-linear-gradient(90deg, transparent 0 6px, rgb(255 255 255 / 0.25) 6px 7px)",
      }}
    />
  );
}

/** Una hoja: la pregunta es la protagonista; el nombre, rótulo de archivo. */
function Hoja({
  linea,
  numero,
  pose,
  sujecion,
}: {
  linea: Linea;
  numero: string;
  pose: string;
  sujecion: Carpeta["sujecion"];
}) {
  return (
    <li
      className={`bg-grain-light text-azul-principal relative flex flex-col rounded-[4px] bg-white px-7 pt-9 pb-7 shadow-[0_22px_50px_-26px_rgb(31_45_77/0.55),0_2px_6px_-2px_rgb(31_45_77/0.2)] lg:px-8 lg:pt-10 ${pose}`}
    >
      {sujecion === "clip" ? (
        <ClipPapel className="text-azul-principal/45 absolute -top-3 right-7 h-11 w-6" />
      ) : (
        <Cinta className="-top-3 -right-5" />
      )}
      <span className={`${ROTULO_MICRO} text-gris-texto/80 tabular-nums`}>
        Línea {numero}
      </span>
      <h3 className="font-display mt-4 text-[1.32rem] leading-[1.22] font-bold tracking-[-0.015em] lg:text-[1.42rem]">
        {linea.pregunta}
      </h3>
      <p className="mt-5 text-[0.98rem] leading-[1.6]">
        <span className="text-verde-concepto-texto font-medium">Buscamos comprender</span>{" "}
        {linea.buscamos}
      </p>
      <p className={`${ROTULO_MICRO} text-gris-texto/75 mt-5 leading-[1.9]`}>
        {linea.temas.join(" · ")}
      </p>
      <div className="border-azul-principal/15 mt-auto flex items-end justify-between gap-4 border-t border-dashed pt-5">
        <span className="text-azul-principal/70 max-w-[20ch] font-sans text-[0.78rem] leading-[1.4] font-medium">
          {linea.nombre}
        </span>
        <Link
          href="#en-accion"
          aria-label={`Ver en acción: ${linea.nombre}`}
          className="group text-azul-principal hover:bg-azul-principal focus-visible:outline-verde-concepto inline-flex shrink-0 items-center gap-2 rounded-full border border-current px-3 py-1.5 text-[0.78rem] font-medium transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <Search size={14} />
          Ver en acción
        </Link>
      </div>
    </li>
  );
}

/**
 * Tinte de cada carpeta: la 02 es apenas más oscura (otra carpeta del cajón).
 *
 * La sombra hacia arriba es la misma forma en las dos, pero cae sobre
 * superficies distintas: la de la 01 se proyecta sobre el navy y necesita el
 * negro al 65% para leerse; la de la 02 se proyecta sobre la carpeta 01, que
 * es clara, y ahí ese mismo negro canta demasiado. Va en navy y más suave.
 */
const TINTE_CARPETA = [
  {
    fondo: "bg-azul-claro",
    tinta: "text-azul-claro",
    sombra: "shadow-[0_-28px_70px_-30px_rgb(0_0_0/0.65)]",
  },
  {
    fondo: "bg-[color-mix(in_srgb,var(--color-azul-claro)_86%,var(--color-azul-principal))]",
    tinta: "text-[color-mix(in_srgb,var(--color-azul-claro)_86%,var(--color-azul-principal))]",
    sombra: "shadow-[0_-28px_70px_-30px_rgb(31_45_77/0.35)]",
  },
] as const;

/**
 * La carpeta A PANTALLA COMPLETA, como en la referencia: ocupa todo el
 * ancho, sin marco, con su título adentro y aire alrededor. En desktop es
 * más ancha que el viewport (120vw) para que, inclinada al entrar, no deje
 * huecos en los costados; en mobile no hay inclinación y va al ancho justo,
 * porque si sobresale la página queda más ancha que la pantalla y el
 * celular la achica entera. Pestaña, número fantasma, papeles asomando,
 * sello, marca seca y las tres hojas.
 */
function CarpetaLineas({
  carpeta,
  indice,
  refCarpeta,
}: {
  carpeta: Carpeta;
  indice: number;
  refCarpeta: (el: HTMLDivElement | null) => void;
}) {
  const primeraLinea = indice * 3;
  const tinte = TINTE_CARPETA[indice] ?? TINTE_CARPETA[0];
  return (
    <div
      ref={refCarpeta}
      data-lineas-carpeta
      className={`${tinte.fondo} ${tinte.sombra} bg-grain-light relative w-full will-change-transform lg:-ml-[10vw] lg:w-[120vw] ${
        indice === 0 ? "" : "-mt-28"
      }`}
      style={{ zIndex: 10 + indice }}
    >
      {/* Pestaña troquelada, grande como en la referencia. La 02 va corrida. */}
      <span
        aria-hidden="true"
        className={`${tinte.tinta} absolute -top-12 z-0 block h-12 w-[19rem] lg:-top-14 lg:h-14 lg:w-[22rem] ${
          indice === 0 ? "left-[4vw] lg:left-[13vw]" : "right-[4vw] lg:right-auto lg:left-[30vw]"
        }`}
      >
        <Pestana className="h-full w-full">
          <span className={`${ROTULO_TAB} text-azul-principal whitespace-nowrap`}>
            {carpeta.numero} · {carpeta.rotulo}
          </span>
        </Pestana>
      </span>

      {/* Papeles mal guardados asomando por la boca. */}
      {PAPELES[indice]?.map((clases) => (
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
          {carpeta.numero}
        </span>

        {/* Sello de archivo, en ángulo. */}
        <span
          aria-hidden="true"
          className={`${ROTULO_MICRO} text-azul-principal/60 border-azul-principal/40 absolute top-14 right-6 hidden rotate-[-4deg] rounded-[3px] border px-3 py-1.5 md:right-10 lg:block`}
        >
          ARCHIVO ED · LÍNEAS · {carpeta.numero} / 02
        </span>

        <div className="text-azul-principal relative mx-auto max-w-screen-xl">
          {/* Encabezado adentro de la carpeta, centrado y en un renglón, como
              la carpeta de tres tarjetas de la referencia. */}
          <div className="flex flex-col items-center text-center">
            <span className="text-azul-principal/75 inline-flex items-end gap-3">
              <span className="border-azul-principal/60 font-display border-b-2 pb-0.5 text-[0.95rem] font-medium tracking-wide uppercase">
                {carpeta.anotacion}
              </span>
              {indice === 0 && (
                <FlechaManuscrita className="text-verde-concepto h-6 w-12 shrink-0 rotate-[40deg]" />
              )}
            </span>
            <h2
              className="font-display mt-5 font-extrabold tracking-[-0.02em] text-balance"
              style={{ fontSize: "clamp(1.7rem, 0.9rem + 1.7vw, 2.6rem)", lineHeight: 1.12 }}
            >
              {indice === 0 ? (
                <>
                  Qué <Highlight>estudiamos</Highlight> y qué buscamos comprender.
                </>
              ) : (
                carpeta.titulo
              )}
            </h2>
            <p className={`${ROTULO_MICRO} text-azul-principal/70 mt-4 uppercase`}>
              {carpeta.numero} · {carpeta.rotulo} — {carpeta.subtitulo}
            </p>
          </div>

          <ol className="mt-12 grid items-start gap-6 lg:mt-14 lg:grid-cols-3 lg:gap-8">
            {carpeta.lineas.map((linea, i) => (
              <Hoja
                key={linea.nombre}
                linea={linea}
                numero={String(primeraLinea + i + 1).padStart(2, "0")}
                pose={HOJA_POSE[i] ?? ""}
                sujecion={carpeta.sujecion}
              />
            ))}
          </ol>
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
  );
}

/**
 * Sección 3 — Líneas de investigación (`#lineas`): DOS CARPETAS DEL MISMO
 * CAJÓN, A PANTALLA COMPLETA.
 *
 * Seis preguntas en dos carpetas manila con criterio editorial (el saber /
 * la práctica), tres hojas por carpeta. Cada hoja lleva la pregunta como
 * titular —la protagonista, según la arquitectura editorial—, una línea
 * «buscamos comprender», tres temas como nota al margen, y la lupa como
 * botón «Ver en acción» hacia el archivo de casos: mirar de cerca una línea
 * es ir a ver dónde se investiga.
 *
 * Como en la referencia, cada carpeta ocupa toda la pantalla y lleva su
 * título adentro, con aire. La carpeta 01 entra inclinada sobre el navy de
 * la carta y se asienta; la 02 entra igual y tapa a la 01. Sin pin: un
 * scrub corto por carpeta ligado a su entrada. Touch / reduced-motion:
 * carpetas planas.
 */
export function LineasInvestigacion() {
  const zonaRef = useRef<HTMLElement | null>(null);
  const carpetasRef = useRef<(HTMLDivElement | null)[]>([]);
  const reduced = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    if (reduced) return;
    if (!window.matchMedia("(hover: hover) and (min-width: 64rem)").matches)
      return;
    const zona = zonaRef.current;
    if (!zona) return;
    const ctx = gsap.context(() => {
      carpetasRef.current.forEach((carpeta) => {
        if (!carpeta) return;
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
      });
    }, zona);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      ref={zonaRef}
      id="lineas"
      aria-label="Líneas de investigación"
      // isolate: el grano mezcla adentro y los z-index de las carpetas no
      // compiten con el resto de la página. El clip recorta a los costados y
      // por abajo (la carpeta que sale inclinada se mete bajo la sección
      // siguiente en vez de colgar sobre su hoja) y deja el tope abierto
      // para no cortar la esquina que se levanta al entrar.
      className="bg-azul-principal bg-grain-dark relative isolate pt-24 [clip-path:inset(-100vh_0_0)]"
    >
      {/* El campo navy de la carta sigue acá: mismo grain y misma grilla de
          puntos, que asoma en el respiro de arriba y en las cuñas que dejan
          las carpetas al entrar inclinadas. */}
      <PuntosCampo anclaje="arriba" />
      {/* Piso de la sección: la última carpeta sale inclinada y deja una cuña
          a la derecha. Ahí tiene que verse lo que sigue (gris-fondo), no el
          navy del cajón: la carpeta se apoya sobre la sección de abajo. Más
          alto que la cuña máxima (5° sobre 120vw ≈ 4.4vw en el borde) para
          que su canto nunca asome; bajo las carpetas, sobre los puntos. */}
      <span
        aria-hidden="true"
        className="bg-gris-fondo pointer-events-none absolute inset-x-0 bottom-0 h-[6vw]"
      />
      {CARPETAS.map((carpeta, i) => (
        <CarpetaLineas
          key={carpeta.numero}
          carpeta={carpeta}
          indice={i}
          refCarpeta={(el) => {
            carpetasRef.current[i] = el;
          }}
        />
      ))}
    </section>
  );
}
