"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { acoplarLamina } from "./acople-lamina";
import { PERSPECTIVAS } from "./mirada/constelacion-mirada";
import { leerEscena, prepararEstados } from "./mirada/setup-estados";
import { crearTimelineFases } from "./mirada/timeline-fases";
import { MapaConstelacion } from "./mirada/MapaConstelacion";
import { DetallePerspectiva } from "./mirada/DetallePerspectiva";
import { FichasPerspectiva } from "./mirada/FichasPerspectiva";
import { SintesisMirada } from "./mirada/SintesisMirada";
import { IndicadorFases } from "./mirada/IndicadorFases";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * "Nuestra mirada" (sección 3 del sitemap de Quiénes somos) — CONSTELACIÓN.
 *
 * Rediseño inspirado en la lógica espacial de nominal.so ("How it works"),
 * traducida al lenguaje editorial de ED: un mapa conceptual claro con
 * "NUESTRA MIRADA" como núcleo y tres nodos conectados (01 Pensamiento
 * matemático · 02 Empoderamiento desde el saber · 03 Transformación
 * educativa). El scroll conduce una cámara sobria (translate + scale del
 * escenario) que se acerca a cada nodo; su texto se revela en la zona
 * derecha de lectura y bajo el nodo se apilan FICHAS conceptuales que entran
 * de a una con el scroll (reversibles) y se quedan quietas. Al final la
 * cámara regresa al mapa completo, el núcleo se convierte en la SÍNTESIS y
 * las líneas se ramifican en una red incipiente (puntos nuevos) que hace de
 * puente hacia «La red tiene nombres» (ImpulsanEd, intacta).
 *
 * Colores del manual, solo acentos (fondo constante marfil/claro):
 *  01 verde-concepto · 02 azul-medio · 03 naranja-accion en dosis mínimas
 *  (mismo uso decorativo puntual que ya tienen el nodo "Hoy" y las cápsulas
 *  de progreso; el naranja dominante sigue reservado a CTAs).
 *
 * A11y / reduced-motion: la constelación (SVG + nodos visuales) es
 * decorativa (aria-hidden) y se oculta sin motion; el contenido real vive
 * en bloques en orden lógico del DOM que quedan apilados en flow. Las
 * fichas son <li> sin semántica de botón ni cursor pointer.
 *
 * Gate por viewport (`live`): la escena usa geometría proporcional al ancho
 * (zona de lectura en 32vw, pila de fichas bajo el nodo, cámara con tx en
 * fracciones de W) pensada para desktop — en móvil/tablet los textos se
 * pisaban y recortaban contra el borde. Bajo 1024px o sin hover se sirve el
 * MISMO layout estático del fallback de reduced-motion, ahora por clases
 * condicionales además de las variantes motion-reduce.
 *
 * El CTA «Mirá cómo lo hacemos» sigue retirado de esta transición (ruta
 * /que-hacemos viva en el nav).
 *
 * Piezas: contenido, geometría y tiempos en `mirada/constelacion-mirada.ts`;
 * la coreografía en dos mitades, `setup-estados.ts` (estados iniciales,
 * dueño de la posición de las fichas) y `timeline-fases.ts` (el timeline
 * maestro); el markup en `MapaConstelacion`, `DetallePerspectiva`,
 * `FichasPerspectiva`, `SintesisMirada` e `IndicadorFases`.
 */
export function MiradaEd() {
  const rootRef = useRef<HTMLElement | null>(null);
  const zoneRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();
  const [live, setLive] = useState(false);

  // La escena solo con puntero fino y ancho desktop real: a 768 los labels
  // de los nodos ya se montaban sobre la zona de lectura.
  useIsomorphicLayoutEffect(() => {
    if (reduced) return;
    if (!window.matchMedia("(hover: hover) and (min-width: 1024px)").matches) return;
    setLive(true);
  }, [reduced]);

  useIsomorphicLayoutEffect(() => {
    if (!live) return;
    const root = rootRef.current;
    const zone = zoneRef.current;
    if (!root || !zone) return;

    // Los tweens del indicador nacen en onUpdate (async): quedan fuera del
    // registro de gsap.context, así que se matan a mano en el cleanup.
    let dotEls: HTMLElement[] = [];

    const ctx = gsap.context(() => {
      const escena = leerEscena(root);
      if (!escena) return;
      dotEls = escena.dots;

      // ── Acople de la lámina clara sobre el navy de Origen (se conserva) ──
      // Origen arriba: sin él, escalar una sección de 780svh desde el centro
      // abre una banda de fondo crudo sobre el navy anterior (ver acople-lamina).
      acoplarLamina(root, { origen: "50% 0%" });

      prepararEstados(escena);
      crearTimelineFases(escena, zone);
    }, root);

    return () => {
      gsap.killTweensOf(dotEls);
      ctx.revert();
    };
  }, [live]);

  return (
    <section
      ref={rootRef}
      id="mirada"
      data-indice="Nuestra mirada"
      className="bg-grain-light to-gris-fondo/60 relative z-30 -mt-[4svh] overflow-clip rounded-t-[2.5rem] bg-gradient-to-b from-white shadow-[0_-24px_60px_-30px_rgb(15_23_42/0.35)]"
      aria-label="Nuestra mirada"
    >
      <div
        ref={zoneRef}
        className={"relative motion-reduce:h-auto " + (live ? "h-[910svh]" : "h-auto")}
      >
        <div
          className={
            "w-full motion-reduce:static motion-reduce:h-auto " +
            (live ? "sticky top-0 h-[100svh] overflow-hidden" : "")
          }
        >
          <MapaConstelacion live={live} />

          {/* ── Núcleo: apertura del mapa ─────────────────────────────────── */}
          <div
            data-centro
            className={
              "flex flex-col items-center justify-center px-6 text-center motion-reduce:h-auto motion-reduce:py-24 " +
              (live ? "h-full" : "h-auto py-24")
            }
          >
            <span
              data-centro-bit
              className="text-gris-texto font-mono text-[0.78rem] font-medium tracking-[0.24em] uppercase"
            >
              Nuestra mirada
            </span>
            <h2
              data-centro-bit
              className="font-display text-azul-principal mt-5 max-w-[16ch] text-balance font-bold tracking-[-0.02em]"
              style={{ fontSize: "clamp(2.1rem, 1rem + 3.6vw, 3.6rem)", lineHeight: 1.08 }}
            >
              Una misma mirada, tres{" "}
              <span className="text-verde-concepto">principios</span>.
            </h2>
          </div>

          {/* ── Zonas de lectura + fichas por principio ───────────────────── */}
          {PERSPECTIVAS.map((p, i) => (
            <div key={p.id} className="contents">
              <DetallePerspectiva p={p} i={i} live={live} />
              <FichasPerspectiva p={p} i={i} live={live} />
            </div>
          ))}

          <SintesisMirada live={live} />
          <IndicadorFases live={live} />
        </div>
      </div>
    </section>
  );
}
