"use client";

import { useRef } from "react";
import gsap from "gsap";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ButtonPrimary } from "@/components/ui/ButtonPrimary";
import { ButtonSecondary } from "@/components/ui/ButtonSecondary";
import { PUNTOS } from "./constelacion";
import { LinternaFaro } from "./LinternaFaro";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { crearAscenso } from "./coreografia-cierre";

/**
 * Los 13 puntos de la constelación del hero, de vuelta como estrellas
 * alrededor de la linterna (coordenadas del cielo, viewBox 1440x900). El haz
 * las va tocando al girar (coreografia-cierre: sin tocar → iluminada →
 * tocada). El naranja —el personaje— vive a la derecha, bajo: es el último
 * que la luz toca antes de posarse sobre el cierre.
 */
const ESTRELLAS: ReadonlyArray<readonly [number, number]> = [
  [396, 262],
  [484, 176],
  [572, 128],
  [660, 96],
  [808, 88],
  [900, 118],
  [988, 172],
  [1060, 258],
  [352, 372],
  [1096, 372],
  [440, 470],
  [776, 150],
  [1190, 330],
];

/** Estrellas de fondo: escasas, alineadas al grid de 44px del manual §6. */
const CIELO: ReadonlyArray<readonly [number, number, number]> = [
  [88, 132, 1.2],
  [220, 88, 0.9],
  [308, 220, 1.1],
  [176, 352, 0.8],
  [528, 44, 1],
  [704, 44, 0.9],
  [880, 44, 1.2],
  [1144, 88, 1],
  [1276, 176, 0.9],
  [1364, 308, 1.1],
  [1232, 440, 0.8],
  [132, 484, 1],
  [1320, 528, 0.9],
  [44, 264, 0.9],
  [1408, 132, 0.8],
];

/**
 * Sección 8 — Cierre, absorbiendo la Conexión con Biblioteca (§9 y §10 de
 * docs/content/arquitectura-investigacion.md). Es una INVITACIÓN, no una
 * lectura: eyebrow + título + botón de cada lado, y la luz haciendo el resto.
 *
 * «Cae la noche sobre el archivo»: la hoja llega enmarcada como la hoja 01
 * del hero y, al pinnearse, el marco se disuelve y el navy se expande hasta
 * los bordes. Sube el faro —el mismo de Qué hacemos, recortado y grande—
 * plantado en el piso y DELANTE de la palabra que el hero prometió
 * («Investigamos para… transformar»), gira, se enciende arriba y el haz lee
 * de costado: primero se posa sobre la Biblioteca, después sobre el cierre.
 * Los 13 puntos del hero vuelven como estrellas y la luz los va tocando.
 *
 * El SSR renderiza el último frame (todo encendido y en su lugar): es lo que
 * ven touch y reduced-motion. La coreografía (desktop con puntero) vive en
 * coreografia-cierre.ts.
 */
