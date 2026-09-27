"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ButtonSecondary } from "@/components/ui/ButtonSecondary";
import { FlechaManuscrita } from "@/features/investigacion/casos/Garabatos";
import { ROTULO_MICRO } from "@/features/investigacion/casos/tintes";
import type { Lineas } from "@/features/investigacion/contenido/lineas";
import { CASO_DE_CADA_LINEA } from "@/features/investigacion/contenido/modelo-de-casos";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { alClicIrA } from "@/lib/navegar";
import { ConResaltado } from "./ConResaltado";
import { BocaCarpeta } from "./lineas-investigacion/BocaCarpeta";
import { crearLineas } from "./lineas-investigacion/coreografia-lineas";
import { numeroDePapel } from "./lineas-investigacion/numero";
import { Papel } from "./lineas-investigacion/Papel";
import { PuntosCampo } from "./PuntosCampo";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Sección 3 — Líneas de investigación (`#lineas`): UNA CARPETA A PANTALLA
 * COMPLETA, la Hoja 02 del archivo, con la lista de las seis preguntas.
 *
 * Seis papeles sobre la carpeta (lineas-investigacion/Papel.tsx): número,
 * nombre de la línea chico y la pregunta grande, en el orden del doc
 * maestro. Nada más que leer, y un solo CTA al pie hacia los casos («Mirá
 * la investigación en acción», el de la arquitectura editorial).
 *
 * Como en la referencia, la carpeta ocupa toda la pantalla y lleva su
 * título adentro, con aire. Entra inclinada sobre el navy de la sección
 * anterior y se asienta al centrarse (scrub corto ligado a su entrada, sin
 * pin); las filas se revelan en cascada al llegar
 * (lineas-investigacion/coreografia-lineas.ts). Touch / reduced-motion:
 * carpeta plana y filas quietas. Los textos llegan por props (de
 * `features/investigacion/contenido/lineas.ts` o de la base), y los casos
 * con su slug, para «Ver en acción».
 */
export function LineasInvestigacion({ contenido, casos }: { contenido: Lineas; casos: ReadonlyArray<{ id: string; slug: string }> }) {
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
    return crearLineas({ zona, carpeta, lista });
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
        <BocaCarpeta />

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
                  {contenido.antetitulo}
                </span>
                <FlechaManuscrita className="text-verde-concepto h-6 w-12 shrink-0 rotate-[40deg]" />
              </span>
              <h2
                className="font-display mt-5 font-extrabold tracking-[-0.02em] text-balance"
                style={{ fontSize: "clamp(1.7rem, 0.9rem + 1.7vw, 2.6rem)", lineHeight: 1.12 }}
              >
                <ConResaltado texto={contenido.titulo} />
              </h2>
              <p className={`${ROTULO_MICRO} text-azul-principal/70 mt-4 uppercase`}>
                {contenido.bajada}
              </p>
            </div>

            {/* La mesa: seis papeles en dos columnas, la pregunta como
                protagonista. Se lee en zigzag, como una lista. La key es el
                número del papel y no su texto: la lista es fija y no se
                reordena, y dos nombres iguales cargados en el admin no
                pueden repetirla. */}
            <ol ref={listaRef} className="mt-14 grid items-start gap-x-8 gap-y-10 lg:mt-16 lg:grid-cols-2 lg:gap-y-12">
              {contenido.lineas.map((linea, i) => (
                <Papel key={numeroDePapel(i)} linea={linea} caso={casos.find((c) => c.id === CASO_DE_CADA_LINEA[i])?.slug} indice={i} />
              ))}
            </ol>

            {/* Un solo CTA: mirar de cerca una línea es ir a ver dónde se
                investiga. */}
            <div className="mt-12 flex justify-center lg:mt-14">
              <ButtonSecondary href="#en-accion" withArrow onClick={alClicIrA("en-accion")}>
                {contenido.boton}
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
