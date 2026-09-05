"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Highlight } from "@/components/ui/Highlight";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import type { Figura } from "./constelacion";
import { FiguraConstelacion } from "./FiguraConstelacion";
import { crearCarta } from "./coreografia-carta";

/**
 * Los cuatro fundamentos, cada uno con la figura de la constelación que lo
 * dice: la socioepistemología es la red (conocimiento como construcción
 * social), problematizar es la pregunta, el empoderamiento es la espiral
 * (proceso progresivo) y el pensamiento matemático es la lupa (analizar).
 * Las definiciones son el texto canónico de estos conceptos en el sitio
 * (docs/content/arquitectura-investigacion.md §4).
 */
const FUNDAMENTOS: ReadonlyArray<{
  titulo: string;
  figura: Figura["id"];
  texto: string;
  aclaracion?: string;
}> = [
  {
    titulo: "Socioepistemología",
    figura: "red",
    texto:
      "Una mirada que comprende el conocimiento matemático como una construcción social: estudia cómo adquiere sentido en contextos, usos, decisiones e interacciones concretas, en lugar de separarlo de las personas y de sus prácticas.",
  },
  {
    titulo: "Problematización de la matemática escolar",
    figura: "pregunta",
    texto:
      "Revisar lo que suele darse por sentado: por qué se enseña un contenido de determinada manera, qué sentido tiene una tarea, qué estrategias habilita, qué argumentos produce y cómo se relaciona con la vida de quienes aprenden.",
  },
  {
    titulo: "Empoderamiento docente desde el saber",
    figura: "espiral",
    texto:
      "Un proceso progresivo y colectivo: las y los docentes fortalecen su autonomía, cuestionan prácticas naturalizadas, toman decisiones con fundamento y reconocen su capacidad de transformar desde el conocimiento.",
    aclaracion:
      "No es poder sobre estudiantes ni sobre otras personas: es poder sobre la propia práctica.",
  },
  {
    titulo: "Desarrollo del pensamiento matemático",
    figura: "lupa",
    texto:
      "Construir una forma de analizar y actuar: buscar estrategias, formular hipótesis, argumentar, anticipar, decidir y comprender información. Los contenidos escolares funcionan como herramientas, no como un fin aislado.",
  },
];

/** Volanta + título. Dos copias superpuestas en la coreografía (ver abajo). */
function Titulo({ tono }: { tono: "tinta" | "luz" }) {
  const luz = tono === "luz";
  return (
    <div className="flex flex-col items-center text-center">
      <Eyebrow variant={luz ? "light" : "dark"}>Por qué investigamos</Eyebrow>
      <h2
        className={`font-display mt-5 font-extrabold tracking-[-0.025em] ${
          luz ? "text-white" : "text-azul-principal"
        }`}
        style={{ fontSize: "clamp(2.4rem, 1rem + 3.4vw, 4.2rem)", lineHeight: 1.04 }}
      >
        Nacimos de una pregunta.
      </h2>
    </div>
  );
}

/** La hoja de la carta: apertura, idea central y posdata transversal. */
function Hoja({ live }: { live: boolean }) {
  return (
    <article
      data-carta-hoja
      className={`bg-grain-light text-azul-principal rounded-[3px] bg-white px-10 py-10 shadow-[0_30px_70px_-30px_rgb(0_0_0/0.55)] lg:px-14 lg:py-12 ${
        live
          ? "absolute top-5 left-1/2 z-10 w-[calc(100%-3.5rem)] -translate-x-1/2"
          : "relative mx-auto mt-14 max-w-3xl"
      }`}
    >
      <span className="text-gris-texto/70 font-mono text-[0.68rem] tracking-[0.2em] uppercase">
        Archivo ED · Hoja 02
      </span>
      <p className="mt-6 text-[1.02rem] leading-[1.7] lg:text-[1.08rem]">
        Empoderamiento Docente nació de una pregunta: ¿qué sucede cuando las y
        los docentes transforman su relación con el saber matemático escolar
        y reconocen su capacidad de intervenir en la realidad? Esa pregunta
        creció mediante investigación, trabajo con comunidades docentes e
        intervenciones sostenidas. Hoy sigue orientando una forma de actuar
        en la que conocer y transformar son parte del mismo proceso.
      </p>
      <p className="font-display mt-7 text-[1.28rem] leading-[1.4] font-medium lg:text-[1.4rem]">
        No investigamos para observar la escuela desde afuera.{" "}
        <Highlight>Investigamos con los contextos educativos</Highlight> para
        comprender lo que ocurre, construir alternativas y aprender de su
        implementación.
      </p>
      <p className="text-gris-texto mt-7 text-[0.92rem] leading-[1.65]">
        <span className="text-azul-principal/70 mr-2 font-mono text-[0.7rem] tracking-[0.16em] uppercase">
          P. D.
        </span>
        Género, inclusión, derechos humanos, ciudadanía y justicia social
        atraviesan nuestras preguntas, nuestros materiales y nuestras
        relaciones educativas. No son un capítulo aparte: son criterios con
        los que investigamos.
      </p>
      <div className="mt-8 flex items-center justify-between">
        <Image
          src="/brand/logotipo-principal-ed.png"
          alt="Empoderamiento Docente"
          width={160}
          height={40}
          className="h-7 w-auto opacity-90"
        />
        <span className="text-gris-texto/60 font-mono text-[0.66rem] tracking-[0.18em] uppercase">
          Investigar para transformar
        </span>
      </div>
    </article>
  );
}

