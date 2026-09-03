"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { DANIELA, porTier, type Persona } from "@/features/quienes-somos/data/equipo";
import { PersonCard } from "@/features/quienes-somos/components/PersonCard";
import { TeamProfileOverlay } from "@/features/quienes-somos/components/TeamProfileOverlay";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * "Quiénes sostienen ED" — el EQUIPO con JERARQUÍA institucional en 4 niveles,
 * como un PLIEGO EDITORIAL sobre la lámina navy. Una card base única
 * (PersonCard) a cuatro escalas, en progresión sostenida — 481 → 379 → 304 →
 * 232 px de ancho con el container en su tope de 1280:
 *
 *   N1 Dirección General      → Daniela: card ancha, masthead arriba-izquierda.
 *   N2 Dirección              → Karla y Raquel: cards menores, escalonadas
 *                               abajo-derecha, una debajo de la otra.
 *   N3 Líderes de área/proy.  → grilla ESTABLE de cards medianas (2 columnas).
 *   N4 Facilitación y diseño  → grilla ESTABLE 3×2 de cards compactas.
 *
 * N3 y N4 comparten estructura: un RAÍL IZQUIERDO con el encabezado del nivel
 * (nodo + volanta numerada + título) y la grilla alineada al MISMO borde derecho
 * que el masthead. Por el raíl baja una columna vertebral que conecta los
 * NIVELES entre sí — no a las personas: es una red con responsabilidades
 * distintas, no una pirámide. El aire entre el título y su grilla crece a
 * medida que se baja de nivel, así que la lectura se abre en vez de comprimirse.
 *
 * Las cuatro personas de N3 son PARES: mismo tamaño, misma escala fotográfica,
 * mismo peso. Nada se mueve solo. Las cards entran con el scroll (opacity +
 * translateY + escala mínima, `once`) y después quedan quietas; a partir de ahí
 * solo responden a hover, teclado y clic. Reduced-motion: todo legible sin
 * animación.
 */

function KickerRotulo({ children }: { children: React.ReactNode }) {
  return (
    <p
      data-reveal
      className="text-verde-concepto flex items-center gap-3 font-mono text-[0.7rem] font-medium tracking-[0.22em] uppercase"
    >
      <span aria-hidden="true" className="bg-verde-concepto/60 block h-px w-7" />
      {children}
    </p>
  );
}

/**
 * Un nivel de la jerarquía: raíl con el encabezado a la izquierda, grilla a la
 * derecha. El encabezado dejó de ser una etiqueta mínima — la volanta numerada
 * y el título anuncian el cambio de nivel ANTES de que aparezcan las personas.
 *
 * `spine` decide cómo entra y sale el trazo vertical: "entra" baja desde las
 * direcciones (arranca transparente), "sale" se disuelve hacia el nodo de
 * cierre. Los tramos de niveles consecutivos se encuentran a mitad del margen,
 * así que la vertebral se lee como UNA línea continua.
 */
