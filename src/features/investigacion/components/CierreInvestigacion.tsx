"use client";

import { useRef } from "react";
import gsap from "gsap";
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
 * Bultos de cada silueta de nube: centro (% del cajón), radios (% del cajón)
 * y densidad. Pocos, grandes y muy solapados: la masa se lee entera, con
 * bordes irregulares, y no como óvalos sueltos. Todo bulto muere bien
 * adentro de su cajón (ver `fondoNube`): ningún recorte recto. Un mismo
 * dibujo a distinto tamaño, giro y lugar no se reconoce como repetido.
 */
const SILUETAS = {
  cumuloA: [
    [50, 64, 46, 26, 0.5],
    [30, 48, 26, 32, 0.55],
    [50, 38, 28, 36, 0.6],
    [70, 46, 26, 32, 0.55],
    [22, 66, 22, 22, 0.4],
  ],
  cumuloB: [
    [48, 66, 46, 24, 0.5],
    [28, 50, 24, 30, 0.5],
    [48, 36, 28, 38, 0.6],
    [68, 44, 26, 32, 0.55],
    [82, 60, 20, 22, 0.4],
  ],
  mediana: [
    [50, 62, 44, 24, 0.45],
    [32, 46, 24, 32, 0.5],
    [54, 36, 26, 36, 0.55],
    [74, 50, 22, 28, 0.45],
    [20, 62, 20, 22, 0.35],
  ],
  jiron: [
    [50, 52, 46, 22, 0.4],
    [30, 46, 24, 26, 0.35],
    [64, 44, 26, 28, 0.4],
    [82, 56, 18, 18, 0.28],
  ],
  // La banda que vela el faro: ancha, y más densa que lo que le tocaría
  // por distancia, porque un velo tenue no envuelve nada.
  banda: [
    [50, 62, 46, 24, 0.6],
    [22, 50, 22, 30, 0.55],
    [42, 42, 26, 34, 0.65],
    [66, 46, 26, 32, 0.6],
    [84, 56, 16, 22, 0.45],
  ],
} as const satisfies Record<string, ReadonlyArray<readonly [number, number, number, number, number]>>;

/**
 * Las nubes del descenso: la capa más cercana a la cámara. La hoja llega
 * metida en ellas y, al pinnearse, la cámara baja un buen rato entre nubes
 * antes de que el faro asome; las nubes suben y se van en primer plano y
 * el faro sube a su encuentro adentro de la última. Es un CAMPO fijo en el
 * espacio: cada nube tiene su lugar (`y` más allá del 100 para las que
 * esperan bajo el piso) y todas se mueven con la misma cámara, cada una a
 * la velocidad de su profundidad (`cerca`, 0–1: las cercanas, más grandes
 * y densas, viajan más rápido; las lejanas, más claras, más lento). `giro`
 * saca la masa del eje. Solo existen en la coreografía: el SSR dibuja el
 * final, y ahí ya pasaron.
 */
type Nube = {
  /** Cajón: esquina (% del escenario), ancho (% del ancho) y alto (% del alto). */
  x: number;
  y: number;
  w: number;
  h: number;
  cerca: number;
  giro: number;
  silueta: keyof typeof SILUETAS;
};

const NUBES: ReadonlyArray<Nube> = [
  // En cuadro cuando llega la hoja: la cámara está metida en las nubes.
  { x: -14, y: 46, w: 72, h: 46, cerca: 1, giro: -3, silueta: "cumuloA" },
  { x: 42, y: 58, w: 74, h: 44, cerca: 0.92, giro: 2.5, silueta: "cumuloB" },
  { x: 12, y: 14, w: 56, h: 34, cerca: 0.7, giro: -1.5, silueta: "mediana" },
  { x: 58, y: 6, w: 52, h: 32, cerca: 0.62, giro: 3.5, silueta: "mediana" },
  { x: -10, y: -4, w: 42, h: 24, cerca: 0.3, giro: -1, silueta: "jiron" },
  { x: 30, y: 30, w: 44, h: 26, cerca: 0.35, giro: 1.5, silueta: "jiron" },
  { x: 66, y: 40, w: 46, h: 24, cerca: 0.25, giro: -2.5, silueta: "jiron" },
  // Esperan bajo el piso y van entrando a medida que la cámara baja.
  { x: 18, y: 88, w: 44, h: 24, cerca: 0.3, giro: 1, silueta: "jiron" },
  { x: 50, y: 100, w: 54, h: 32, cerca: 0.6, giro: -2.5, silueta: "mediana" },
  { x: 60, y: 118, w: 44, h: 24, cerca: 0.28, giro: -1.5, silueta: "jiron" },
  { x: 8, y: 120, w: 70, h: 44, cerca: 0.95, giro: 2, silueta: "cumuloA" },
  { x: 36, y: 135, w: 56, h: 34, cerca: 0.68, giro: 1.5, silueta: "mediana" },
  { x: -20, y: 150, w: 76, h: 46, cerca: 1, giro: -2, silueta: "cumuloB" },
  { x: 30, y: 185, w: 72, h: 44, cerca: 0.9, giro: 3, silueta: "cumuloA" },
  // La última: la banda. El faro sube adentro de ella y la lámpara se
  // enciende cuando se disuelve; su `y` está puesto para que llegue a la
  // linterna justo entonces (depende de DESCENSO, en coreografia-cierre.ts).
  { x: 2, y: 168, w: 92, h: 30, cerca: 0.3, giro: -2, silueta: "banda" },
];

