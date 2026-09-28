"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { RevealLines } from "@/components/ui/RevealLines";
import { ButtonPrimary } from "@/components/ui/ButtonPrimary";
import { ButtonSecondary } from "@/components/ui/ButtonSecondary";
import type { Puente } from "@/features/biblioteca/contenido/puente";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { crearPuente } from "./puente-investigacion/coreografia-puente";
import { numeroDeRecurso } from "./puente-investigacion/numero";
import { PanelRecurso } from "./puente-investigacion/PanelRecurso";
import { ALTO_PILA_LVH, crearPilaPuente } from "./puente-investigacion/pila-movil";
import { PASO, TEMAS } from "./puente-investigacion/temas";
import { useModoPuente } from "./puente-investigacion/useModoPuente";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * "Conexión con Investigación" (sitemap pág. 05, sección 7 · PUENTE) —
 * VERSIÓN B: pila de LOMOS. Escena sticky con el scroll como timeline: cada
 * tipo de recurso llega como un panel grande desde la derecha y se apila
 * sobre el anterior, dejando visible solo una franja vertical con su nombre
 * — el lomo del libro en el estante, que para una biblioteca es literal. Los
 * paneles que todavía no llegaron esperan asomando su lomo en el borde
 * derecho. Cada panel tiene aire para lo que en las flip-cards no entraba:
 * foto, qué es el recurso y de qué línea de investigación nace.
 *
 * Geometría y coreografía en puente-investigacion/coreografia-puente.ts; el
 * panel, en puente-investigacion/PanelRecurso.tsx. Para que los lomos en
 * espera no tapen texto, el cuerpo de cada panel se margina a la derecha lo
 * que ocupan los lomos que tiene delante. z ascendente: el que llega tapa al
 * anterior.
 *
 * Mapeo recurso→línea: inferido del modelo conceptual — VALIDAR con cliente.
 * Mobile / touch / prefers-reduced-motion: sin pin — los paneles se apilan
 * verticales con todo el contenido visible (`live` arranca false = SSR).
 * Los textos y las fotos llegan por props (de
 * `features/biblioteca/contenido/puente.ts` o de la base).
 */

/** Los paneles alternan navy y gris por su lugar en la pila: el primero, navy. */
const temaDe = (i: number) => (i % 2 === 0 ? TEMAS.navy : TEMAS.gris);

export function PuenteInvestigacion({ contenido }: { contenido: Puente }) {
  const { recursos } = contenido;
  const zoneRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const pilaRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLElement | null>(null);
  // El modo (vivo en escritorio, pila en celular y tablet, estático con
  // movimiento reducido o pantalla baja) se decide entero en cada corrida
  // (puente-investigacion/useModoPuente.ts). Gate primero, GSAP después
  // (efecto aparte): así el layout ya está aplicado cuando se mide.
  const modo = useModoPuente(reduced);
  const live = modo === "vivo";
  const movil = modo === "movil";

  useIsomorphicLayoutEffect(() => {
    if (!movil) return;
    const root = rootRef.current;
    if (!root) return;
    return crearPilaPuente(root);
  }, [movil]);

  useIsomorphicLayoutEffect(() => {
    if (!live) return;
    const zone = zoneRef.current;
    const stage = stageRef.current;
    const pila = pilaRef.current;
    if (!zone || !stage || !pila) return;
    return crearPuente({ zone, stage, pila });
  }, [live]);

  return (
    <section
      ref={rootRef}
      data-modo={modo}
      id="puente-investigacion"
      data-indice="Investigación"
      className="relative bg-white pb-16 md:pb-24"
      aria-label="Conexión con Investigación"
    >
      <div
        ref={zoneRef}
        data-puente-pista
        className={live ? "h-[430svh]" : ""}
        style={movil ? { height: `${ALTO_PILA_LVH}lvh` } : undefined}
      >
        <div
          ref={stageRef}
          data-puente-escena
          className={
            // Clip solo en X: frena a los paneles que asoman por la derecha
            // (sin scrollbar horizontal) pero deja respirar la sombra de las
            // cards hacia abajo — con clip total quedaba cortada en seco al
            // borde del escenario.
            live
              ? "sticky top-0 isolate flex h-[100svh] flex-col overflow-x-clip"
              : movil
                ? "sticky top-0 isolate flex h-lvh flex-col overflow-x-clip"
                : ""
          }
        >
          {/* Encabezado: queda a la vista durante toda la escena. */}
          <div className="mx-auto w-full max-w-screen-xl px-5 pt-20 pb-8 md:px-10 md:pt-24 md:pb-10 max-lg:pt-[5.25rem] max-lg:pb-5">
            <div className="md:grid md:grid-cols-12 md:items-end md:gap-x-8">
              <RevealLines
                as="h2"
                className="font-display text-azul-principal max-w-[18ch] font-bold tracking-[-0.02em] md:col-span-7"
                style={{ fontSize: "clamp(2rem, 1rem + 3vw, 3.6rem)", lineHeight: 1.06 }}
              >
                {contenido.titulo}
              </RevealLines>
              <div className="mt-8 flex flex-wrap items-center gap-4 md:col-span-4 md:col-start-9 md:mt-0">
                <ButtonPrimary href="/investigacion">{contenido.botonPrincipal}</ButtonPrimary>
                <ButtonSecondary href="/novedades">{contenido.botonSecundario}</ButtonSecondary>
              </div>
            </div>
          </div>

          {/* La pila: en live los paneles son absolutos y viajan; en estático
              se apilan verticales. El wrapper con padding da el ancho; el div
              interno es el contexto de posicionamiento (los absolutos se
              posicionan contra el padding-box, así que el px no los correría). */}
          <div
            className={
              "mx-auto w-full max-w-screen-xl px-5 md:px-10 " +
              (live ? "min-h-0 flex-1 pb-[3.5svh]" : movil ? "min-h-0 flex-1 pb-4" : "pb-4")
            }
          >
            <div
              ref={pilaRef}
              data-puente-pila
              className={live || movil ? "relative h-full" : "flex flex-col gap-5"}
              style={{ "--pila-paso": PASO } as React.CSSProperties}
            >
              {/* La key es el número del recurso y no su nombre: la lista es
                  fija y no se reordena, y dos nombres iguales cargados en el
                  admin no pueden repetirla. */}
              {recursos.map((recurso, i) => (
                <PanelRecurso key={numeroDeRecurso(i)} recurso={recurso} tema={temaDe(i)} i={i} total={recursos.length} live={live} movil={movil} />
              ))}
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
