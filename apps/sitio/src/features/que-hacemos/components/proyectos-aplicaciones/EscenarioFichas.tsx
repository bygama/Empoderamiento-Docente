"use client";

import { useRef } from "react";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { ritmo } from "./proyectos-escena";
import { crearFichas } from "./coreografia-fichas";
import type { Capitulo } from "./fichas";
import { LadoArchivo, type IntroDelArchivo } from "./LadoArchivo";

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
 * pantalla, y adentro los dos lados del archivo (`LadoArchivo`), uno por
 * capítulo de fichas. La coreografía hace el giro entre lado y lado. La
 * víbora vive en la capa fija de la página (`../vibora/`).
 */
export function EscenarioFichas({
  intro,
  lados,
  total,
}: {
  /** La volanta y el título de la sección, con su parte resaltada entre dobles asteriscos. */
  intro: IntroDelArchivo;
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
    // Con la tipografía definitiva. Si el efecto se limpia antes de que
    // carguen (el doble montaje del modo estricto en dev), la coreografía
    // NO se crea igual: quedaban dos timelines sobre los mismos elementos y,
    // al volver a subir, los textos del lado B se quedaban a medio fundir
    // sobre el lado A (Gastón, 2026-09-11).
    let cleanup: (() => void) | undefined;
    let cancelado = false;
    const arrancar = () => {
      if (!cancelado)
        cleanup = crearFichas(zone, stage, { capInicioA: capInicio(capsA), capInicioB: capInicio(capsB) });
    };
    if (document.fonts?.ready) document.fonts.ready.then(arrancar);
    else arrancar();
    return () => {
      cancelado = true;
      cleanup?.();
    };
  }, [capsA, capsB]);

  return (
    <div
      ref={zoneRef}
      className="relative"
      style={{ height: `${ritmo(fichasA, fichasB).alto}svh` }}
    >
      {/* Transparente y sin grilla: el gris lo pone el body, la grilla y la
          víbora la capa fija de la página, por debajo. */}
      <div ref={stageRef} className="isolate sticky top-[var(--visor-arriba,0px)] h-[100svh] overflow-clip">
        {/* La cámara: todo lo que se ve cuelga de acá, y la coreografía le
            hace el zoom de los dos solos. */}
        <div data-camara className="absolute inset-0">
          <div className="absolute inset-0 z-10 mx-auto w-full max-w-[88rem] px-5 md:px-10">
            <LadoArchivo lado="a" intro={intro} capitulos={capsA} desde={0} total={total} />
            <LadoArchivo lado="b" intro={intro} capitulos={capsB} desde={fichasA} total={total} />
          </div>
        </div>
      </div>
    </div>
  );
}
