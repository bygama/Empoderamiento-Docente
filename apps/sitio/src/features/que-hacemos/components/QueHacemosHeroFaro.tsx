"use client";

import { useRef } from "react";
import { Highlight } from "@/components/ui/Highlight";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { FaroEscena } from "./FaroEscena";
import { crearCoreografiaFaro } from "./hero-faro/coreografia-faro";
import { PreguntasFaro } from "./hero-faro/PreguntasFaro";
import { CierreFaro } from "./hero-faro/CierreFaro";

/**
 * Hero de «Qué hacemos» v2 — scroll-story del faro con CÁMARA.
 *
 * La escena (FaroEscena) son seis capas con profundidad Z. La cámara (un
 * proxy {z,x,y} animado por la timeline scrubbed, proyectado a cada capa
 * como una cámara pinhole) vive en `hero-faro/camara-faro.ts`; el giro del
 * haz —único dueño de `rotation`— en `haz-faro.ts`; el recorrido S0–S5 en
 * `escenas-faro.ts` y el armado (matchMedia, estados iniciales, línea de
 * tiempo, llegada detrás del hero, hook `#qa=`) en `coreografia-faro.ts`.
 *
 * Recorrido (una sola escena que evoluciona, sin pantallas):
 *   S0 0.00–0.19  SILENCIO   plano general lejano, mundo apenas insinuado,
 *                            una chispa tenue en la linterna, una frase que
 *                            se queda hasta que el mundo empieza a entrar.
 *   S1 0.10–0.40  APROXIMACIÓN + ENCENDIDO  la cámara avanza, el muelle y
 *                            el primer plano ENTRAN por los bordes; a mitad
 *                            de camino la linterna prende (chispa → núcleo →
 *                            halo → haz) y la luz revela el mensaje central.
 *   S2 0.40–1.33  ENFOQUE    cuatro golpes, UNA frase por momento: por qué
 *                            esto no es una capacitación tradicional (el
 *                            lugar de «Nuestro enfoque» en el sitemap). El
 *                            haz dirige la lectura (izq lejos → izq alto →
 *                            der → centro), la cámara se desplaza
 *                            lateralmente y sigue avanzando hasta el
 *                            contrapicado (faro ~55% del alto en la última).
 *                            Cada frase tocada deja un rastro verde en el
 *                            agua. Un beat por frase (PASO_PREGUNTA).
 *   S4 1.36–1.56  CIERRE     la noche no cede: el faro alumbra el titular
 *                            final y su CTA; el haz se abre y baña el plano.
 *   S5 1.51–1.60  DESLUMBRE  la linterna crece hasta dejar la pantalla en
 *                            blanco; la torre de líneas nace de ese blanco.
 *
 * Las posiciones son UNIDADES DE LA LÍNEA DE TIEMPO, no progreso 0–1: la
 * línea dura DURACION_RECORRIDO (>1) y ScrollTrigger reparte el runway
 * entero entre 0 y ese valor. Con el runway actual 1 unidad ≈ 620vh de
 * scroll. Ver tiempos-faro.ts.
 *
 * Copy: la frase central es la del cartel oficial; las cuatro frases del
 * enfoque son palabras de Dani (devolución de junio de 2026) y del pie del
 * sitio, marcadas VALIDAR con ED igual que el titular del cierre, pedido
 * por Gastón. Desktop-first: la coreografía corre en ≥1024px
 * sin reduced-motion (gsap.matchMedia rearma al cruzar el breakpoint); si
 * no, queda la escena estática encendida con el mensaje central (default
 * del JSX) y el runway colapsa a una pantalla (h-svh).
 */
