"use client";

import { useRef, useState } from "react";
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
import { ALTO_PILA_LINEAS_LVH, crearPilaLineas } from "./lineas-investigacion/pila-movil";
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
  // Cuatro modos, decididos enteros en cada corrida y de nuevo en cada cambio
  // de pantalla: la carpeta que entra girando (escritorio con puntero), un
  // giro corto al entrar (tablet), la PILA (celular con alto suficiente) y
  // la lista quieta (movimiento reducido o pantalla baja).
  const [modo, setModo] = useState<"vivo" | "tablet" | "pila" | "quieto">("quieto");

  useIsomorphicLayoutEffect(() => {
    const mqVivo = window.matchMedia("(hover: hover) and (min-width: 64rem)");
    const mqTablet = window.matchMedia("(min-width: 48rem) and (max-width: 63.999rem)");
    const mqPila = window.matchMedia("(max-width: 47.999rem) and (min-height: 38.75rem)");
    const decidir = () => {
      if (reduced) setModo("quieto");
      else if (mqVivo.matches) setModo("vivo");
      else if (mqTablet.matches) setModo("tablet");
      else if (mqPila.matches) setModo("pila");
      else setModo("quieto");
    };
    decidir();
    mqVivo.addEventListener("change", decidir);
    mqTablet.addEventListener("change", decidir);
    mqPila.addEventListener("change", decidir);
    return () => {
      mqVivo.removeEventListener("change", decidir);
      mqTablet.removeEventListener("change", decidir);
      mqPila.removeEventListener("change", decidir);
    };
  }, [reduced]);

  useIsomorphicLayoutEffect(() => {
    if (modo !== "vivo") return;
    const zona = zonaRef.current;
    const carpeta = carpetaRef.current;
    const lista = listaRef.current;
    if (!zona || !carpeta || !lista) return;
    return crearLineas({ zona, carpeta, lista });
  }, [modo]);

  // Tablet: la carpeta entra con un giro corto, sin pin.
  useIsomorphicLayoutEffect(() => {
    if (modo !== "tablet") return;
    const carpeta = carpetaRef.current;
    if (!carpeta) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        carpeta,
        { rotation: 3, transformOrigin: "50% 50%" },
        {
          rotation: 0,
          ease: "power2.out",
          scrollTrigger: { trigger: carpeta, start: "top bottom", end: "top 35%", scrub: 0.6 },
        },
      );
    }, carpeta);
    return () => ctx.revert();
  }, [modo]);

  useIsomorphicLayoutEffect(() => {
    if (modo !== "pila") return;
    const zona = zonaRef.current;
    if (!zona) return;
    return crearPilaLineas(zona);
  }, [modo]);

  return (
    <section
      ref={zonaRef}
      id="lineas"
      data-indice="Líneas de investigación"
      data-modo={modo}
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
        className="bg-azul-claro bg-grain-light relative z-10 w-full shadow-[0_-28px_70px_-30px_rgb(0_0_0/0.65)] lg:-ml-[10vw] lg:w-[120vw] [[data-modo=pila]_&]:mx-2.5 [[data-modo=pila]_&]:w-auto [[data-modo=pila]_&]:rounded-tr-[14px]"
      >
        <BocaCarpeta />

        {/* Contenido: dentro del viewport (en desktop compensa el ancho extra).
            data-lineas-pista es la pista de scroll de la pila en celular: en
            los demás modos su alto lo da el contenido, sin pin. */}
        <div
          data-lineas-pista
          className="relative px-6 pt-28 pb-24 md:px-10 lg:mx-[10vw] lg:pt-32 lg:pb-28 [[data-modo=pila]_&]:px-4 [[data-modo=pila]_&]:pt-5 [[data-modo=pila]_&]:pb-10"
          style={modo === "pila" ? { height: `${ALTO_PILA_LINEAS_LVH}lvh` } : undefined}
        >
          {/* La escena de la pila: la caja pegada mientras la pista
              scrollea; en los demás modos `contents` no toca el layout. Se
              pega DEBAJO del header (top, no padding): así el folio queda
              pegado a la boca de la carpeta cuando la sección llega, sin un
              hueco del alto del header adentro. */}
          <div
            data-lineas-escena
            className={modo === "pila" ? "sticky top-[4.75rem] flex h-[calc(100lvh-4.75rem)] flex-col pb-[calc(100lvh-100svh+1rem)]" : "contents"}
          >
          {/* Número fantasma: rotulación de archivo. */}
          <span
            aria-hidden="true"
            className="font-display text-azul-principal/[0.08] pointer-events-none absolute top-10 left-6 text-[8rem] leading-none font-extrabold tracking-tight select-none md:left-10 lg:top-12 lg:text-[10rem] [[data-modo=pila]_&]:hidden"
          >
            02
          </span>

          {/* Folio de archivo: número de hoja + nombre de la sección en el
              sitemap, como en todas las hojas de la página. */}
          <span
            aria-hidden="true"
            className={`${ROTULO_MICRO} text-azul-principal/60 border-azul-principal/40 absolute top-14 right-6 hidden rotate-[-4deg] rounded-[3px] border px-3 py-1.5 md:right-10 lg:block [[data-modo=pila]_&]:hidden`}
          >
            ARCHIVO ED · HOJA 02 · LÍNEAS DE INVESTIGACIÓN
          </span>

          {/* En la pila este bloque es el que reparte el alto de la escena:
              sin estirarse, la lista no tiene alto propio y cada papel se
              achicaba al mínimo para «entrar» en nada. */}
          <div className="text-azul-principal relative mx-auto max-w-screen-xl [[data-modo=pila]_&]:flex [[data-modo=pila]_&]:min-h-0 [[data-modo=pila]_&]:w-full [[data-modo=pila]_&]:flex-1 [[data-modo=pila]_&]:flex-col">
            {/* Solo en la pila: por cuál pregunta se va y el nombre de la
                sección. El nombre RELEVA a la solapa de la carpeta: aparece
                recién cuando ella se va por arriba, así se lee una sola vez
                en todo el recorrido (pila-movil.ts). */}
            <p
              data-lineas-folio
              className="text-azul-principal/70 hidden items-baseline justify-between gap-3 font-mono text-[0.62rem] tracking-[0.12em] uppercase [[data-modo=pila]_&]:flex"
            >
              <span data-lineas-rotulo>Hoja 02 · Líneas de investigación</span>
              <span aria-hidden="true" className="tabular-nums">
                <span data-lineas-contador className="text-azul-principal font-bold">01</span> / 06
              </span>
            </p>

            {/* Encabezado adentro de la carpeta, centrado. En la pila flota
                sobre el tope de la lista y cede cuando arrancan los papeles. */}
            <div data-lineas-titulo className="flex flex-col items-center text-center [[data-modo=pila]_&]:absolute [[data-modo=pila]_&]:inset-x-0 [[data-modo=pila]_&]:top-10">
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
            <ol
              ref={listaRef}
              data-lineas-pila
              className={
                modo === "pila"
                  ? "relative mt-4 min-h-0 flex-1 [clip-path:inset(-1rem_-1rem_0_-1rem)]"
                  : "mt-14 grid items-start gap-x-8 gap-y-10 lg:mt-16 lg:grid-cols-2 lg:gap-y-12 md:max-lg:grid-cols-2"
              }
            >
              {contenido.lineas.map((linea, i) => (
                <Papel key={numeroDePapel(i)} linea={linea} caso={casos.find((c) => c.id === CASO_DE_CADA_LINEA[i])?.slug} indice={i} />
              ))}
            </ol>

            {/* Un solo CTA: mirar de cerca una línea es ir a ver dónde se
                investiga. */}
            <div className="mt-12 flex justify-center lg:mt-14 [[data-modo=pila]_&]:mt-4 [[data-modo=pila]_&]:justify-start">
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
            className="pointer-events-none absolute right-6 bottom-8 h-12 w-auto opacity-[0.16] select-none md:right-10 lg:bottom-10 lg:h-14 [[data-modo=pila]_&]:hidden"
          />
          </div>
        </div>
      </div>
    </section>
  );
}
