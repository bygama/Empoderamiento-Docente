"use client";

import Image from "next/image";
import { useRef } from "react";
import { ALIADOS } from "@/config/aliados";
import { MIRADA, MIRADA_INTRO } from "@/features/que-hacemos/areas";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { crearMazo } from "./mirada-pasos/coreografia-mazo";

/**
 * Cómo trabajamos, en los seis verbos que ED usa para contarse («La mirada
 * ED»: Escuchar, Investigar, Diseñar, Acompañar, Evaluar, Transformar).
 *
 * Va justo después del faro (Gastón, 2026-09-09), cuyo final es el velo
 * blanco del deslumbre: por eso la sección es blanca y las tarjetas grises,
 * al revés que antes. Con fondo gris había un corte seco en la junta.
 *
 * ENTRA EN UNA PANTALLA, y el alto se REPARTE en vez de centrar un bloque
 * chico: medido a 1440x900 quedaban 201px de aire muerto arriba y otros 201
 * abajo —402 de 900— con el mazo apretado en el medio. Ahora la fila del
 * titular y el mazo se lleva el alto sobrante (`flex-1`) y la banda se apoya
 * en el pie.
 *
 * La sección se clava a pantalla completa y el scroll
 * va haciendo aparecer las tarjetas de la nada, una tras otra, sin que nada
 * se mueva de lugar: el titular a la izquierda, el mazo a la derecha y la
 * banda de aliados abajo quedan fijos todo el recorrido. La coreografía vive
 * en `mirada-pasos/coreografia-mazo.ts`.
 *
 * El mazo se arma con posición absoluta y un escalón de 1rem por tarjeta, así
 * las seis ocupan el alto de UNA sola y entran en el viewport. Todas miden
 * igual (`h-[calc(100%-5rem)]`): con altos distintos, las de abajo asomarían
 * por el pie y el mazo se leería como una escalera desprolija. Los textos lo
 * permiten —entre 98 y 130 caracteres— así que no se recorta nada.
 *
 * La tipografía de la tarjeta y del titular sube en `lg`. No es capricho: con
 * el cuerpo chico la tarjeta grande quedaba medio vacía —el texto terminaba
 * 160px antes del borde— y el conjunto se leía apretado justamente por eso,
 * por texto chico en cajas grandes.
 *
 * En celular no hay pin ni apilado: las tarjetas van una abajo de la otra, en
 * flujo normal. Clavar una sección a pantalla completa en un teléfono deja al
 * pulgar peleando para salir, y seis tarjetas superpuestas no entran.
 */
export function MiradaPasos() {
  const rootRef = useRef<HTMLElement | null>(null);

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    return crearMazo(root);
  }, []);

  return (
    <section
      ref={rootRef}
      id="como-trabajamos"
      data-indice="Cómo trabajamos"
      className="text-azul-principal flex scroll-mt-28 flex-col bg-white lg:min-h-svh"
    >
      <div className="mx-auto flex w-full max-w-[88rem] flex-1 flex-col px-5 py-20 md:px-10 md:py-24 lg:py-14">
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
          </header>

          {/* El mazo. El borde y la sombra no son decorado: sin ellos, dos
              tarjetas grises superpuestas se leen como una sola mancha y el
              canto de la de abajo desaparece. */}
          <ol className="mt-12 space-y-5 lg:relative lg:mt-0 lg:h-[24rem] lg:space-y-0">
            {MIRADA.map((p, i) => (
              <li
                key={p.verbo}
                data-mazo-tarjeta
                style={{ top: `${i}rem`, zIndex: i + 1 }}
                className="border-azul-principal/8 bg-gris-fondo rounded-[1.25rem] border p-6 shadow-[0_-8px_24px_-16px_rgb(31_45_77/0.35)] md:p-7 lg:absolute lg:p-8 lg:inset-x-0 lg:h-[calc(100%-5rem)]"
              >
                <p className="text-gris-texto font-mono text-[0.75rem] tracking-[0.18em] lg:text-[0.8rem]">
                  0{i + 1}
                </p>
                <h3 className="font-display mt-2 text-[1.45rem] font-bold tracking-[-0.01em] lg:mt-3 lg:text-[1.85rem]">
                  {p.verbo}
                </h3>
                <p className="text-verde-concepto-texto font-display mt-2 text-[1rem] font-semibold lg:mt-3 lg:text-[1.15rem]">
                  {p.idea}
                </p>
                <p className="text-azul-principal/80 mt-3 font-sans text-[0.95rem] leading-relaxed lg:mt-4 lg:text-[1.05rem]">
                  {p.texto}
                </p>
              </li>
            ))}
          </ol>
        </div>

        {/* Al pie, cruzando las dos columnas. Los logos son los autorizados de
            config/aliados (AGENTS §5.4): los mismos que ya publican el pie y
            la home, con el mismo filtro que los pinta de blanco sobre navy. */}
        <div className="bg-azul-principal mt-14 rounded-[1.75rem] px-6 py-8 md:px-12 lg:mt-10">
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
