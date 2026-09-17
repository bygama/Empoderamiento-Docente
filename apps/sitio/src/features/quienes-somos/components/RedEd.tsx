"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "@/components/ui/icons";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import type { SpecKey } from "./red/red-datos";
import { crearRed } from "./red/coreografia-red";
import { resaltarArea } from "./red/vuelo-fotos";
import { GrafoRed } from "./red/GrafoRed";
import { DockEspecialidad } from "./red/DockEspecialidad";

/**
 * "Quiénes sostienen ED" (sección 4 del sitemap de Qué es ED) — LA RED VIVA v4.
 *
 * Lámina BLANCA: texto arriba (centrado) y el GRAFO protagonista abajo —
 * ORGÁNICO, no rígido:
 *
 *  · Disposición ASIMÉTRICA (constelación real, no hexágono de manual).
 *  · Conexiones CURVAS (bezier con comba alternada, como trazo a mano).
 *  · Todos los nodos FLOTAN en deriva perpetua, cada uno a su ritmo — las
 *    curvas anclan al centro base y el punto (r≥12) siempre las cubre, así
 *    nada se despega jamás.
 *  · Se DIBUJA atado al scroll (scrub) por RADIOS y dash-offset (cero
 *    transforms de escala → cero desplazamientos). Reversible.
 *  · INTERACCIÓN: hover/clic en un nodo → crece su radio, etiqueta y curva en
 *    verde; las FOTOS de especialistas VUELAN del nodo al DOCK fijo de abajo
 *    (espacio reservado: nada se superpone).
 *
 * Mapeo especialidad→personas inferido del Equipo ED.docx — VALIDAR.
 * Reduced-motion / sin JS: grafo completo estático; dock por estado.
 *
 * Piezas: geometría y personas en `red/red-datos.ts`, dibujado y deriva en
 * `coreografia-red.ts`, highlight y vuelo en `vuelo-fotos.ts`, markup en
 * `GrafoRed` y `DockEspecialidad`.
 */
export function RedEd() {
  const rootRef = useRef<HTMLElement | null>(null);
  const [area, setArea] = useState<SpecKey | null>(null);
  const reduced = useReducedMotion();

  // ── Acople + encabezado + dibujado (scrub) + deriva perpetua ─────────────
  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return;
    return crearRed(root);
  }, [reduced]);

  // ── Interacción: highlight por RADIO/COLOR + vuelo de fotos al dock ───────
  useEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return; // el dock ya muestra el contenido por estado
    resaltarArea(root, area);
  }, [area, reduced]);

  return (
    <section
      ref={rootRef}
      id="red"
      className="bg-grain-light relative z-40 -mt-[4svh] overflow-clip rounded-t-[2.5rem] bg-gradient-to-b from-white to-gris-fondo/50 shadow-[0_-24px_60px_-30px_rgb(15_23_42/0.35)]"
      aria-label="Quiénes sostienen ED"
    >
      <div className="mx-auto max-w-screen-xl px-5 pt-24 pb-16 md:px-10 md:pt-32">
        {/* ── Texto ARRIBA, centrado ───────────────────────────────────────── */}
        <div className="mx-auto max-w-3xl text-center">
          <span data-red-head className="text-gris-texto font-mono text-[0.78rem] font-medium tracking-[0.24em] uppercase">
            Quiénes sostienen ED
          </span>
          <h2
            data-red-head
            className="font-display text-azul-principal mt-6 font-bold tracking-[-0.02em]"
            style={{ fontSize: "clamp(2.1rem, 1rem + 3.6vw, 3.6rem)", lineHeight: 1.08 }}
          >
            No somos un equipo fijo.
            <br />
            Somos una <span className="text-verde-concepto">red</span>.
          </h2>
          <p data-red-head className="text-gris-texto mx-auto mt-6 max-w-[58ch] font-sans text-[1rem] leading-relaxed md:text-[1.1rem]">
            Ante cada problemática no aplicamos una fórmula: reunimos a las
            personas especialistas indicadas y construimos la propuesta en
            conjunto.
          </p>
        </div>

        {/* ── El grafo ORGÁNICO ────────────────────────────────────────────── */}
        <GrafoRed setArea={setArea} />

        {/* ── El DOCK: espacio fijo y reservado — nada se superpone ────────── */}
        <DockEspecialidad area={area} />

        {/* ── Pie de sección ───────────────────────────────────────────────── */}
        <div className="mt-8 text-center">
          <p className="text-gris-texto font-sans text-[0.85rem] tracking-wide">
            Dirección general en Chile · especialistas en cinco países
          </p>
          <Link
            href="/que-hacemos"
            className="group text-verde-concepto mt-4 inline-flex items-center gap-2 font-sans text-[0.95rem] font-medium"
          >
            <span className="underline-offset-4 group-hover:underline">Mirá cómo se convoca esta red</span>
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