/** Tinta de una nube: azul-medio, más claro cuanto más lejos, con su alfa. */
const tintaNube = (cerca: number, alfa: number) =>
  `color-mix(in srgb, color-mix(in srgb, var(--color-azul-claro) ${Math.round(18 + (1 - cerca) * 30)}%, var(--color-azul-medio)) ${Math.round(alfa * 100)}%, transparent)`;

/**
 * Los bultos apilados como capas de fondo. Interior parejo (la tinta se
 * sostiene hasta el 36% del radio) y caída larga hasta transparente en el
 * 72%: con bultos grandes y muy solapados, la masa se lee entera —una
 * silueta con bordes irregulares— y no como óvalos sueltos.
 */
function fondoNube(n: Nube) {
  return SILUETAS[n.silueta]
    .map(([cx, cy, rx, ry, a]) => {
      const d = a * (0.65 + 0.4 * n.cerca);
      return `radial-gradient(ellipse ${rx}% ${ry}% at ${cx}% ${cy}%, ${tintaNube(n.cerca, d)} 0%, ${tintaNube(n.cerca, d * 0.9)} 36%, ${tintaNube(n.cerca, d * 0.45)} 58%, transparent 72%)`;
    })
    .join(", ");
}

/**
 * Sección 8 — Cierre, absorbiendo la Conexión con Biblioteca (§9 y §10 de
 * docs/content/arquitectura-investigacion.md). Es una INVITACIÓN, no una
 * lectura: eyebrow + título + botón de cada lado, y la luz haciendo el resto.
 *
 * «Cae la noche sobre el archivo»: la hoja llega enmarcada como la hoja 01
 * del hero, metida entre nubes, y al pinnearse el marco se disuelve y el
 * navy se expande hasta los bordes. La cámara baja: las nubes del primer
 * plano suben y se van (ver NUBES) y el faro sube a su encuentro —el mismo
 * de Qué hacemos, recortado y grande— plantado en el piso. Gira, se
 * enciende arriba y el haz lee de costado: primero se posa sobre la
 * Biblioteca, después sobre el cierre.
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
    // Con el tint "noche" el footer se monta --footer-radio sobre esta
    // sección con la muesca transparente: el redondeo recorta el cielo
    // real (el final del degradé, con su grano), que ningún color plano
    // iguala. Por eso la sección deja esa franja de cielo bajo el piso
    // (pb) y el faro se planta sobre el piso, no sobre el borde de la caja.
    <div ref={zonaRef} data-footer-dock-tint="noche">
      <section
        ref={hojaRef}
        id="conversemos"
        aria-label="Cierre e invitación a conversar"
        className="bg-azul-principal bg-grain-dark relative isolate flex min-h-[100svh] overflow-hidden pb-[var(--footer-radio)] text-white"
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
            lo disuelve al pinnearse. Invisible si la coreografía no corre.
            Abajo se ancla al piso reservado (pb), no al borde de la caja: la
            caja mide 100svh más esa franja y el borde queda bajo el fold. */}
        <div
          aria-hidden="true"
          data-cierre-marco
          className="pointer-events-none invisible absolute inset-x-2.5 top-2.5 bottom-[calc(var(--footer-radio)+0.625rem)] z-40 rounded-xl opacity-0"
          style={{ boxShadow: "0 0 0 2rem var(--color-gris-fondo)" }}
        />

        {/* ── Las nubes: la capa más cercana. En primer plano, sobre el faro
            y bajo el marco y el folio. Invisibles hasta que la
            coreografía las enciende: sin ella (touch, reduced-motion) la
            hoja es el último frame y las nubes ya pasaron. */}
        <div
          aria-hidden="true"
          data-cierre-nubes
          className="pointer-events-none invisible absolute inset-0 z-[32] hidden opacity-0 lg:block"
        >
          {NUBES.map((n) => (
            <span
              key={`n-${n.x}-${n.y}`}
              data-cierre-nube
              data-nube-cerca={n.cerca}
              data-nube-giro={n.giro}
              className="absolute block"
              style={{
                left: `${n.x}%`,
                top: `${n.y}%`,
                width: `${n.w}%`,
                height: `${n.h}%`,
                backgroundImage: fondoNube(n),
              }}
            />
          ))}
        </div>

        {/* Folio: la hoja 01 abrió el archivo; esta lo cierra. Va impreso
            en el papel, no en la escena: por encima de las nubes. */}
        <span className="text-azul-claro/60 absolute top-7 right-8 z-[36] hidden font-mono text-[0.68rem] tracking-[0.2em] uppercase lg:block">
          Archivo ED · Última hoja
        </span>

        {/* ── El faro, plantado en el piso. El ancho escala con el alto para
            que la linterna quede a la altura de los mensajes en cualquier
            pantalla. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-[var(--footer-radio)] z-30 hidden justify-center lg:flex">
          <div data-cierre-linterna className="w-[clamp(168px,26svh,236px)]">
            <LinternaFaro className="block h-auto w-full" />
          </div>
        </div>

        {/* ── Los dos mensajes que la luz lee de costado: invitaciones. */}
        <div className="relative z-30 mx-auto grid min-h-[100svh] w-full max-w-screen-xl items-center gap-x-8 gap-y-14 px-6 py-24 md:px-12 lg:grid-cols-[1fr_minmax(200px,17vw)_1fr] lg:gap-x-6">
          {/* Primera parada del haz: dónde vive lo que investigamos. */}
          <div id="biblioteca" data-cierre-bloque className="max-w-[30rem] lg:max-w-none lg:justify-self-end">
            <h2
              data-cierre-titulo
              className="font-display text-azul-claro font-extrabold tracking-[-0.02em] text-balance"
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
              <ButtonPrimary href="/contacto?tema=investigacion">Conversemos</ButtonPrimary>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
