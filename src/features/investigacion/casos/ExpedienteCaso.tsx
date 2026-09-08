"use client";

import { useEffect, useRef, useState, type Ref } from "react";
import type { CasoInvestigacion } from "./data";
import { ROTULO_MICRO, TINTES } from "./tintes";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { crearParallax, crearReveals } from "./expediente/coreografia-expediente";
import { CabeceraExpediente } from "./expediente/CabeceraExpediente";
import { PestanasLaterales } from "./expediente/PestanasLaterales";
import { HojaInforme } from "./expediente/HojaInforme";
import { CartonExpediente } from "./expediente/CartonExpediente";
import { BandaSiguiente } from "./expediente/BandaSiguiente";

type Props = {
  caso: CasoInvestigacion;
  casos: readonly CasoInvestigacion[];
  indice: number;
  interactiva: boolean;
  /** true cuando el lugar está establecido (open/switching): fondo opaco.
   *  Durante apertura/cierre queda transparente para que el morph con la
   *  carpeta del índice (que vive en la página, debajo) sea visible. */
  telonOpaco: boolean;
  /** desdeBanda: true cuando el origen es la banda «SIGUIENTE EXPEDIENTE»
   *  (habilita la transición banda-que-sube con ghost). */
  onIr: (indice: number, desdeBanda?: boolean) => void;
  onVolver: () => void;
  refLugar: Ref<HTMLElement>;
  refShell: Ref<HTMLDivElement>;
  refTitulo: Ref<HTMLHeadingElement>;
};

/**
 * Expediente abierto v9 — DOS SUPERFICIES (gramática de la referencia):
 * la hoja blanca es el informe y es CORTA (contexto mecanografiado +
 * pregunta); donde termina, queda a la vista el CARTÓN tintado del
 * interior de la carpeta, y todo lo que sigue son recursos sueltos
 * apoyados sobre el color — collage de evidencias, análisis como hoja
 * mecanografiada con clip, aprendizaje como post-it, síntesis en placa,
 * sello ED con logo estampado directo sobre el cartón y producción como
 * etiquetas. El lugar (capa fija con scroll propio: `data-lenis-prevent`
 * para que Lenis no se coma la rueda y `data-scroll-principal` para que el
 * navbar se esconda y aparezca siguiendo ESTE recorrido y no el de la
 * ventana, que queda congelada debajo) abre con título display ancho +
 * ficha catalográfica y un indicio de scroll que se apaga al recorrer.
 * Las pestañas de los otros casos son parte del objeto: asoman del canto
 * derecho de la carcasa. Tipografías de material (no de UI): manuscrita
 * para notas, máquina de escribir para el texto documental.
 *
 * Piezas (`expediente/`): cabecera, pestañas de la carcasa, hoja del
 * informe, cartón y banda de remate; reveals, asentado, sello y parallax en
 * `coreografia-expediente.ts`. `article[data-exp-lugar] > … > cuerpo` es el
 * mismo árbol de siempre: la coreografía del archivo lo lee por selectores.
 */
export function ExpedienteCaso({
  caso,
  casos,
  indice,
  interactiva,
  telonOpaco,
  onIr,
  onVolver,
  refLugar,
  refShell,
  refTitulo,
}: Props) {
  const cuerpoRef = useRef<HTMLDivElement | null>(null);
  const [recorrido, setRecorrido] = useState(false);
  const reduced = useReducedMotion();
  const tinte = TINTES[caso.tinte];
  const oscuro = caso.tinte !== "claro";
  const siguiente = indice < casos.length - 1 ? casos[indice + 1] : null;

  /* Indicio de scroll: se apaga al primer recorrido del lugar. */
  useEffect(() => {
    const lugar = cuerpoRef.current?.closest<HTMLElement>("[data-exp-lugar]");
    if (!lugar) return;
    const alScroll = () => {
      if (lugar.scrollTop > 40) setRecorrido(true);
    };
    lugar.addEventListener("scroll", alScroll, { passive: true });
    return () => lugar.removeEventListener("scroll", alScroll);
  }, [caso.id]);

  /* Reveals por scroll, asentado y sello. La capa del lugar se resuelve por
     closest: el ref del padre viaja directo al <article> y acá no se mutan
     props — regla react-hooks/immutability. */
  useIsomorphicLayoutEffect(() => {
    const cuerpo = cuerpoRef.current;
    const lugar = cuerpo?.closest<HTMLElement>("[data-exp-lugar]");
    if (!cuerpo || !lugar || reduced) return;
    return crearReveals(cuerpo, lugar);
  }, [reduced, caso.id]);

  /* Micro-parallax de piezas sueltas (lámina, notas, sello): puntero fino. */
  useIsomorphicLayoutEffect(() => {
    const cuerpo = cuerpoRef.current;
    if (!cuerpo || reduced) return;
    return crearParallax(cuerpo);
  }, [reduced, caso.id]);

  return (
    <article
      ref={refLugar}
      data-exp-lugar
      data-lenis-prevent
      data-scroll-principal
      id="expediente-caso"
      aria-label={`Expediente del caso ${caso.numero}`}
      className={`fixed inset-0 z-50 overflow-x-hidden overflow-y-auto overscroll-contain ${
        telonOpaco ? "bg-gris-fondo" : "bg-transparent"
      }`}
    >
      <div className="relative mx-auto w-[min(96vw,94rem)] px-4 pt-14 pb-24 lg:px-8 lg:pt-16 lg:pb-28">
        <CabeceraExpediente caso={caso} refTitulo={refTitulo} />

        {/* ── La carpeta: carcasa tintada = INTERIOR de cartón. La hoja
            blanca (el informe) es corta; el resto del recorrido son
            recursos sueltos apoyados directamente sobre el color ──────── */}
        <div className="relative mt-12 lg:mt-14">
          <div
            ref={refShell}
            className={`${tinte.carpeta} ${tinte.grano} relative rounded-[1.6rem] p-3 pt-12 shadow-[0_44px_110px_-42px_rgb(31_45_77/0.6)] will-change-transform md:p-5 md:pt-14 lg:p-9 lg:pt-16`}
          >
            <PestanasLaterales caso={caso} casos={casos} interactiva={interactiva} onIr={onIr} />

            <div ref={cuerpoRef} className="relative">
              <HojaInforme caso={caso} />
              <CartonExpediente caso={caso} oscuro={oscuro} />
            </div>
          </div>
        </div>

        <BandaSiguiente
          siguiente={siguiente}
          indice={indice}
          total={casos.length}
          interactiva={interactiva}
          onIr={onIr}
          onVolver={onVolver}
        />
      </div>

      {/* ── Indicio de scroll: la primera pantalla muestra solo el borde de
          la carpeta; esto avisa que hay recorrido. Se apaga al scrollear. */}
      <p
        aria-hidden="true"
        className={`${ROTULO_MICRO} text-azul-principal/70 fixed bottom-8 left-8 z-[55] hidden items-center gap-2.5 transition-opacity duration-500 lg:flex ${
          telonOpaco && !recorrido ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        SEGUIR LEYENDO
        <span className="motion-safe:animate-bounce">↓</span>
      </p>
    </article>
  );
}
