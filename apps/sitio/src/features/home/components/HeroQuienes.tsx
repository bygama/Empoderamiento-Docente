"use client";

import { useEffect, useRef } from "react";
import { Hero } from "./Hero";
import { Manifiesto } from "./Manifiesto";
import { MisionPanel } from "./MisionPanel";
import { MathField } from "@/components/ui/MathField";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import type { Hero as ContenidoDelHero } from "@/features/home/contenido/hero";
import type { Mision } from "@/features/home/contenido/mision";
import type { QuienesSomos } from "@/features/home/contenido/quienes-somos";
import { crearQuienes } from "./hero-quienes/coreografia-quienes";
import { IndicadorQuienes } from "./hero-quienes/IndicadorQuienes";

/**
 * Secciones APILADAS verticalmente (sin slide horizontal). El campo de nodos
 * (MathField) es una capa PERSISTENTE detrás del hero y del panel. El Hero
 * scrollea normal; debajo, el panel se clava (sticky) y una LÍNEA VERDE barre de
 * derecha a izquierda: BORRA "¿Quiénes somos?" (clip desde la derecha) y revela
 * la "Misión" (clip desde la izquierda) en el mismo lugar, con la MISMA forma.
 * La barra mide el alto del bloque y se despliega desde el centro hacia los
 * extremos. Clips complementarios → no se solapan; la línea es la costura. Todo
 * en píxeles para que línea y borrado vayan pegados.
 * Respeta prefers-reduced-motion (capas apiladas en flow, sin animación).
 */
type Props = { hero: ContenidoDelHero; quienesSomos: QuienesSomos; mision: Mision };

export function HeroQuienes({ hero, quienesSomos, mision }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const zoneRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  // Progreso de scroll del hero (0 arriba → 1 cuando queda atrás). El campo de
  // nodos lo lee en cada frame para ir apagando nodos (cada vez menos).
  const heroScroll = useRef(0);
  const reduced = useReducedMotion();

  // La coreografía vive en hero-quienes/ (AI_GUIDELINES §2): relleno,
  // barrido e indicador, con la misma limpieza que antes.
  useEffect(() => {
    if (reduced) return;
    const wrap = wrapRef.current;
    const zone = zoneRef.current;
    const panel = panelRef.current;
    if (!wrap || !zone || !panel) return;
    return crearQuienes({ wrap, zone, panel, heroScroll });
  }, [reduced]);

  return (
    <div ref={wrapRef} className="relative isolate bg-gradient-to-b from-white via-white to-gris-fondo/40">
      {/* Nodos detrás del hero — NO sticky: scrollean con el hero y se quedan
          atrás al scrollear (no siguen al viewport). Cubren el alto del hero. */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[100svh] overflow-hidden opacity-40 lg:h-[93.75vw]"
        aria-hidden="true"
      >
        <MathField className="h-full w-full" scrollRef={heroScroll} />
      </div>

      {/* Hero — scrollea normal (sin slide). */}
      <div className="relative z-10">
        <Hero contenido={hero} />
      </div>

      {/* Quiénes somos → barrido verde → Misión (apilado debajo del hero).
          Bajo lg la zona es más corta: la escena suelta a las 2 pantallas. */}
      <div
        ref={zoneRef}
        id="quienes-somos"
        data-indice="Quiénes somos"
        // Bajo lg con menos de 620px de alto (celular apaisado) la escena no se
        // clava: todo en flujo, como con movimiento reducido (la coreografía
        // tampoco se arma ahí, ver la rama «bajo» en coreografia-quienes.ts).
        className="relative z-20 h-[340svh] max-lg:h-[300svh] max-lg:motion-reduce:h-auto motion-reduce:h-auto [@media(max-height:38.74rem)_and_(max-width:63.999rem)]:h-auto!"
      >
        <div className="sticky top-[var(--visor-arriba,0px)] h-[100svh] w-full overflow-hidden motion-reduce:static motion-reduce:h-auto [@media(max-height:38.74rem)_and_(max-width:63.999rem)]:static! [@media(max-height:38.74rem)_and_(max-width:63.999rem)]:h-auto!">
          <div ref={panelRef} className="relative h-full w-full motion-reduce:h-auto [@media(max-height:38.74rem)_and_(max-width:63.999rem)]:h-auto!">
            {/* Capa 1: Quiénes somos (se borra). */}
            <div data-about-layer className="h-full w-full motion-reduce:h-auto [@media(max-height:38.74rem)_and_(max-width:63.999rem)]:h-auto!">
              <Manifiesto contenido={quienesSomos} />
            </div>
            {/* Capa 2: Misión (se revela en el mismo lugar). */}
            <div data-mision-layer className="h-full w-full motion-reduce:h-auto [@media(max-height:38.74rem)_and_(max-width:63.999rem)]:h-auto!">
              <MisionPanel contenido={mision} />
            </div>
            {/* Línea-borrador verde: la costura del barrido (derecha → izquierda). */}
            <span
              data-wipe-line
              aria-hidden="true"
              className="bg-verde-concepto pointer-events-none absolute top-0 left-0 z-30 w-[3px] rounded-full opacity-0 shadow-[0_0_18px_rgba(31,154,120,0.55)]"
            />

            <IndicadorQuienes />
          </div>
        </div>
      </div>
    </div>
  );
}
