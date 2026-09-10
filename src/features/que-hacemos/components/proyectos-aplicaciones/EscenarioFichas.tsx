"use client";

import { useRef } from "react";
import type { Capitulo } from "@/features/que-hacemos/proyectos";
import { PROYECTOS_INTRO } from "@/features/que-hacemos/proyectos";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { CINTA, CINTA_ESPEJO, ritmo } from "./proyectos-escena";
import { crearFichas } from "./coreografia-fichas";
import { CintaProyectos } from "./CintaProyectos";
import { ColumnaCapitulo } from "./ColumnaCapitulo";
import { FichaProyecto } from "./FichaProyecto";
import { TituloGrande } from "./TituloGrande";

const TITULO = "font-display mt-3 font-bold tracking-[-0.02em] text-balance";
const TITULO_ESTILO = {
  fontSize: "clamp(1.4rem, 1rem + 1.2vw, 1.9rem)",
  lineHeight: 1.1,
};

/**
 * Una mitad del archivo en vivo: una zona alta que clava su escenario de
 * una pantalla, y adentro la víbora, el encabezado, la columna del
 * capítulo y la pila de fichas. `espejo` la da vuelta entera: columna y
 * encabezado a la derecha, pila a la izquierda, la víbora por el trazo
 * espejado. El título grande de la sección solo va en la primera mitad;
 * en el espejo, el propio título del capítulo hace de relevo.
 */
export function EscenarioFichas({
  capitulos,
  desde,
  total,
  espejo,
}: {
  capitulos: readonly Capitulo[];
  /** Cuántas fichas van antes de esta mitad. */
  desde: number;
  /** Fichas del archivo entero. */
  total: number;
  espejo: boolean;
}) {
  const zoneRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const fichas = capitulos.flatMap((cap) => cap.fichas);

  useIsomorphicLayoutEffect(() => {
    const zone = zoneRef.current;
    const stage = stageRef.current;
    if (!zone || !stage) return;
    let inicio = 0;
    const capInicio = capitulos.map((cap) => {
      const i = inicio;
      inicio += cap.fichas.length;
      return i;
    });
    let cleanup: (() => void) | undefined;
    const run = () => crearFichas(zone, stage, { capInicio, desde, total, espejo });
    if (document.fonts?.ready)
      document.fonts.ready.then(() => (cleanup = run()));
    else cleanup = run();
    return () => cleanup?.();
  }, [capitulos, desde, total, espejo]);

  const lado = espejo ? "right-5 md:right-10" : "left-5 md:left-10";
  const ladoPila = espejo ? "left-5 md:left-10" : "right-5 md:right-10";

  return (
    <div
      ref={zoneRef}
      className="relative"
      style={{ height: `${ritmo(fichas.length, espejo).alto}svh` }}
    >
      <div ref={stageRef} className="isolate sticky top-0 h-[100svh] overflow-clip">
        {/* La misma grilla de puntos de Niveles: la víbora cruza de una
            sección a la otra y el fondo no puede cambiar en la costura. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:radial-gradient(circle,color-mix(in_srgb,var(--color-azul-principal)_22%,transparent)_1.1px,transparent_1.6px)] [background-size:22px_22px]"
        />

        {/* La cámara: todo lo que se ve cuelga de acá, y la coreografía le
            hace el zoom del tramo en solitario. */}
        <div data-camara className="absolute inset-0">
          <CintaProyectos d={espejo ? CINTA_ESPEJO : CINTA} />

          <div className="absolute inset-0 z-10 mx-auto w-full max-w-[88rem] px-5 md:px-10">
            {/* Encabezado: fijo arriba, del lado de la columna, y con su
                mismo borde. El h2 real va una sola vez. */}
            <header
              data-texto
              className={`absolute top-24 w-[min(38vw,34rem)] md:top-28 ${lado}`}
            >
              <p className="text-gris-texto font-sans text-[0.78rem] font-medium tracking-[0.22em] uppercase">
                {PROYECTOS_INTRO.volanta}
              </p>
              {espejo ? (
                <p aria-hidden="true" className={TITULO} style={TITULO_ESTILO}>
                  {PROYECTOS_INTRO.titulo}
                </p>
              ) : (
                <h2 className={TITULO} style={TITULO_ESTILO}>
                  {PROYECTOS_INTRO.titulo}
                </h2>
              )}
            </header>

            <ColumnaCapitulo
              capitulos={capitulos}
              desde={desde}
              total={total}
              espejo={espejo}
            />
            {!espejo && <TituloGrande />}

            {/* La pila de fichas, centrada, del lado opuesto a la columna. */}
            <div
              className={`absolute top-1/2 h-[30rem] w-[clamp(380px,34vw,40rem)] -translate-y-1/2 ${ladoPila}`}
            >
              {fichas.map((f, i) => (
                <FichaProyecto key={f.id} ficha={f} n={desde + i + 1} live />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