function Nivel({
  n,
  titulo,
  spine,
  revealY,
  revealDur,
  revealStagger,
  children,
}: {
  n: string;
  titulo: string;
  spine: "entra" | "sale";
  revealY: string;
  revealDur: string;
  revealStagger: string;
  children: React.ReactNode;
}) {
  const entra = spine === "entra";
  return (
    <div
      data-team-group
      data-reveal-y={revealY}
      data-reveal-dur={revealDur}
      data-reveal-stagger={revealStagger}
      data-reveal-scale="0.985"
      className="relative mt-20 grid gap-x-14 gap-y-9 lg:grid-cols-[20rem_minmax(0,1fr)]"
    >
      {/* Columna vertebral. Va detrás del nodo del encabezado y se dibuja con el
          scroll (scaleY desde arriba): la conexión llega antes que la gente. */}
      <span
        aria-hidden="true"
        data-spine
        className="pointer-events-none absolute left-[8.5px] hidden w-px lg:block"
        style={{
          top: entra ? "-5rem" : "-2.5rem",
          bottom: entra ? "-2.5rem" : "-3rem",
          background: entra
            ? "linear-gradient(to bottom, transparent, rgb(255 255 255 / 0.16) 9%, rgb(255 255 255 / 0.16))"
            : "linear-gradient(to bottom, rgb(255 255 255 / 0.16), rgb(255 255 255 / 0.16) 80%, transparent)",
        }}
      />

      <header data-reveal className="relative self-start pl-9">
        {/* Nodo del nivel sobre la vertebral — rima con el nodo de cierre. */}
        <span
          aria-hidden="true"
          className="absolute top-[0.28rem] left-0 grid h-[18px] w-[18px] place-items-center"
        >
          <span className="border-verde-concepto/35 col-start-1 row-start-1 block h-[18px] w-[18px] rounded-full border" />
          <span className="bg-verde-concepto col-start-1 row-start-1 block h-1.5 w-1.5 rounded-full" />
        </span>
        <p className="text-verde-concepto font-mono text-[0.68rem] font-medium tracking-[0.24em] uppercase">
          Nivel {n}
        </p>
        <h4 className="font-display mt-2.5 text-[1.32rem] leading-[1.2] font-bold text-white">
          {titulo}
        </h4>
        <span aria-hidden="true" className="mt-5 block h-px w-16 bg-white/18" />
      </header>

      {children}
    </div>
  );
}

