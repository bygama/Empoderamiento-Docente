"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "@/components/ui/icons";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { acoplarLamina } from "./acople-lamina";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

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
 */

// ── Geometría orgánica (viewBox 1200×700) ──────────────────────────────────
const CX = 560;
const CY = 330;

const R = { specHalo: 22, specDot: 12, paisHalo: 13, paisDot: 7, edHalo: 52, edDot: 36 } as const;

const SPECS = [
  { key: "curriculum", label: "Currículum", x: 655, y: 100, d: "Diseños curriculares y su homologación." },
  { key: "evaluacion", label: "Evaluación", x: 880, y: 245, d: "Instrumentos, psicometría e impacto." },
  { key: "materiales", label: "Materiales", x: 815, y: 480, d: "Fichas, libros y guías para el aula." },
  { key: "tecnologia", label: "Tecnología", x: 560, y: 575, d: "Recursos y plataformas digitales." },
  { key: "modelacion", label: "Modelación", x: 315, y: 480, d: "La matemática de los contextos reales." },
  { key: "ia", label: "Inteligencia artificial", x: 285, y: 195, d: "Nuevas herramientas para enseñar y aprender." },
] as const;

type SpecKey = (typeof SPECS)[number]["key"];

const PAISES = [
  { label: "México", x: 430, y: 62 },
  { label: "Chile", x: 905, y: 92 },
  { label: "Argentina", x: 1058, y: 400 },
  { label: "Brasil", x: 705, y: 655 },
  { label: "Colombia", x: 128, y: 350 },
] as const;

// Quiénes se convocan por área (inferido de Equipo ED.docx — validar).
const AREA_PERSONAS: Record<SpecKey, Array<{ key: string; nombre: string }>> = {
  curriculum: [{ key: "judith-hernandez", nombre: "Judith Hernández" }],
  evaluacion: [
    { key: "marcela-cano", nombre: "Marcela Cano" },
    { key: "luis-cabrera", nombre: "Luis Cabrera" },
  ],
  materiales: [
    { key: "gabriela-buendia", nombre: "Gabriela Buendía" },
    { key: "wendolyne-rios", nombre: "Wendolyne Ríos" },
    { key: "darly-ku-euan", nombre: "Darly Ku-Euan" },
  ],
  tecnologia: [
    { key: "ivan-perez", nombre: "Iván Pérez" },
    { key: "eduardo-briceno", nombre: "Eduardo Briceño" },
  ],
  modelacion: [
    { key: "ivan-perez", nombre: "Iván Pérez" },
    { key: "pedro-vidal-szabo", nombre: "Pedro Vidal-Szabo" },
  ],
  ia: [],
};

// Curva con comba perpendicular (trazo orgánico, no regla)
const curve = (x1: number, y1: number, x2: number, y2: number, bow: number) => {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  return `M ${x1} ${y1} Q ${(mx + nx * bow).toFixed(1)} ${(my + ny * bow).toFixed(1)} ${x2} ${y2}`;
};

const pct = (x: number, y: number) => ({
  left: `${(x / 1200) * 100}%`,
  top: `${(y / 700) * 100}%`,
});

