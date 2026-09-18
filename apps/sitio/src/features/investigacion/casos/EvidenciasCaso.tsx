"use client";

import { useRef } from "react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import type { EvidenciaCaso } from "./data";
import type { TinteCarpeta } from "./data";
import { ROTULO_MICRO, TINTES } from "./tintes";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(Draggable);
}

/** Mismo criterio para crear el Draggable, el hint/⠿ y el micro-parallax. */
export const QUERY_PUNTERO_FINO = "(hover: hover) and (pointer: fine)";

type Props = {
  evidencias: readonly EvidenciaCaso[];
  tinte: TinteCarpeta;
};

/**
 * Disposición de collage (desktop): anchos y desfasajes variados para que
 * el campo se lea como material apoyado sobre la hoja, no como una grilla.
 * Tres tratamientos alternados: documento (blanco, borde), nota (post-it
 * de color) y ficha (blanco con franja superior). El `tono` da la variedad
 * material que tiene un archivo real — papeles celestes, verdes y del
 * tinte del caso conviven con los blancos (el naranja queda para CTAs).
 * Se cicla por índice, así cualquier cantidad de evidencias funciona.
 */
const DISPOSICION = [
  { ancho: "lg:w-[46%]", rot: -1.3, extra: "lg:mt-0", estilo: "documento", tono: "blanco" },
  { ancho: "lg:w-[34%]", rot: 2.2, extra: "lg:mt-20 lg:-ml-4", estilo: "nota", tono: "celeste" },
  { ancho: "lg:w-[40%]", rot: -2.4, extra: "lg:-mt-8", estilo: "ficha", tono: "blanco" },
  { ancho: "lg:w-[36%]", rot: 1.6, extra: "lg:mt-10 lg:ml-14", estilo: "nota", tono: "verde" },
  { ancho: "lg:w-[43%]", rot: -1.0, extra: "lg:-mt-12 lg:-ml-8", estilo: "documento", tono: "blanco" },
  { ancho: "lg:w-[33%]", rot: 2.6, extra: "lg:mt-4 lg:ml-10", estilo: "nota", tono: "suave" },
] as const;

/** Fondo del post-it según tono (texto navy sobre todos: AA holgado).
 *  Todos son fondos SÓLIDOS/claros: el collage vive sobre el cartón
 *  tintado de la carpeta y un tinte translúcido desaparecería. */
const FONDO_NOTA: Record<string, string | null> = {
  celeste: "bg-azul-claro/85",
  verde: "bg-[color-mix(in_srgb,var(--color-verde-concepto)_14%,white)]",
  suave: "bg-gris-fondo",
};

/** Cinta de la nota: contrasta con el fondo del papel que sujeta. */
const CINTA_NOTA: Record<string, string> = {
  celeste: "bg-white/55",
  verde: "bg-azul-claro/45",
  suave: "bg-azul-claro/45",
};

/**
 * Colección de evidencias del expediente. Placeholders editoriales
 * reemplazables por archivos reales. En desktop con puntero fino, las
 * marcadas como `movible` se pueden arrastrar dentro del área (GSAP
 * Draggable: z-index arriba al agarrar, límites en el contenedor). El
 * texto esencial del caso nunca vive acá. Al cambiar de caso el componente
 * se remonta (key) y las posiciones se reinician solas.
 */
