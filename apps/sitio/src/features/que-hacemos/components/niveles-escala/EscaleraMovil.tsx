"use client";

import { useRef, type ReactNode } from "react";
import type { NivelesDeQueHacemos } from "@/features/que-hacemos/contenido/niveles";
import { fragmentos } from "@/lib/contenido/resaltado";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { ALTO_ESCALERA_LVH, crearEscalera } from "./coreografia-escalera";

/**
 * «Niveles en los que intervenimos» en celular y tablet (< lg): la ESCALERA
 * (Gastón, 2026-09-26; antes, cinco tarjetas quietas). Una escena del alto
 * de la pantalla: primero la frase «Del aula al sistema educativo.» en
 * grande; después una cinta —la víbora de escritorio, dibujada acá adentro,
 * porque la capa fija se deforma en una pantalla vertical— baja en zigzag y
 * cada vez que toca un nodo enciende un nivel, de lo micro a lo macro. La
 * coreografía, en coreografia-escalera.ts. Los textos llegan por props,
 * los mismos de escritorio (contenido/niveles.ts o la base).
 */
export function EscaleraMovil({ contenido, frase }: { contenido: NivelesDeQueHacemos; frase: ReactNode }) {
  const zonaRef = useRef<HTMLElement | null>(null);

  useIsomorphicLayoutEffect(() => {
    const zona = zonaRef.current;
    if (!zona) return;
    let limpiar: (() => void) | undefined;
    let cancelado = false;
    const arrancar = () => {
      if (!cancelado) limpiar = crearEscalera(zona);
    };
    if (document.fonts?.ready) document.fonts.ready.then(arrancar);
    else arrancar();
    return () => {
      cancelado = true;
      limpiar?.();
    };
  }, []);

  return (
    // Una sección con nombre, como en escritorio: el h2 de la cabecera.
    <section
      ref={zonaRef}
      id="niveles"
      data-indice="Niveles"
      aria-labelledby="niveles-titulo"
      className="bg-gris-fondo relative"
      style={{ height: `${ALTO_ESCALERA_LVH}lvh` }}
    >
      <div className="sticky top-0 flex h-lvh flex-col overflow-clip bg-[radial-gradient(color-mix(in_srgb,var(--color-azul-claro)_55%,transparent)_1.2px,transparent_1.2px)] bg-[length:22px_22px] px-5 pt-[5.25rem] pb-5 md:px-10">
        {/* La frase grande de la apertura; decorativa, el h2 va abajo. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center px-5 md:px-10">
          <p
            data-esc-frase
            className="font-display text-azul-principal font-extrabold tracking-[-0.035em]"
            style={{ fontSize: "clamp(2.6rem, 1.6rem + 5vw, 4.4rem)", lineHeight: 1.02 }}
          >
            {frase}
          </p>
        </div>

        <div data-esc-cabecera style={{ opacity: 0 }}>
          <h2
            id="niveles-titulo"
            className="font-display text-azul-principal font-bold tracking-[-0.02em] text-balance"
            style={{ fontSize: "clamp(1.45rem, 1.1rem + 1.4vw, 1.9rem)", lineHeight: 1.1 }}
          >
            {fragmentos(contenido.titulo).map((f) =>
              f.resaltado ? (
                <span key={f.texto} className="text-verde-concepto-texto">
                  {f.texto}
                </span>
              ) : (
                f.texto
              ),
            )}
          </h2>
          <p className="text-gris-texto mt-2 max-w-[38ch] font-sans text-[0.92rem] leading-snug">
            {fragmentos(contenido.bajada).map((f) =>
              f.resaltado ? (
                <strong key={f.texto} className="text-azul-principal font-semibold">
                  {f.texto}
                </strong>
              ) : (
                f.texto
              ),
            )}
          </p>
        </div>

        {/* La escalera: cinco renglones iguales, alternando de lado. */}
        <div data-esc-escalera className="relative mt-4 grid min-h-0 flex-1 grid-rows-5 gap-2">
          <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
            <path data-esc-riel fill="none" strokeWidth="12" strokeLinecap="round" className="stroke-azul-claro/35" />
            <path data-esc-cinta fill="none" strokeWidth="12" strokeLinecap="round" className="stroke-azul-medio" />
            <circle data-esc-punta r="8" className="fill-verde-concepto" style={{ opacity: 0 }} />
          </svg>
          {contenido.niveles.map((niv, i) => {
            const izq = i % 2 === 0;
            return (
              <div key={niv.nombre} className={`relative flex items-center ${izq ? "justify-start pl-11" : "justify-end pr-11"}`}>
                <span
                  data-esc-nodo
                  aria-hidden="true"
                  className={`border-azul-medio bg-gris-fondo absolute top-1/2 h-4 w-4 -mt-2 rounded-full border-[3px] ${izq ? "left-[0.9rem]" : "right-[0.9rem]"}`}
                >
                  {/* Se enciende (opacidad) cuando la cinta lo toca. */}
                  <span data-esc-luz className="bg-verde-concepto absolute -inset-[3px] rounded-full opacity-0" />
                </span>
                <div
                  data-esc-nivel
                  className="border-azul-principal/8 w-[min(100%,20rem)] rounded-2xl border bg-white px-4 py-3 shadow-[0_1px_2px_rgb(31_45_77/0.04),0_20px_40px_-24px_rgb(31_45_77/0.3)]"
                  style={{ opacity: 0 }}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="bg-verde-concepto/10 text-verde-concepto-texto flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-mono text-[0.72rem] font-semibold">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="font-display text-azul-principal text-[1.08rem] leading-tight font-bold">{niv.nombre}</h3>
                  </div>
                  <p className="text-gris-texto mt-1.5 font-sans text-[0.86rem] leading-snug">{niv.texto}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