export function ImpulsanEd() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();
  const [selected, setSelected] = useState<{ persona: Persona; el: HTMLElement } | null>(null);

  const lideres = porTier(3);
  const facilitacion = porTier(4);
  // Dirección (nivel 2): académica + institucional. Antes era una sola card.
  const direccion = porTier(2);

  const openProfile = (persona: Persona, el: HTMLButtonElement) => {
    setSelected({ persona, el });
  };

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return;

    const ctx = gsap.context(() => {
      // Acople de la lámina navy sobre la lámina blanca previa (misma mecánica
      // que el resto de las secciones apiladas).
      const sheet = root.closest("section");
      if (sheet) {
        gsap.fromTo(
          sheet,
          { scale: 0.97, y: 36 },
          {
            scale: 1,
            y: 0,
            ease: "none",
            scrollTrigger: { trigger: sheet, start: "top 96%", end: "top 14%", scrub: true },
          },
        );
      }

      // Encabezado en tres tiempos.
      const heads = gsap.utils.toArray<HTMLElement>("[data-team-head]");
      // opacity (no autoAlpha): NO usamos visibility:hidden, así el contenido
      // sigue en el árbol de accesibilidad y es enfocable aunque no se haya
      // revelado todavía. El fallback de focusin (abajo) garantiza que también
      // sea visible para quien navega con teclado.
      gsap.set(heads, { opacity: 0, y: 24 });
      gsap.to(heads, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: root, start: "top 78%", once: true },
      });

      // Aparición por nivel: se anima el WRAPPER de cada card (la foto es hija
      // inset-0, nunca se separa). transform+opacity, `once` — entran y se
      // quedan quietas. El orden dentro del nivel sale del DOM: encabezado,
      // después fila 1, después fila 2.
      gsap.utils.toArray<HTMLElement>("[data-team-group]").forEach((grupo) => {
        const items = gsap.utils.toArray<HTMLElement>(grupo.querySelectorAll("[data-reveal]"));
        if (!items.length) return;
        const spine = grupo.querySelector<HTMLElement>("[data-spine]");
        const y = Number(grupo.dataset.revealY ?? 28);
        const dur = Number(grupo.dataset.revealDur ?? 0.6);
        const stg = Number(grupo.dataset.revealStagger ?? 0.1);
        // El masthead no declara escala: su entrada queda exactamente como estaba.
        const sc = Number(grupo.dataset.revealScale ?? 1);

        gsap.set(items, { opacity: 0, y, scale: sc });
        if (spine) gsap.set(spine, { scaleY: 0, transformOrigin: "top center" });

        const tl = gsap.timeline({
          scrollTrigger: { trigger: grupo, start: "top 82%", once: true },
        });
        tl.to(
          items,
          { opacity: 1, y: 0, scale: 1, duration: dur, stagger: stg, ease: "power3.out" },
          0,
        );
        // Apenas detrás del título: el trazo baja mientras entra la primera fila.
        if (spine) tl.to(spine, { scaleY: 1, duration: 0.85, ease: "power2.out" }, 0.16);
      });
    }, root);

    // Revela lo que ya esté en viewport al montar (p. ej. recarga con la página
    // scrolleada): nunca queda oculto por no haber scrolleado.
    ScrollTrigger.refresh();

    // Fallback de teclado: si el foco entra a la sección antes de que el scroll
    // revele, mostramos todo de una — el contenido no depende del movimiento.
    const revealAll = () => {
      gsap.to(gsap.utils.toArray<HTMLElement>("[data-team-head], [data-reveal]"), {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.3,
        overwrite: true,
      });
      gsap.to(gsap.utils.toArray<HTMLElement>("[data-spine]"), {
        scaleY: 1,
        duration: 0.3,
        overwrite: true,
      });
    };
    root.addEventListener("focusin", revealAll, { once: true });

    return () => {
      root.removeEventListener("focusin", revealAll);
      ctx.revert();
    };
  }, [reduced]);

  return (
    <section
      aria-label="Quiénes sostienen ED — el equipo"
      // La página termina sobre esta lámina navy y el footer también es navy:
      // sin teñir la muesca del footer, su esquina redondeada deja dos
      // triángulos blancos justo en el encuentro (ver globals.css).
      data-footer-dock-tint="azul"
      className="bg-azul-principal relative z-[45] -mt-[4svh] overflow-clip rounded-t-[2.5rem] text-white shadow-[0_-24px_60px_-30px_rgb(15_23_42/0.45)]"
    >
      {/* Textura de puntos de marca */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:radial-gradient(circle,#fff_1.1px,transparent_1.6px)] [background-size:24px_24px]"
      />

      {/* Degradé de salida hacia el pie: una sombra ancha que sube desde el
          final de la lámina, toma cuerpo a media altura y VUELVE a cero justo
          en el borde. Al llegar al encuentro con el footer la sombra ya no
          pinta nada, así que ahí queda el navy exacto del footer y el paso no
          dibuja ninguna línea.
          Va con alfa sobre el fondo (no como color sólido) por dos razones: la
          caída es continua de punta a punta —con paradas de color intermedias
          el propio degradé marcaba un escalón a media altura— y el color base
          lo sigue poniendo la lámina, así que no hay dos navies que mantener
          sincronizados. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[26rem]"
        style={{
          background:
            "linear-gradient(to bottom, rgb(4 6 12 / 0) 0%, rgb(4 6 12 / 0.34) 55%, rgb(4 6 12 / 0) 100%)",
        }}
      />

      <div ref={rootRef} className="relative z-10 mx-auto max-w-screen-xl px-5 py-24 md:px-10 md:py-28">
        {/* ── Encabezado ─────────────────────────────────────────────────── */}
        <div className="max-w-2xl">
          <span data-team-head className="text-azul-claro/80 font-mono text-[0.78rem] font-medium tracking-[0.24em] uppercase">
            Quiénes sostienen ED
          </span>
          <h3
            data-team-head
            className="font-display mt-5 font-bold tracking-[-0.02em] text-white"
            style={{ fontSize: "clamp(1.9rem, 0.9rem + 2.9vw, 3rem)", lineHeight: 1.08 }}
          >
            La red tiene <span className="text-verde-concepto">nombres</span>.
          </h3>
          <p data-team-head className="text-azul-claro/80 mt-4 max-w-[54ch] font-sans text-[1rem] leading-relaxed">
            Una red de especialistas, trayectorias y experiencias que hace
            posible el trabajo de ED.
          </p>
        </div>

        {/* ── Masthead: N1 Daniela + N2 Karla, dos retratos escalonados ──── */}
        <div
          data-team-group
          data-reveal-y="34"
          data-reveal-dur="0.85"
          data-reveal-stagger="0.18"
          className="relative mt-16 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8"
        >
          {/* N1 — Dirección General (retrato grande, arriba-izquierda) */}
          <div className="lg:col-span-5">
            <KickerRotulo>Dirección general</KickerRotulo>
            <div data-reveal className="mt-4">
              <PersonCard persona={DANIELA} onOpen={openProfile} />
            </div>
          </div>

          {/* N2 — Dirección (retratos menores, abajo-derecha, escalonados). La
              columna sostiene las dos direcciones —académica e institucional—
              una debajo de la otra: siguen la diagonal que abre Daniela sin
              achicarse para entrar en la misma fila. */}
          <div className="lg:col-span-4 lg:col-start-9 lg:mt-[9rem] lg:self-start">
            <KickerRotulo>Dirección</KickerRotulo>
            <ul className="mt-4 grid gap-8">
              {direccion.map((persona) => (
                <li key={persona.key} data-reveal>
                  <PersonCard persona={persona} onOpen={openProfile} />
                </li>
              ))}
            </ul>
          </div>

          {/* Conector verde discreto entre las dos direcciones (solo desktop) */}
          <span
            aria-hidden="true"
            className="via-verde-concepto/40 absolute top-[56%] left-[43%] hidden h-px w-[15%] -rotate-[18deg] bg-gradient-to-r from-transparent to-transparent lg:block"
          />
        </div>

        {/* ── N3 — Líderes de área y proyecto: 2×2, cuatro pares ─────────── */}
        <Nivel
          n="03"
          titulo="Líderes de área y proyecto"
          spine="entra"
          revealY="30"
          revealDur="0.62"
          revealStagger="0.09"
        >
          {/* Alineada al borde derecho del masthead: el bloque cierra donde
              cierra la columna de dirección, y el aire queda entre el título y
              la gente. Dos columnas, tantas filas como personas haya. */}
          <ul className="grid w-full max-w-[40rem] grid-cols-2 gap-6 justify-self-end lg:gap-8">
            {lideres.map((persona) => (
              <li key={persona.key} data-reveal>
                <PersonCard persona={persona} onOpen={openProfile} />
              </li>
            ))}
          </ul>
        </Nivel>

        {/* ── N4 — Facilitación y diseño de materiales: 3×2 ──────────────── */}
        <Nivel
          n="04"
          titulo="Facilitación y diseño de materiales"
          spine="sale"
          revealY="24"
          revealDur="0.52"
          revealStagger="0.07"
        >
          {/* Más ancha que la de líderes y con cards menores: seis personas que
              se leen como un cuerpo denso, no como una fila de créditos. */}
          <ul className="grid w-full max-w-[46rem] grid-cols-2 gap-5 justify-self-end sm:grid-cols-3">
            {facilitacion.map((persona) => (
              <li key={persona.key} data-reveal>
                <PersonCard persona={persona} onOpen={openProfile} />
              </li>
            ))}
          </ul>
        </Nivel>

        {/* ── Cierre: respiración final + nodo (la red se resuelve en un
            punto), sin CTA inventado. Deja continuidad con la sección
            siguiente, que acopla su lámina clara por encima. ─────────────── */}
        <div className="mt-24 flex flex-col items-center">
          <span
            aria-hidden="true"
            className="h-px w-full max-w-2xl bg-gradient-to-r from-transparent via-white/18 to-transparent"
          />
          <span
            aria-hidden="true"
            className="bg-verde-concepto mt-[-5px] block h-2.5 w-2.5 rounded-full shadow-[0_0_0_6px_rgb(31_154_120/0.16)]"
          />
        </div>
      </div>

      {/* ── Shell de perfil full-screen (reemplaza el modal roto) ────────── */}
      {selected && (
        <TeamProfileOverlay
          persona={selected.persona}
          originEl={selected.el}
          onClose={() => setSelected(null)}
        />
      )}
    </section>
  );
}
