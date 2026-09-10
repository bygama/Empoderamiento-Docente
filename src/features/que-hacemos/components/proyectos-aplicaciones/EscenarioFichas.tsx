"use client";

import { useRef } from "react";
import type { Capitulo } from "@/features/que-hacemos/proyectos";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { CINTA, ritmo } from "./proyectos-escena";
import { crearFichas } from "./coreografia-fichas";
import { CintaProyectos } from "./CintaProyectos";
import { LadoArchivo } from "./LadoArchivo";

/** Índice (dentro del lado) de la primera ficha de cada capítulo. */
function capInicio(capitulos: readonly Capitulo[]) {
  let i = 0;
  return capitulos.map((cap) => {
    const desde = i;
    i += cap.fichas.length;
    return desde;
  });
}

/**
 * El archivo en vivo: UNA zona alta que clava su escenario de una
 * pantalla, y adentro la víbora sobre un único trazo, y los dos lados del
 * archivo (`LadoArchivo`), uno por capítulo de fichas. La coreografía hace
 * el giro entre lado y lado sin costura.
 */
export function EscenarioFichas({
  lados,
  total,
}: {
  /** Los capítulos de cada lado: [lado A, lado B]. */
  lados: readonly [readonly Capitulo[], readonly Capitulo[]];
  /** Fichas del archivo entero. */
  total: number;
}) {
  const zoneRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [capsA, capsB] = lados;
  const fichasA = capsA.reduce((n, cap) => n + cap.fichas.length, 0);
  const fichasB = capsB.reduce((n, cap) => n + cap.fichas.length, 0);

  useIsomorphicLayoutEffect(() => {
    const zone = zoneRef.current;
    const stage = stageRef.current;
    if (!zone || !stage) return;
    let cleanup: (() => void) | undefined;
    const run = () =>
      crearFichas(zone, stage, { capInicioA: capInicio(capsA), capInicioB: capInicio(capsB) });
    if (document.fonts?.ready)
      document.fonts.ready.then(() => (cleanup = run()));
    else cleanup = run();
    return () => cleanup?.();
  }, [capsA, capsB]);

  return (
    <div
      ref={zoneRef}
      className="relative"
      style={{ height: `${ritmo(fichasA, fichasB).alto}svh` }}
    >
      {/* SIN overflow-clip a propósito: clavado, el escenario es la pantalla
          entera y nada se ve fuera; pero mientras sube y mientras se va, la
          víbora tiene que poder dibujarse más allá de sus bordes, para que
          sea el mismo cuerpo que el de Niveles arriba y para meterse
          debajo del cartel del cierre abajo. Las fichas que esperan abajo
          van con autoAlpha 0, no dependen del recorte. */}
      <div ref={stageRef} className="isolate sticky top-0 h-[100svh]">
        {/* La misma grilla de puntos de Niveles: la víbora cruza de una
            sección a la otra y el fondo no puede cambiar en la costura. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:radial-gradient(circle,color-mix(in_srgb,var(--color-azul-principal)_22%,transparent)_1.1px,transparent_1.6px)] [background-size:22px_22px]"
        />

        {/* La cámara: todo lo que se ve cuelga de acá, y la coreografía le
            hace el zoom de los dos solos. */}
        <div data-camara className="absolute inset-0">
          <CintaProyectos d={CINTA} />
          <div className="absolute inset-0 z-10 mx-auto w-full max-w-[88rem] px-5 md:px-10">
            <LadoArchivo lado="a" capitulos={capsA} desde={0} total={total} />
            <LadoArchivo lado="b" capitulos={capsB} desde={fichasA} total={total} />
          </div>
        </div>
      </div>
    </div>
  );
}
