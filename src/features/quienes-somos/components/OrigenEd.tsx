"use client";

import { useRef } from "react";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { crearOrigen } from "./origen/coreografia-origen";
import { PanelFotos } from "./origen/PanelFotos";
import { PilaresOrigen } from "./origen/PilaresOrigen";
import { TrayectoriaHorizontal } from "./origen/TrayectoriaHorizontal";
import { TrayectoriaVertical } from "./origen/TrayectoriaVertical";
import { BeatRemate } from "./origen/BeatRemate";

/**
 * "Origen, sentido y evolución" (sección 2 del sitemap de Qué es ED).
 * Lámina NAVY inmersiva que se ACOPLA sobre el hero (transición de sección:
 * sube con escala + esquinas redondeadas) y se CLAVA (sticky). Adentro, una
 * historia en 5 BEATS conducida 100% por el scroll (scrub — ida y vuelta):
 *
 *  0. "No nacimos de una teoría." — el pilar se ARMA mientras la lámina se
 *     acopla sobre el hero (regla que se dibuja + escalonado de etiqueta,
 *     título y cuerpo) y, al avanzar, las LETRAS ESTALLAN y se dispersan
 *     (cada char vuela con rotación propia).
 *  1. El punto de inflexión: la CITA de la profesora se LEVANTA EN 3D (flip
 *     desde el plano) y sus líneas suben por máscara.
 *  2. "¿Cómo fue tomando forma ED?" — se TIPEA carácter por carácter con el
 *     scroll (retroceder la des-tipea), con caret latiendo.
 *  3. Qué es ED: «Una convicción convertida en investigación y acción.» — el
 *     titular ES la definición (sin párrafo de apoyo); después la trayectoria
 *     se dibuja sola (línea SVG por dash-offset) y sus 5 hitos se activan al
 *     llegar el trazo: Maestría → Doctorado → México → Argentina → Hoy. En
 *     mobile la cronología es vertical (la línea crece hacia abajo).
 *  4. Remate: «Vivir para hacer vivir» — las palabras convergen desde el blur.
 *
 * Los beats 0–2 son los TRES PILARES (`PilaresOrigen`, sobre la cáscara
 * `Pilar`). Además: TILT 3D del panel siguiendo el mouse e indicador de
 * progreso de 5 puntos (cápsula naranja = beat activo, mismo idioma que el
 * home). El PANEL DE FOTOS (beats 0–2, solo desktop + motion) se cruza en
 * sincronía con el texto y despega antes del beat 3.
 *
 * Los cinco beats son hijos directos de `[data-story-tilt]`: la coreografía
 * los superpone con `position: absolute` y el tilt los inclina juntos.
 *
 * Contenido basado en los videos del cliente (resumen videos.txt §1–3). La
 * redacción exacta de la cita es una dramatización del testimonio del video 2
 * — VALIDAR con el cliente antes de publicar.
 * Reduced-motion / sin JS: los beats quedan apilados en flow, legibles.
 *
 * Piezas: contenido en `origen/data.ts`, clases compartidas en `estilos.ts`,
 * coreografía en `coreografia-origen.ts` (+ `estados-origen`,
 * `timeline-origen`, `panel-fotos`), markup en `PanelFotos`, `PilaresOrigen`,
 * `TrayectoriaHorizontal`, `TrayectoriaVertical` y `BeatRemate`.
 */
export function OrigenEd() {
  const rootRef = useRef<HTMLElement | null>(null);
  const zoneRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    const zone = zoneRef.current;
    if (!root || !zone || reduced) return;
    return crearOrigen(root, zone);
  }, [reduced]);

  return (
    <section
      ref={rootRef}
      id="origen"
      data-indice="Origen"
      className="bg-azul-principal relative z-20 -mt-[5svh] overflow-clip rounded-t-[2.5rem] text-white shadow-[0_-24px_60px_-30px_rgb(15_23_42/0.45)]"
      aria-label="Origen, sentido y evolución"
    >
      {/* Textura de puntos blanca muy sutil (motivo de marca sobre navy) */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:radial-gradient(circle,#fff_1.1px,transparent_1.6px)] [background-size:24px_24px]"
      />
      {/* Glow verde de fondo */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-[8%] left-1/2 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgb(31_154_120/0.14)_0%,transparent_65%)]"
      />

      <div ref={zoneRef} className="relative h-[560svh] motion-reduce:h-auto">
        <div className="sticky top-0 h-[100svh] w-full overflow-hidden motion-reduce:static motion-reduce:h-auto">
          <div
            data-story-tilt
            className="relative h-full w-full will-change-transform [transform-style:preserve-3d] motion-reduce:h-auto"
          >
            <PanelFotos />

            <PilaresOrigen />

            {/* ── BEAT 3: qué es ED (definición institucional) ────────────────
                Título grande (≈70% del titular de apertura) y la trayectoria
                con protagonismo: la definición la da el titular, sin párrafo
                de apoyo. Desktop: recorrido horizontal. Mobile: cronología
                vertical. ── */}
            <div
              data-beat="3"
              className="flex h-full flex-col items-center justify-center px-6 text-center motion-reduce:h-auto motion-reduce:py-24"
            >
              <span className="text-azul-claro/80 font-mono text-[0.78rem] font-medium tracking-[0.24em] uppercase">
                Qué es Empoderamiento Docente
              </span>
              <h3
                data-const-title
                className="font-display mt-5 max-w-[26ch] text-balance font-bold tracking-[-0.02em] text-white"
                style={{ fontSize: "clamp(1.7rem, 1rem + 2vw, 2.75rem)", lineHeight: 1.12 }}
              >
                Una convicción convertida en{" "}
                <span className="text-verde-concepto">investigación y acción</span>.
              </h3>

              <TrayectoriaHorizontal />
              <TrayectoriaVertical />
            </div>

            <BeatRemate />

            {/* Indicador de progreso de la historia (5 beats) */}
            <div
              className="absolute bottom-7 left-1/2 flex -translate-x-1/2 items-center gap-2.5 motion-reduce:hidden"
              aria-hidden="true"
            >
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} data-story-dot className="h-2 w-2 rounded-full bg-white/25" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