export function EvidenciasCaso({ evidencias, tinte }: Props) {
  const areaRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();
  const punteroFino = useMediaQuery(QUERY_PUNTERO_FINO);
  const clases = TINTES[tinte];
  const arrastreActivo = punteroFino && !reduced;

  useIsomorphicLayoutEffect(() => {
    const area = areaRef.current;
    if (!area || reduced) return;
    // Drag solo con puntero fino (desktop): en touch, tocar eleva (CSS).
    if (!window.matchMedia(QUERY_PUNTERO_FINO).matches) return;

    const movibles = gsap.utils.toArray<HTMLElement>(
      area.querySelectorAll("[data-evidencia-movible]"),
    );
    const instancias = movibles.flatMap((el) =>
      Draggable.create(el, {
        type: "x,y",
        bounds: area,
        edgeResistance: 0.82,
        zIndexBoost: true,
        cursor: "grab",
        activeCursor: "grabbing",
        onPress() {
          gsap.to(el, { scale: 1.03, duration: 0.2, ease: "power2.out" });
        },
        onRelease() {
          gsap.to(el, { scale: 1, duration: 0.3, ease: "power2.out" });
        },
      }),
    );

    return () => {
      instancias.forEach((d) => d.kill());
      gsap.set(movibles, { clearProps: "x,y,scale,zIndex" });
    };
  }, [reduced, evidencias]);

  return (
    <div ref={areaRef} className="relative">
      <ul className="flex flex-col gap-5 lg:flex-row lg:flex-wrap lg:items-start lg:gap-x-[4%] lg:gap-y-0 lg:pb-6">
        {evidencias.map((evidencia, i) => {
          const capa = DISPOSICION[i % DISPOSICION.length];
          return (
            // Sin data-exp-bloque: el campo entero ya revela como unidad
            // (la sección padre lo lleva); anidar reveles multiplica fades.
            <li
              key={evidencia.id}
              {...(evidencia.movible ? { "data-evidencia-movible": "" } : {})}
              className={`relative w-full rounded-xl shadow-[0_16px_40px_-22px_rgb(31_45_77/0.4)] ${capa.ancho} ${capa.extra} ${
                capa.estilo === "nota"
                  ? `${FONDO_NOTA[capa.tono] ?? clases.suave} p-6`
                  : `border bg-white ${clases.borde} ${capa.estilo === "ficha" ? "overflow-hidden" : "p-6"}`
              } ${
                evidencia.movible
                  ? "touch-manipulation select-none active:z-30 active:scale-[1.02]"
                  : ""
              }`}
              style={{ rotate: `${capa.rot}deg`, zIndex: 10 - (i % 3) }}
            >
              {capa.estilo === "ficha" ? (
                <>
                  {/* azul-principal/70: gris-texto sobre fondos suave/gris
                      queda bajo 4.5:1 (AA texto chico) */}
                  <p
                    className={`${clases.suave} text-azul-principal/70 flex items-center justify-between px-6 py-2.5 ${ROTULO_MICRO}`}
                  >
                    {evidencia.rotulo}
                    {evidencia.movible && arrastreActivo && (
                      <span aria-hidden="true" className="opacity-60">⠿</span>
                    )}
                  </p>
                  <div className="p-6 pt-4">
                    <p className={`font-display text-[1rem] font-bold ${clases.acentoTexto}`}>
                      {evidencia.titulo}
                    </p>
                    {/* La ficha es solo carátula: la bajada queda para
                        lectores de pantalla (menos texto simultáneo). */}
                    <p className="sr-only">{evidencia.descripcion}</p>
                  </div>
                </>
              ) : capa.estilo === "nota" ? (
                <>
                  {/* Cinta adhesiva: la nota está pegada a la hoja */}
                  <span
                    aria-hidden="true"
                    className={`${CINTA_NOTA[capa.tono]} absolute -top-2.5 left-1/2 h-5 w-16 -translate-x-1/2 rotate-[-3deg] border border-white/60 shadow-sm`}
                  />
                  <p className={`${ROTULO_MICRO} text-azul-principal/70`}>
                    {evidencia.rotulo}
                    {evidencia.movible && arrastreActivo && (
                      <span className="ml-2 opacity-60" aria-hidden="true">⠿</span>
                    )}
                  </p>
                  <p className="font-hand text-azul-principal mt-2 text-[1.45rem] leading-[1.2] font-medium">
                    {evidencia.titulo.charAt(0) + evidencia.titulo.slice(1).toLowerCase()}
                  </p>
                  <p className="text-azul-principal/70 mt-1 font-sans text-[0.82rem] leading-relaxed">
                    {evidencia.descripcion}
                  </p>
                </>
              ) : (
                <>
                  {/* Perforación de archivo: marca gráfica ED */}
                  <span
                    aria-hidden="true"
                    className={`absolute top-3.5 right-3.5 h-2.5 w-2.5 rounded-full ${clases.suave} ring-1 ring-current/10`}
                  />
                  <p className={`${ROTULO_MICRO} text-gris-texto`}>
                    {evidencia.rotulo}
                    {evidencia.movible && arrastreActivo && (
                      <span className="ml-2 opacity-60" aria-hidden="true">⠿</span>
                    )}
                  </p>
                  <p className={`font-display mt-2.5 text-[1.1rem] font-bold ${clases.acentoTexto}`}>
                    {evidencia.titulo}
                  </p>
                  <p className="text-azul-principal/70 mt-1.5 font-sans text-[0.85rem] leading-relaxed">
                    {evidencia.descripcion}
                  </p>
                </>
              )}
            </li>
          );
        })}
      </ul>
      {arrastreActivo && (
        // Hereda el color de la superficie (blanco sobre cartón oscuro,
        // navy sobre cartón claro): lo fija el contenedor del expediente.
        <p className={`mt-7 opacity-80 ${ROTULO_MICRO}`}>
          ⠿ MATERIAL MOVIBLE
          <span className="sr-only">
            . Las piezas marcadas pueden moverse con el mouse para revisar el
            material; nada esencial depende de moverlas.
          </span>
        </p>
      )}
    </div>
  );
}
