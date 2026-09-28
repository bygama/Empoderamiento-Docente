"use client";

import { useRef, useState } from "react";
import type { OrigenDeQuienesSomos } from "@/features/quienes-somos/contenido/origen";
import { partirResaltado } from "@/lib/contenido/resaltado";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { ALTO_CAPITULOS_LVH, crearCapitulosMovil } from "./origen/capitulos-movil";
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
 * Piezas: los textos y las fotos llegan por props
 * (`contenido/origen.ts` o la base), la estructura en `origen/data.ts`,
 * las clases compartidas en `estilos.ts`,
 * coreografía en `coreografia-origen.ts` (+ `estados-origen`,
 * `timeline-origen`, `panel-fotos`), markup en `PanelFotos`, `PilaresOrigen`,
 * `TrayectoriaHorizontal`, `TrayectoriaVertical` y `BeatRemate`.
 *
 * Tres modos (`data-modo`), igual gramática que Niveles/Proyectos en Qué
 * hacemos: `vivo` (≥ 1024px, también táctil) corre la lámina fija de arriba
 * sin cambios; `movil` (bajo 1024px con alto suficiente) reemplaza los
 * gestos de escritorio por el PASADOR DE CAPÍTULOS (`capitulos-movil.ts`):
 * los mismos cinco beats, uno por pantalla, conducidos por el scroll de su
 * propia zona; `quieto` (motion reducido o pantalla muy baja) deja los
 * beats en flujo, sin pin ni animación.
 */
export function OrigenEd({ contenido }: { contenido: OrigenDeQuienesSomos }) {
  const { queEs, remate } = contenido;
  const definicion = partirResaltado(queEs.titulo);
  const rootRef = useRef<HTMLElement | null>(null);
  const zoneRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();
  // Arranca en "vivo": es el HTML que el sitio sirve hoy (SSR y primer
  // render, sin JS) — mismas clases, byte a byte. El efecto de modo lo baja
  // a "movil"/"quieto" ANTES del primer paint post-hidratación cuando
  // corresponde (layout effect, no hay flash de escritorio en celular).
  const [modo, setModo] = useState<"quieto" | "vivo" | "movil">("vivo");

  useIsomorphicLayoutEffect(() => {
    const decidir = () => {
      if (reduced) return setModo("quieto");
      if (window.matchMedia("(min-width: 1024px)").matches) return setModo("vivo");
      if (window.matchMedia("(max-width: 63.999rem) and (min-height: 38.75rem)").matches) {
        return setModo("movil");
      }
      setModo("quieto");
    };
    decidir();
    // ≥ 1024 corre la historia de escritorio como siempre (también táctil).
    const mqVivo = window.matchMedia("(min-width: 1024px)");
    const mqMovil = window.matchMedia("(max-width: 63.999rem) and (min-height: 38.75rem)");
    mqVivo.addEventListener("change", decidir);
    mqMovil.addEventListener("change", decidir);
    return () => {
      mqVivo.removeEventListener("change", decidir);
      mqMovil.removeEventListener("change", decidir);
    };
  }, [reduced]);

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    const zone = zoneRef.current;
    if (!root || !zone) return;
    if (modo === "vivo") return crearOrigen(root, zone);
    if (modo === "movil") return crearCapitulosMovil(root, zone);
  }, [modo]);

  return (
    <section
      ref={rootRef}
      id="origen"
      data-indice="Origen"
      data-modo={modo}
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

      <div
        ref={zoneRef}
        data-origen-zona
        className={
          "relative " +
          (modo === "vivo" ? "h-[560svh] " : modo === "quieto" ? "h-auto " : "") +
          "motion-reduce:h-auto"
        }
        style={modo === "movil" ? { height: `${ALTO_CAPITULOS_LVH}lvh` } : undefined}
      >
        <div
          data-origen-escena
          className={
            "top-0 w-full overflow-hidden motion-reduce:static motion-reduce:h-auto " +
            (modo === "movil" ? "sticky h-lvh" : modo === "quieto" ? "static h-auto" : "sticky h-[100svh]")
          }
        >
          <div
            data-story-tilt
            className={
              "relative h-full w-full [transform-style:preserve-3d] motion-reduce:h-auto" +
              (modo === "quieto" ? " h-auto" : "")
            }
          >
            <PanelFotos fotos={contenido.fotos} />

            <PilaresOrigen contenido={contenido} />

            {/* ── BEAT 3: qué es ED (definición institucional) ────────────────
                Título grande (≈70% del titular de apertura) y la trayectoria
                con protagonismo: la definición la da el titular, sin párrafo
                de apoyo. Desktop: recorrido horizontal. Mobile: cronología
                vertical. ── */}
            <div
              data-beat="3"
              className="flex h-full flex-col items-center justify-center px-6 text-center motion-reduce:h-auto motion-reduce:py-24 [[data-modo=quieto]_&]:h-auto max-lg:[[data-modo=quieto]_&]:py-16"
            >
              <span className="text-azul-claro/80 font-mono text-[0.78rem] font-medium tracking-[0.24em] uppercase">
                {queEs.volanta}
              </span>
              <h3
                data-const-title
                className="font-display mt-5 max-w-[26ch] text-balance font-bold tracking-[-0.02em] text-white"
                style={{ fontSize: "clamp(1.7rem, 1rem + 2vw, 2.75rem)", lineHeight: 1.12 }}
              >
                {definicion.antes}
                {definicion.clave === null ? null : <span className="text-verde-concepto">{definicion.clave}</span>}
                {definicion.despues}
              </h3>

              <TrayectoriaHorizontal hitos={queEs.hitos} />
              <TrayectoriaVertical hitos={queEs.hitos} />
            </div>

            <BeatRemate frase={remate.frase} texto={remate.texto} />

            {/* Indicador de progreso de la historia (5 beats) */}
            <div
              className="absolute bottom-7 left-1/2 flex -translate-x-1/2 items-center gap-2.5 motion-reduce:hidden [[data-modo=quieto]_&]:hidden"
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
