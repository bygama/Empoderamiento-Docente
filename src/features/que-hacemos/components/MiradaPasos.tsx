"use client";

import Image from "next/image";
import { useRef } from "react";
import { ALIADOS } from "@/config/aliados";
import { MIRADA, MIRADA_INTRO } from "@/features/que-hacemos/areas";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { crearPasos } from "./mirada-pasos/coreografia-pasos";
import { ContenidoPaso } from "./mirada-pasos/ContenidoPaso";
import { IndicePasos } from "./mirada-pasos/IndicePasos";

/**
 * Cómo trabajamos, en los seis verbos que ED usa para contarse («La mirada
 * ED»: Escuchar, Investigar, Diseñar, Acompañar, Evaluar, Transformar).
 *
 * Va justo después del faro (Gastón, 2026-09-09), cuyo final es el velo
 * blanco del deslumbre: por eso la sección es blanca y la tarjeta gris. Con
 * fondo gris había un corte seco en la junta.
 *
 * UNA TARJETA, SEIS CONTENIDOS. Titular e índice de los seis pasos a la
 * izquierda, la tarjeta a la derecha y la banda de aliados al pie, todo
 * clavado a pantalla completa; el scroll no mueve la tarjeta sino lo que
 * dice: las letras del verbo se arman y desarman y la explicación entra y
 * sale palabra por palabra (`mirada-pasos/coreografia-pasos.ts`). El índice
 * es lo que sostiene la claridad: aunque se vea un paso por vez, siempre
 * está a la vista cuáles son los seis y en cuál se está.
 *
 * Es la tercera forma de esta sección en dos días. El mazo apilado dejaba
 * una sola tarjeta a la vista; la grilla con hilo mostraba las seis pero
 * no gustó. Facundo (2026-09-10) pidió esto: «una sola card y a medida que
 * hacemos scroll no cambia la card sino el contenido».
 *
 * En celular no hay pin: los seis pasos van uno debajo del otro dentro de
 * la misma tarjeta, en flujo normal, y el índice no se muestra.
 */
export function MiradaPasos() {
  const rootRef = useRef<HTMLElement | null>(null);

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    return crearPasos(root);
  }, []);

  return (
    <section
      ref={rootRef}
      id="como-trabajamos"
      data-indice="Cómo trabajamos"
      className="text-azul-principal flex scroll-mt-28 flex-col bg-white lg:min-h-svh"
    >
      <div className="mx-auto flex w-full max-w-[88rem] flex-1 flex-col px-5 py-20 md:px-10 md:py-24 lg:py-12">
        <div className="lg:grid lg:flex-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-center lg:gap-16">
          <header className="max-w-[46ch]">
            <h2
              className="font-display text-[2rem] font-bold tracking-[-0.02em] text-balance md:text-[2.75rem] lg:text-[3.25rem]"
              style={{ lineHeight: 1.1 }}
            >
              {MIRADA_INTRO.titulo}
            </h2>
            <p className="text-gris-texto mt-5 font-sans text-[1.05rem] leading-relaxed md:text-[1.15rem]">
              {MIRADA_INTRO.texto}
            </p>
            <IndicePasos />
          </header>

          {/* La tarjeta. `relative` porque en desktop la coreografía apila
              los contenidos adentro con posición absoluta, centrados a lo
              alto; el alto mínimo es para que la tarjeta tenga cuerpo aunque
              el paso sea corto. El borde no es decorado: sin él, gris sobre
              blanco se lee como una mancha. */}
          <div
            data-marco
            className="border-azul-principal/8 bg-gris-fondo relative mt-10 rounded-[1.25rem] border p-6 md:p-8 lg:mt-0 lg:min-h-[24rem] lg:p-10"
          >
            {MIRADA.map((p, i) => (
              <ContenidoPaso key={p.verbo} paso={p} n={i} />
            ))}
          </div>
        </div>

        {/* Al pie, cruzando las dos columnas. Los logos son los autorizados de
            config/aliados (AGENTS §5.4): los mismos que ya publican el pie y
            la home, con el mismo filtro que los pinta de blanco sobre navy. */}
        <div className="bg-azul-principal mt-12 rounded-[1.75rem] px-6 py-8 md:px-12 lg:mt-10">
          <p className="text-azul-claro/80 text-center font-sans text-[0.78rem] font-medium tracking-[0.22em] uppercase">
            Nos acompañan
          </p>
          <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-12 gap-y-5 md:gap-x-16">
            {ALIADOS.map((a) => (
              <li key={a.src} className="flex h-10 items-center">
                {/* El alto lo manda la clase y el ancho va `auto`: las medidas
                    del archivo (config/aliados) solo reservan la proporción. */}
                <Image
                  src={a.src}
                  alt={a.alt}
                  width={a.w}
                  height={a.h}
                  unoptimized={"vectorial" in a}
                  draggable={false}
                  className={`${a.alto.pie} w-auto opacity-75 [filter:brightness(0)_invert(1)]`}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
