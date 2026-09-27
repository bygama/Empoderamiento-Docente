"use client";

import { useRef } from "react";
import { partirResaltado } from "@/lib/contenido/resaltado";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { Bajada } from "./Bajada";
import { FichaProyecto } from "./FichaProyecto";
import type { IntroDelArchivo } from "./LadoArchivo";
import { TituloPractica } from "./TituloPractica";
import type { Capitulo, Ficha } from "./fichas";
import { ALTO_MOVIL_LVH, crearFichasMovil } from "./coreografia-fichas-movil";

/**
 * «Así se ve en la práctica» en celular y tablet (< lg): el mismo archivo de
 * fichas de escritorio, en vertical (Gastón, 2026-09-26; antes eran ocho
 * fichas altas en una columna, unas seis pantallas quietas). Una escena del
 * alto de la pantalla (lvh: que Safari no deje franja al esconder su barra)
 * con el título grande de entrada; después, arriba, el capítulo con su
 * bajada y el contador, y abajo la pila: cada ficha sube, se endereza y se
 * posa inclinada, y las anteriores retroceden. Al cambiar de capítulo la
 * pila se va por arriba. La coreografía, en coreografia-fichas-movil.ts.
 */
export function PilaFichasMovil({
  intro,
  capitulos,
  fichas,
}: {
  intro: IntroDelArchivo;
  capitulos: readonly Capitulo[];
  fichas: readonly Ficha[];
}) {
  const zonaRef = useRef<HTMLDivElement | null>(null);

  useIsomorphicLayoutEffect(() => {
    const zona = zonaRef.current;
    if (!zona) return;
    // Con la tipografía definitiva: las fichas se miden para que entren.
    let limpiar: (() => void) | undefined;
    let cancelado = false;
    const arrancar = () => {
      if (!cancelado) limpiar = crearFichasMovil(zona);
    };
    if (document.fonts?.ready) document.fonts.ready.then(arrancar);
    else arrancar();
    return () => {
      cancelado = true;
      limpiar?.();
    };
  }, []);

  const volanta = partirResaltado(intro.volanta);

  return (
    <div ref={zonaRef} className="relative" style={{ height: `${ALTO_MOVIL_LVH}lvh` }}>
      <div
        data-pm-escena
        className="bg-gris-fondo sticky top-0 h-lvh overflow-clip bg-[radial-gradient(color-mix(in_srgb,var(--color-azul-claro)_55%,transparent)_1.2px,transparent_1.2px)] bg-[length:22px_22px]"
      >
        {/* El título grande, solo, antes de las fichas. */}
        <div className="absolute inset-0 flex items-center px-5 md:px-10">
          {/* Nombra la sección (aria-labelledby de ProyectosAplicaciones), como
              el título de escritorio: en celular es el único que existe. */}
          <h2
            id="proyectos-titulo"
            data-pm-intro
            className="font-display font-bold tracking-[-0.03em] text-balance"
            style={{ fontSize: "clamp(2.6rem, 1.8rem + 4vw, 4rem)", lineHeight: 1.05, opacity: 0 }}
          >
            <TituloPractica titulo={intro.titulo} />
          </h2>
        </div>

        <div className="absolute inset-x-5 top-[5.25rem] bottom-3 flex flex-col gap-3.5 md:inset-x-10 md:top-[max(5.25rem,10svh)] md:bottom-8">
          <div data-pm-cabecera style={{ opacity: 0 }}>
            <div className="flex items-baseline justify-between gap-4">
              <p className="font-display text-[0.9rem] font-bold">
                {volanta.antes}
                {volanta.clave !== null && <span className="text-azul-medio">{volanta.clave}</span>}
                {volanta.despues}
              </p>
              <p data-pm-contador className="text-gris-texto font-mono text-[0.78rem] tabular-nums tracking-[0.1em]">
                01 / {String(fichas.length).padStart(2, "0")}
              </p>
            </div>
            {/* Los tres capítulos en la misma celda: la cabecera mide lo que
                el más alto, así la pila no salta al cambiar. */}
            <div className="mt-2 grid">
              {capitulos.map((cap, c) => (
                <div key={cap.id} data-pm-cap={c} className="col-start-1 row-start-1" style={{ opacity: 0 }}>
                  <h3 className="font-display text-[clamp(1.45rem,1.1rem+1.6vw,2rem)] leading-[1.1] font-extrabold tracking-[-0.03em] text-balance">
                    {cap.titulo}
                  </h3>
                  <Bajada cap={cap} className="text-gris-texto mt-2 max-w-[48ch] font-sans text-[0.92rem] leading-snug" />
                </div>
              ))}
            </div>
          </div>

          {/* Arriba, lugar para las pestañas de las fichas de atrás (hasta 30px). */}
          <div data-pm-pila className="relative min-h-0 flex-1 pt-8">
            <div data-pm-pila-interior className="relative mx-auto max-w-[30rem]">
              {fichas.map((f, i) => (
                <FichaProyecto key={f.id} ficha={f} n={i + 1} live compacta />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