export function QueHacemosHeroFaro() {
  const rootRef = useRef<HTMLElement | null>(null);
  const altoRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    const alto = altoRef.current;
    if (!root || !alto || reduced) return;
    return crearCoreografiaFaro(root, alto);
  }, [reduced]);

  return (
    // z-10: la torre se mete una pantalla por debajo (solape del deslumbre).
    // Esta sección tiene que pintar POR ENCIMA mientras dura el pin; si no,
    // la torre asomaría sobre la escena nocturna.
    // -mt de una pantalla: el escenario del faro arranca DETRÁS del hero, así
    // el cielo y las estrellas son literalmente los mismos para las dos
    // secciones (antes solo compartían el color de fondo). El hero va encima
    // con z mayor y sin fondo propio, así que se lee como una sola escena.
    <section
      id="faro"
      data-indice="El faro"
      ref={rootRef}
      className="relative z-10 lg:-mt-[100svh] lg:motion-reduce:mt-0"
      aria-label="Qué hace Empoderamiento Docente"
    >
      {/* El runway solo existe donde corre la coreografía: en mobile o con
          reduced-motion colapsa a una pantalla (nada de scroll muerto).
          Alto = DURACION_RECORRIDO · 620vh + 200vh (1.60 · 620 + 200 ≈ 1192):
          si cambia la duración de la línea de tiempo, cambia este número. */}
      <div ref={altoRef} className="relative h-svh lg:h-[1192vh] lg:motion-reduce:h-svh">
        <div
          data-escenario
          // Sin fondo propio: lo pone el envoltorio compartido con el hero
          // (ver app/que-hacemos/page.tsx). El cielo es uno solo para las dos
          // secciones, así no hay junta posible.
          className="sticky top-0 isolate h-svh overflow-hidden"
        >
          <FaroEscena />

          {/* Velo blanco del deslumbre: encima de la escena, debajo de los
              textos (el titular ya salió cuando este sube). Solo la
              coreografía lo enciende; en el fallback queda en 0. */}
          <div
            data-velo-blanco
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-white"
            style={{ opacity: 0 }}
          />

          {/* Titular de la sección, siempre perceptible para AT (h2: el h1
              de la página vive en QueHacemosHero, que va primero): la
              versión visual de abajo entra y sale con la coreografía. */}
          <h2 className="sr-only">
            Consultora especializada en la transformación del aprendizaje
            matemático.
          </h2>

          {/* ══ Overlays de texto — una idea por momento ══ */}

          {/* S0 · La pregunta en la noche (principio «Singularidad», data.ts) */}
          <div data-esc="0" aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center" style={{ opacity: 0 }}>
            <div className="mx-auto w-full max-w-screen-xl px-5 md:px-10">
              <p className="text-azul-claro/90 font-display max-w-[30ch] text-[1.65rem] font-medium leading-snug md:text-[2rem]">
                Cada contexto educativo presenta actores, objetivos, tensiones
                y posibilidades diferentes.
              </p>
            </div>
          </div>

          {/* S1 · Mensaje central — el momento tipográfico principal. También
              es el fallback estático (sin JS / reduced-motion / <lg). Es la
              frase del cartel oficial de ED (2026-09-08; antes decía «Diseñamos
              y acompañamos procesos que transforman la matemática escolar»). El
              subrayado de «aprendizaje matemático» se pinta con la luz
              (background-size). aria-hidden: para AT está el h2 sr-only de arriba. */}
          <div data-esc="1" aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center">
            <div className="mx-auto w-full max-w-screen-xl px-5 md:px-10">
              {/* Sin eyebrow: «Qué hacemos» ya es el título de la página y
                  el hero lo acaba de decir; repetirlo acá le quitaba peso al
                  momento tipográfico (pedido de Mateo, 2026-09-02). */}
              <div data-mensaje>
                <p
                  className="font-display max-w-[21ch] font-extrabold tracking-[-0.03em] text-balance text-white [&_mark]:bg-[linear-gradient(var(--color-verde-concepto),var(--color-verde-concepto))] [&_mark]:bg-no-repeat [&_mark]:[background-position:0_96%] [&_mark]:[background-size:100%_0.14em] [&_mark]:no-underline"
                  style={{ fontSize: "clamp(2.6rem, 1.2rem + 3.9vw, 4.6rem)", lineHeight: 1.06 }}
                >
                  Consultora especializada en la transformación del{" "}
                  <Highlight>aprendizaje matemático</Highlight>.
                </p>
              </div>
            </div>
          </div>

          {/* S2 sin caption: llevaba el eyebrow «Antes de proponer nada»
              arriba de las preguntas; se quitó junto con el de S1 para que
              cada momento tenga UNA sola lectura. */}

          {/* S2 · Las cuatro frases del enfoque: un golpe por momento */}
          <PreguntasFaro />

          {/* S3 RETIRADO. Mostraba «Niveles en los que intervenimos» + «Del
              sistema al aula» con cinco estaciones — es, textual, el título y
              el contenido de una sección que viene más abajo. Además las
              estaciones se posicionaban a lo largo del muelle, que ya no
              existe, así que quedaban flotando sobre el agua. */}

          {/* S4 · Cierre sobre la noche: titular + única acción del plano final. */}
          <CierreFaro />
        </div>
      </div>
    </section>
  );
}