export function CierreInvestigacion() {
  const zonaRef = useRef<HTMLDivElement | null>(null);
  const hojaRef = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    if (reduced) return;
    // 64rem = el `lg:` de Tailwind v4 (la linterna solo existe desde lg).
    if (!window.matchMedia("(hover: hover) and (min-width: 64rem)").matches)
      return;
    const zona = zonaRef.current;
    const hoja = hojaRef.current;
    if (!zona || !hoja) return;

    let restaurar = () => {};
    const ctx = gsap.context(() => {
      const escena = crearAscenso({ zona, hoja });
      restaurar = escena.restaurar;
      // Llegar por el ancla #biblioteca no puede aterrizar en la hoja a
      // oscuras: saltar al final del pin, con la historia ya contada.
      if (window.location.hash === "#biblioteca") {
        const st = escena.tl.scrollTrigger;
        if (st) requestAnimationFrame(() => window.scrollTo(0, st.end));
      }
    }, zona);
    return () => {
      ctx.revert();
      restaurar();
    };
  }, [reduced]);

  return (
    <div ref={zonaRef} data-footer-dock-tint="azul">
      <section
        ref={hojaRef}
        aria-label="Cierre e invitación a conversar"
        className="bg-azul-principal bg-grain-dark relative isolate flex min-h-[100svh] overflow-hidden text-white"
      >
        {/* ── El cielo: cae la noche sobre el archivo. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <span
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, color-mix(in srgb, var(--color-azul-principal) 58%, black) 0%, var(--color-azul-principal) 46%, color-mix(in srgb, var(--color-azul-principal) 76%, black) 100%)",
            }}
          />
          {/* Resplandor de la linterna sobre el cielo (la luz vive ahí). */}
          <span
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(38% 34% at 50% 44%, color-mix(in srgb, var(--color-azul-claro) 22%, transparent), transparent 70%)",
            }}
          />
          <svg
            viewBox="0 0 1440 900"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 h-full w-full"
          >
            {CIELO.map(([x, y, r]) => (
              <circle key={`c-${x}-${y}`} cx={x} cy={y} r={r} fill="white" opacity="0.28" />
            ))}
            {ESTRELLAS.map(([x, y], i) => (
              <circle
                key={`e-${i}`}
                data-cierre-estrella
                cx={x}
                cy={y}
                r={PUNTOS[i].r * 0.95}
                fill={PUNTOS[i].color}
              />
            ))}
          </svg>
        </div>

        {/* ── El marco: la hoja llega enmarcada (como la hoja 01) y la noche
            lo disuelve al pinnearse. Invisible si la coreografía no corre. */}
        <div
          aria-hidden="true"
          data-cierre-marco
          className="pointer-events-none invisible absolute inset-2.5 z-40 rounded-xl opacity-0"
          style={{ boxShadow: "0 0 0 2rem var(--color-gris-fondo)" }}
        />

        {/* Folio: la hoja 01 abrió el archivo; esta lo cierra. */}
        <span className="text-azul-claro/60 absolute top-7 right-8 z-30 hidden font-mono text-[0.68rem] tracking-[0.2em] uppercase lg:block">
          Archivo ED · Última hoja
        </span>

        {/* ── La palabra gigante, detrás de todo: el hero dijo «Investigamos
            para…»; acá está el resto. */}
        <span
          aria-hidden="true"
          data-cierre-palabra
          className="font-display pointer-events-none absolute right-0 bottom-0 left-0 z-20 text-center font-extrabold tracking-[-0.045em] whitespace-nowrap select-none"
          style={{
            fontSize: "clamp(4.2rem, 15.4vw, 12.6rem)",
            lineHeight: 0.78,
            bottom: "-0.16em",
            color: "color-mix(in srgb, var(--color-azul-claro) 13%, transparent)",
          }}
        >
          transformar
        </span>

        {/* ── El faro, plantado en el piso y DELANTE de la palabra (como el
            unicornio delante del wordmark). El ancho escala con el alto para
            que la linterna quede a la altura de los mensajes en cualquier
            pantalla. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 hidden justify-center lg:flex">
          <div data-cierre-linterna className="w-[clamp(168px,26svh,236px)]">
            <LinternaFaro className="block h-auto w-full" />
          </div>
        </div>

        {/* ── Los dos mensajes que la luz lee de costado: invitaciones. */}
        <div className="relative z-30 mx-auto grid min-h-[100svh] w-full max-w-screen-xl items-center gap-x-8 gap-y-14 px-6 py-24 md:px-12 lg:grid-cols-[1fr_minmax(200px,17vw)_1fr] lg:gap-x-6">
          {/* Primera parada del haz: dónde vive lo que investigamos. */}
          <div id="biblioteca" data-cierre-bloque className="max-w-[30rem] lg:max-w-none lg:justify-self-end">
            <Eyebrow variant="light">Producción académica</Eyebrow>
            <h2
              data-cierre-titulo
              className="font-display text-azul-claro mt-5 font-extrabold tracking-[-0.02em] text-balance"
              style={{ fontSize: "clamp(1.6rem, 0.8rem + 1.5vw, 2.1rem)", lineHeight: 1.08 }}
            >
              La investigación también se comparte.
            </h2>
            <div className="mt-7">
              <ButtonSecondary href="/biblioteca" variant="dark" withArrow>
                Explorá la Biblioteca
              </ButtonSecondary>
            </div>
          </div>

          {/* El hueco del faro. */}
          <div aria-hidden="true" className="hidden lg:block" />

          {/* Última parada del haz: el camino. */}
          <div data-cierre-bloque className="max-w-[30rem] lg:max-w-none">
            <p className="text-azul-claro/70 font-mono text-[0.68rem] tracking-[0.2em] uppercase">
              Investigar para transformar
            </p>
            <h2
              data-cierre-titulo
              className="font-display mt-5 font-extrabold tracking-[-0.025em] text-balance"
              style={{ fontSize: "clamp(1.6rem, 0.8rem + 1.5vw, 2.1rem)", lineHeight: 1.08 }}
            >
              Investigar permite hacer mejores preguntas.
            </h2>
            <div className="mt-8">
              <ButtonPrimary href="/contacto">Conversemos</ButtonPrimary>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