export function RedEd() {
  const rootRef = useRef<HTMLElement | null>(null);
  const [area, setArea] = useState<SpecKey | null>(null);
  const reduced = useReducedMotion();

  // ── Acople + encabezado + dibujado (scrub) + deriva perpetua ─────────────
  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return;

    const ctx = gsap.context(() => {
      // Acople sobre la lámina anterior (compartido con Origen y Mirada).
      acoplarLamina(root);

      const heads = gsap.utils.toArray<HTMLElement>("[data-red-head]");
      gsap.set(heads, { autoAlpha: 0, y: 24 });
      gsap.to(heads, {
        autoAlpha: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: root, start: "top 75%", once: true },
      });

      // Piezas
      const paths = gsap.utils.toArray<SVGPathElement>("[data-net-line]");
      const specHalos = gsap.utils.toArray<SVGCircleElement>("[data-spec-halo]");
      const specDots = gsap.utils.toArray<SVGCircleElement>("[data-spec-dot]");
      const specTexts = gsap.utils.toArray<SVGTextElement>("[data-spec-text]");
      const paisHalos = gsap.utils.toArray<SVGCircleElement>("[data-pais-halo]");
      const paisDots = gsap.utils.toArray<SVGCircleElement>("[data-pais-dot]");
      const paisTexts = gsap.utils.toArray<SVGTextElement>("[data-pais-text]");
      const edCircles = gsap.utils.toArray<SVGCircleElement>("[data-ed-circle]");
      const edText = root.querySelector<SVGTextElement>("[data-ed-text]");

      paths.forEach((l) => {
        const len = l.getTotalLength();
        gsap.set(l, { strokeDasharray: len, strokeDashoffset: len });
      });
      gsap.set([...specHalos, ...specDots, ...paisHalos, ...paisDots, ...edCircles], { attr: { r: 0 } });
      gsap.set([...specTexts, ...paisTexts, edText], { autoAlpha: 0 });

      const spokes = paths.filter((l) => l.dataset.kind === "spoke");
      const rings = paths.filter((l) => l.dataset.kind === "ring");
      const paisLines = paths.filter((l) => l.dataset.kind === "pais");

      const draw = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: "[data-red-graph]",
          start: "top 88%",
          end: "top 22%",
          scrub: true,
        },
      });
      draw
        .to(edCircles[0] ?? {}, { attr: { r: R.edHalo }, duration: 0.5, ease: "back.out(1.6)" }, 0)
        .to(edCircles[1] ?? {}, { attr: { r: R.edDot }, duration: 0.5, ease: "back.out(1.6)" }, 0.05)
        .to(edText, { autoAlpha: 1, duration: 0.3 }, 0.3)
        .to(spokes, { strokeDashoffset: 0, duration: 0.9, stagger: 0.12 }, 0.3)
        .to(specHalos, { attr: { r: R.specHalo }, duration: 0.4, ease: "back.out(2)", stagger: 0.12 }, 0.8)
        .to(specDots, { attr: { r: R.specDot }, duration: 0.4, ease: "back.out(2)", stagger: 0.12 }, 0.85)
        .to(specTexts, { autoAlpha: 1, duration: 0.35, stagger: 0.12 }, 0.95)
        .to(rings, { strokeDashoffset: 0, duration: 0.7, stagger: 0.08 }, 1.7)
        .to(paisLines, { strokeDashoffset: 0, duration: 0.8, stagger: 0.1 }, 2.1)
        .to(paisHalos, { attr: { r: R.paisHalo }, duration: 0.35, ease: "back.out(2)", stagger: 0.1 }, 2.6)
        .to(paisDots, { attr: { r: R.paisDot }, duration: 0.35, ease: "back.out(2)", stagger: 0.1 }, 2.65)
        .to(paisTexts, { autoAlpha: 1, duration: 0.3, stagger: 0.1 }, 2.75)
        .to({}, { duration: 0.4 }, 3.4);

      // ── DERIVA PERPETUA: cada nodo respira a su ritmo (solo translate de
      //    grupo — la curva ancla al centro base y el punto la cubre). ───────
      gsap.utils.toArray<SVGGElement>("[data-drift]").forEach((g, i) => {
        const ampX = 4 + ((i * 5) % 5);
        const ampY = 5 + ((i * 3) % 5);
        gsap.to(g, {
          x: i % 2 === 0 ? ampX : -ampX,
          y: i % 3 === 0 ? -ampY : ampY,
          duration: 3.2 + (i % 5) * 0.7,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
          delay: (i % 7) * 0.4,
        });
      });
    }, root);

    return () => ctx.revert();
  }, [reduced]);

  // ── Interacción: highlight por RADIO/COLOR + vuelo de fotos al dock ───────
  useEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return; // el dock ya muestra el contenido por estado

    gsap.to(root.querySelectorAll("[data-spec-halo]"), { attr: { r: R.specHalo }, duration: 0.3, overwrite: "auto" });
    gsap.to(root.querySelectorAll("[data-spec-dot]"), { attr: { r: R.specDot }, duration: 0.3, overwrite: "auto" });
    gsap.to(root.querySelectorAll("[data-spec-text]"), { fill: "#1f2d4d", duration: 0.25, overwrite: "auto" });
    gsap.to(root.querySelectorAll("[data-net-line][data-link-key]"), {
      stroke: "rgba(74,111,165,0.35)",
      strokeWidth: 1.5,
      duration: 0.25,
      overwrite: "auto",
    });
    if (!area) return;

    const halo = root.querySelector(`[data-spec-halo="${area}"]`);
    const dot = root.querySelector(`[data-spec-dot="${area}"]`);
    const text = root.querySelector(`[data-spec-text="${area}"]`);
    const line = root.querySelector(`[data-link-key="${area}"]`);
    if (halo) gsap.to(halo, { attr: { r: 30 }, duration: 0.35, ease: "back.out(2)", overwrite: "auto" });
    if (dot) gsap.to(dot, { attr: { r: 16 }, duration: 0.35, ease: "back.out(2)", overwrite: "auto" });
    if (text) gsap.to(text, { fill: "#1f9a78", duration: 0.25, overwrite: "auto" });
    if (line) gsap.to(line, { stroke: "#1f9a78", strokeWidth: 3, duration: 0.25, overwrite: "auto" });

    const dockBits = root.querySelectorAll<HTMLElement>("[data-dock-bit]");
    gsap.fromTo(
      dockBits,
      { autoAlpha: 0, y: 12 },
      { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.07, ease: "power3.out" },
    );

    const from = (dot as SVGCircleElement | null)?.getBoundingClientRect();
    const avs = root.querySelectorAll<HTMLElement>("[data-dock-av]");
    if (from) {
      const fx = from.left + from.width / 2;
      const fy = from.top + from.height / 2;
      avs.forEach((av, i) => {
        const r = av.getBoundingClientRect();
        gsap.fromTo(
          av,
          {
            x: fx - (r.left + r.width / 2),
            y: fy - (r.top + r.height / 2),
            scale: 0.25,
            autoAlpha: 0,
          },
          {
            x: 0,
            y: 0,
            scale: 1,
            autoAlpha: 1,
            duration: 0.55,
            ease: "power3.out",
            delay: i * 0.07,
            overwrite: "auto",
          },
        );
      });
    }
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
        <div
          data-red-graph
          className="relative mx-auto mt-8 w-full max-w-5xl md:mt-10"
          onMouseLeave={() => setArea(null)}
        >
          <svg viewBox="0 0 1200 700" className="h-auto w-full" role="img" aria-label="Red de especialidades y países de ED">
            {/* Conexiones curvas centro → especialidades */}
            {SPECS.map((s, i) => (
              <path
                key={`spoke-${s.key}`}
                data-net-line
                data-kind="spoke"
                data-link-key={s.key}
                d={curve(CX, CY, s.x, s.y, (i % 2 === 0 ? 1 : -1) * (16 + (i % 3) * 8))}
                fill="none"
                stroke="rgba(74,111,165,0.35)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            ))}
            {/* Malla suave entre especialidades vecinas */}
            {SPECS.map((s, i) => {
              const nx = SPECS[(i + 1) % SPECS.length];
              return (
                <path
                  key={`ring-${s.key}`}
                  data-net-line
                  data-kind="ring"
                  d={curve(s.x, s.y, nx.x, nx.y, (i % 2 === 0 ? -1 : 1) * (20 + (i % 2) * 10))}
                  fill="none"
                  stroke="rgba(74,111,165,0.13)"
                  strokeWidth="1"
                  strokeLinecap="round"
                />
              );
            })}
            {/* Conexiones curvas centro → países */}
            {PAISES.map((p, i) => (
              <path
                key={`pais-${p.label}`}
                data-net-line
                data-kind="pais"
                d={curve(CX, CY, p.x, p.y, (i % 2 === 0 ? -1 : 1) * (22 + (i % 3) * 9))}
                fill="none"
                stroke="rgba(31,154,120,0.25)"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            ))}

            {/* Nodos de especialidad (grupo con DERIVA — solo translate) */}
            {SPECS.map((s) => (
              <g key={`node-${s.key}`} data-drift>
                <circle data-spec-halo={s.key} cx={s.x} cy={s.y} r={R.specHalo} fill="rgba(31,154,120,0.1)" />
                <circle data-spec-dot={s.key} cx={s.x} cy={s.y} r={R.specDot} fill="#1f9a78" />
                <text
                  data-spec-text={s.key}
                  x={s.x}
                  y={s.y + (s.y >= CY ? 50 : -34)}
                  textAnchor="middle"
                  fill="#1f2d4d"
                  className="font-sans"
                  style={{ fontSize: "17px", fontWeight: 600 }}
                >
                  {s.label}
                </text>
              </g>
            ))}

            {/* Nodos de país (con deriva propia) */}
            {PAISES.map((p) => (
              <g key={`nodep-${p.label}`} data-drift>
                <circle data-pais-halo cx={p.x} cy={p.y} r={R.paisHalo} fill="rgba(74,111,165,0.13)" />
                <circle data-pais-dot cx={p.x} cy={p.y} r={R.paisDot} fill="#4a6fa5" />
                <text
                  data-pais-text
                  x={p.x}
                  y={p.y >= 620 ? p.y + 34 : p.y - 24}
                  textAnchor="middle"
                  className="fill-gris-texto font-mono"
                  style={{ fontSize: "13px", letterSpacing: "0.1em" }}
                >
                  {p.label.toUpperCase()}
                </text>
              </g>
            ))}

            {/* Nodo central ED (respira también) */}
            <g data-drift>
              <circle data-ed-circle cx={CX} cy={CY} r={R.edHalo} fill="rgba(31,154,120,0.1)" />
              <circle data-ed-circle cx={CX} cy={CY} r={R.edDot} fill="#1f9a78" />
              <text
                data-ed-text
                x={CX}
                y={CY + 9}
                textAnchor="middle"
                className="fill-white font-display"
                style={{ fontSize: "26px", fontWeight: 800, letterSpacing: "0.02em" }}
              >
                ED
              </text>
            </g>
          </svg>

          {/* Hotspots (hover/clic) — invisibles, sobre cada nodo */}
          {SPECS.map((s) => (
            <button
              key={`hs-${s.key}`}
              type="button"
              aria-label={`Ver especialistas de ${s.label}`}
              className="absolute z-30 h-20 w-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-verde-concepto"
              style={pct(s.x, s.y)}
              onMouseEnter={() => setArea(s.key)}
              onFocus={() => setArea(s.key)}
              onClick={() => setArea((a) => (a === s.key ? null : s.key))}
            />
          ))}
        </div>

        {/* ── El DOCK: espacio fijo y reservado — nada se superpone ────────── */}
        <div className="mx-auto mt-4 flex min-h-[8.5rem] max-w-3xl items-center justify-center">
          {area === null ? (
            <p className="text-gris-texto/70 text-center font-sans text-[0.95rem]">
              Pasá el cursor por una especialidad y mirá quiénes se convocan.
            </p>
          ) : (
            (() => {
              const spec = SPECS.find((s) => s.key === area)!;
              const personas = AREA_PERSONAS[area];
              return (
                <div
                  key={area}
                  className="border-azul-principal/8 flex w-full items-center gap-6 rounded-2xl border bg-white px-7 py-5 shadow-[0_18px_44px_-22px_rgb(31_45_77/0.25)]"
                >
                  {/* Las fotos aterrizan acá (vuelan desde el nodo) */}
                  {personas.length > 0 ? (
                    <div className="flex shrink-0 -space-x-3">
                      {personas.map((per) => (
                        <span
                          key={per.key}
                          data-dock-av
                          className="relative block h-14 w-14 overflow-hidden rounded-full shadow-[0_8px_20px_-8px_rgb(31_45_77/0.4)] ring-2 ring-white will-change-transform"
                        >
                          <Image src={`/equipo/${per.key}.jpg`} alt={per.nombre} fill sizes="56px" className="object-cover" />
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span
                      data-dock-av
                      className="bg-verde-concepto/10 text-verde-concepto font-display flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-[1rem] font-bold"
                    >
                      ED
                    </span>
                  )}
                  <div className="min-w-0 text-left">
                    <p data-dock-bit className="font-display text-azul-principal text-[1.05rem] leading-tight font-bold">
                      {spec.label}
                    </p>
                    <p data-dock-bit className="text-gris-texto mt-1 font-sans text-[0.88rem] leading-snug">
                      {spec.d}
                    </p>
                    <p data-dock-bit className="text-verde-concepto mt-1.5 font-sans text-[0.8rem] font-medium">
                      {personas.length > 0
                        ? personas.map((x) => x.nombre).join(" · ")
                        : "Red en expansión: especialistas según cada proyecto."}
                    </p>
                  </div>
                </div>
              );
            })()
          )}
        </div>

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