/**
 * Sección 2 — Por qué investigamos (`#sentido`): la CARTA ABIERTA.
 *
 * El copy es una carta en primera persona («nació de una pregunta», «no
 * investigamos desde afuera»), así que se presenta como tal: sobre el navy
 * que llega desde abajo, un sobre en el borde inferior del que sale la hoja
 * al ritmo del scroll, y las cuatro fichas de los fundamentos —cada una con
 * su figura de la constelación— que esperan en las esquinas y se ordenan en
 * grilla cuando la carta se va. Coreografía en coreografia-carta.ts.
 *
 * Sin JS, en touch o con reduced-motion se muestra el estado final en
 * flujo: título, carta como bloque y grilla 2×2 abierta. Con puntero y
 * desde 1024px (`live`) el markup pasa a escenario de una pantalla antes
 * del primer paint (layout effect) y la coreografía toma el control.
 */
export function CartaAbierta() {
  const zonaRef = useRef<HTMLElement | null>(null);
  const hojaRef = useRef<HTMLDivElement | null>(null);
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
    const hoja = hojaRef.current;
    if (!zona || !hoja) return;
    const ctx = gsap.context(() => {
      crearCarta({ zona, hoja });
    }, zona);
    // El pin de la carta entra un render después que los triggers de las
    // secciones siguientes (live se decide en un layout effect): su spacer
    // corre todo lo de abajo, así que hay que recalcular los demás.
    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [live]);

  return (
    <section
      ref={zonaRef}
      id="sentido"
      aria-label="Por qué investigamos"
      className="bg-gris-fondo"
    >
      <div
        ref={hojaRef}
        className={`relative isolate overflow-hidden ${live ? "h-[100svh]" : "min-h-[100svh]"}`}
      >
        {/* ── El campo navy. En la coreografía es un círculo que crece desde
            el borde inferior (clip-path); estático, cubre todo. */}
        <div
          data-carta-campo
          className="bg-azul-principal bg-grain-dark absolute inset-0 -z-10"
        >
          {/* Grid de puntos del manual §6, blanco tenue sobre navy. */}
          <span
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.13]"
            style={{
              backgroundImage: "radial-gradient(white 1px, transparent 1.5px)",
              backgroundSize: "44px 44px",
              backgroundPosition: "22px 22px",
            }}
          />
          {live && (
            // Copia en luz del título: vive ADENTRO del campo para que el
            // borde del círculo la revele (la copia en tinta queda DEBAJO del
            // campo, tapada por el navy) — inversión sin fade ni contorno.
            <div data-carta-titulo-luz className="absolute inset-x-0 top-[14svh] z-10 px-8">
              <Titulo tono="luz" />
            </div>
          )}
        </div>

        {live ? (
          <>
            {/* Copia en tinta del título: bajo el campo, visible solo donde
                el círculo todavía no llegó. */}
            <div
              data-carta-titulo-tinta
              className="absolute inset-x-0 top-[14svh] -z-20 px-8"
            >
              <Titulo tono="tinta" />
            </div>

            {/* ── El sobre, en el borde inferior. La hoja va entre la solapa
                (atrás) y el cuerpo (adelante), y sale por la boca. */}
            <div
              data-carta-sobre
              className="absolute bottom-0 left-1/2 z-20 h-[36svh] w-[min(46rem,54vw)] -translate-x-1/2"
            >
              <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-[calc(100%-1px)] h-[9rem]"
                style={{
                  clipPath: "polygon(0 100%, 50% 0, 100% 100%)",
                  background:
                    "color-mix(in srgb, var(--color-azul-claro) 82%, var(--color-azul-principal))",
                }}
              />
              <Hoja live />
              <div
                aria-hidden="true"
                className="bg-azul-claro bg-grain-light border-azul-principal/20 absolute inset-0 z-20 rounded-t-md border-t shadow-[0_-18px_50px_-24px_rgb(0_0_0/0.6)]"
              >
                <span className="text-azul-principal/75 absolute top-8 left-1/2 -translate-x-1/2 font-mono text-[0.7rem] tracking-[0.22em] whitespace-nowrap uppercase">
                  Para quienes transforman la matemática escolar
                </span>
              </div>
            </div>
          </>
        ) : null}

        {/* ── Contenido en flujo (estático) / actores del escenario (live). */}
        <div
          className={
            live
              ? "contents"
              : "relative z-10 mx-auto max-w-screen-xl px-8 pt-28 pb-24"
          }
        >
          {!live && <Titulo tono="luz" />}
          {!live && <Hoja live={false} />}

          <ul
            data-carta-fichas
            className={`grid gap-6 ${
              live
                ? "absolute inset-0 z-10 mx-auto max-w-[62rem] grid-cols-2 content-center px-8"
                : "mt-16 md:grid-cols-2"
            }`}
          >
            {FUNDAMENTOS.map((f) => (
              <li
                key={f.titulo}
                data-ficha
                className="bg-grain-light text-azul-principal relative rounded-lg bg-white p-7 shadow-[0_24px_50px_-28px_rgb(0_0_0/0.55)] will-change-transform"
              >
                <div className="flex items-center gap-5">
                  <FiguraConstelacion id={f.figura} className="w-14 shrink-0" />
                  <h3 className="font-display text-[1.18rem] leading-tight font-bold">
                    {f.titulo}
                  </h3>
                </div>
                <div
                  data-ficha-texto
                  className="grid"
                  style={{ gridTemplateRows: "1fr" }}
                >
                  <div className="min-h-0 overflow-hidden">
                    <p className="mt-4 text-[0.95rem] leading-[1.65]">{f.texto}</p>
                    {f.aclaracion ? (
                      <p className="mt-3 text-[0.95rem] leading-[1.65] font-medium">
                        {f.aclaracion}
                      </p>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
