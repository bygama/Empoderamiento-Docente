"use client";

import { useEffect, useRef, useState } from "react";
import { SelloED } from "@/components/brand/SelloED";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { partirResaltado } from "@/lib/contenido/resaltado";
import { irAElemento } from "@/lib/indice";
import type { EquipoDeQuienesSomos } from "@/features/quienes-somos/contenido/equipo";
import type { PersonaDelSitio as Persona, Tier } from "@/features/quienes-somos/contenido/perfil-del-sitio";
import { PersonCard } from "@/features/quienes-somos/components/PersonCard";
import { TeamProfileOverlay } from "@/features/quienes-somos/components/TeamProfileOverlay";
import { CierreDelEquipo } from "./impulsan-ed/CierreDelEquipo";
import { crearCoreografiaEquipo } from "./impulsan-ed/coreografia-equipo";
import { KickerRotulo } from "./impulsan-ed/KickerRotulo";
import { Nivel } from "./impulsan-ed/Nivel";

/**
 * "Quiénes sostienen ED" — el EQUIPO con JERARQUÍA institucional en 4 niveles,
 * como un PLIEGO EDITORIAL sobre la lámina navy. Una card base única
 * (PersonCard) a cuatro escalas, en progresión sostenida — 481 → 379 → 304 →
 * 232 px de ancho con el container en su tope de 1280:
 *
 *   N1 Dirección General      → Daniela: card ancha, al CENTRO del masthead.
 *   N2 Dirección              → Karla (izquierda) y Raquel (derecha): cards
 *                               menores, una de cada lado, más abajo y a la
 *                               misma altura entre sí.
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

export function ImpulsanEd({ contenido, personas }: { contenido: EquipoDeQuienesSomos; personas: readonly Persona[] }) {
  const { niveles } = contenido;
  const titulo = partirResaltado(contenido.titulo);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();
  const [selected, setSelected] = useState<{ persona: Persona; el: HTMLElement } | null>(null);

  // Las personas llegan ya ordenadas por nivel y, dentro de cada uno, por su lugar.
  const porNivel = (nivel: Tier) => personas.filter((p) => p.tier === nivel);
  const [direccionGeneral] = porNivel(1);
  const lideres = porNivel(3);
  const facilitacion = porNivel(4);
  // Dirección (nivel 2): académica + institucional. Antes era una sola card.
  const direccion = porNivel(2);

  // El perfil abierto queda en la URL (?persona=clave) sin sumar entradas
  // al historial: así se puede copiar y mandar; al cerrar, se limpia.
  const openProfile = (persona: Persona, el: HTMLButtonElement) => {
    setSelected({ persona, el });
    window.history.replaceState(window.history.state, "", `?persona=${persona.key}`);
  };
  const closeProfile = () => {
    setSelected(null);
    window.history.replaceState(window.history.state, "", window.location.pathname);
  };

  // Link directo: si la URL ya trae ?persona=, se lleva la página hasta esa
  // card y se abre el perfil desde ahí, un momento después del montaje.
  useEffect(() => {
    const clave = new URLSearchParams(window.location.search).get("persona");
    if (!clave) return;
    const persona = personas.find((p) => p.key === clave);
    const el = rootRef.current?.querySelector<HTMLButtonElement>(
      `[data-persona-key="${clave}"]`,
    );
    if (!persona || !el) return;
    const t = window.setTimeout(() => {
      irAElemento(el, { centrar: true, corte: true });
      setSelected({ persona, el });
    }, 400);
    return () => window.clearTimeout(t);
  }, [personas]);

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return;
    return crearCoreografiaEquipo(root);
  }, [reduced]);

  return (
    <section
      id="equipo"
      data-indice="El equipo"
      aria-labelledby="equipo-titulo"
      // La página termina sobre esta lámina navy y el footer también es
      // navy. Con el tint "propio" el footer se monta --footer-radio sobre
      // ella con la muesca TRANSPARENTE: el redondeo recorta la lámina real,
      // con sus puntos, en vez de un color plano. Antes iba azul-medio y esa
      // cuña clara no pertenecía a la página. El pb deja la franja que el
      // footer se monta, para no comerle contenido (ver globals.css).
      data-footer-dock-tint="propio"
      className="bg-azul-principal relative z-[45] -mt-[4svh] overflow-clip rounded-t-[2.5rem] pb-[var(--footer-radio)] text-white shadow-[0_-24px_60px_-30px_rgb(15_23_42/0.45)]"
    >
      {/* Textura de puntos de marca */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:radial-gradient(circle,#fff_1.1px,transparent_1.6px)] [background-size:24px_24px]"
      />
      <SelloED className="absolute top-8 right-8 z-10 md:top-10 md:right-10" />

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
          {/* La volanta nombra la sección (aria-labelledby). */}
          <span id="equipo-titulo" data-team-head className="text-azul-claro/80 font-mono text-[0.78rem] font-medium tracking-[0.24em] uppercase">
            {contenido.volanta}
          </span>
          <h3
            data-team-head
            className="font-display mt-5 font-bold tracking-[-0.02em] text-white"
            style={{ fontSize: "clamp(1.9rem, 0.9rem + 2.9vw, 3rem)", lineHeight: 1.08 }}
          >
            {titulo.antes}
            {titulo.clave === null ? null : <span className="text-verde-concepto">{titulo.clave}</span>}
            {titulo.despues}
          </h3>
          <p data-team-head className="text-azul-claro/80 mt-4 max-w-[54ch] font-sans text-[1rem] leading-relaxed">
            {contenido.bajada}
          </p>
        </div>

        {/* ── Masthead: N1 Daniela al centro, N2 una de cada lado ─────────
            Tres columnas: la del medio mide lo que medía la card de Daniela
            (30rem) y las laterales se reparten el resto, así que las cards de
            dirección conservan su escala. Las laterales bajan 9rem: Daniela
            preside y las dos direcciones la flanquean a la misma altura. */}
        <div
          data-team-group
          data-reveal-y="34"
          data-reveal-dur="0.85"
          data-reveal-stagger="0.18"
          className="relative mt-16 grid grid-cols-1 gap-10 max-sm:grid-cols-2 max-sm:gap-x-5 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_30rem_minmax(0,1fr)] lg:gap-8"
        >
          {/* N1 — Dirección General (retrato grande, al centro); una sola, y la base lo garantiza */}
          {direccionGeneral && (
            <div className="max-lg:order-1 max-sm:col-span-2 sm:col-span-2 sm:mx-auto sm:w-full sm:max-w-[30rem] lg:col-span-1 lg:col-start-2 lg:row-start-1 lg:max-w-none">
              <KickerRotulo>{niveles.direccionGeneral}</KickerRotulo>
              <div data-reveal className="mt-4">
                <PersonCard persona={direccionGeneral} onOpen={openProfile} />
              </div>
            </div>
          )}

          {/* N2 — Dirección: una card de cada lado, más abajo, a la misma
              altura entre sí. Orden de lectura: académica a la izquierda,
              institucional a la derecha. En celular y tablet van las dos en
              la misma línea, debajo de la Dirección General, y la segunda va
              primero (Gastón, 2026-10-02: Raquel antes que Karla); en
              computadora nada cambia. */}
          {direccion.map((persona, i) => (
            <div
              key={persona.key}
              className={`lg:row-start-1 lg:mt-[9rem] lg:self-start ${
                i === 0 ? "max-lg:order-3 lg:col-start-1" : "max-lg:order-2 lg:col-start-3"
              }`}
            >
              {/* En celular y tablet van lado a lado: el rótulo se lee una vez,
                  sobre la primera; el de la otra conserva su lugar para que
                  las dos cards arranquen a la misma altura. */}
              <div className={i === 0 ? "max-lg:invisible" : undefined}>
                <KickerRotulo>{niveles.direccion}</KickerRotulo>
              </div>
              <div data-reveal className="mt-4">
                <PersonCard persona={persona} onOpen={openProfile} />
              </div>
            </div>
          ))}
        </div>

        {/* ── N3 — Líderes de área y proyecto: 2×2, cuatro pares ─────────── */}
        <Nivel
          volanta={niveles.lideres.volanta}
          titulo={niveles.lideres.titulo}
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
          volanta={niveles.facilitacion.volanta}
          titulo={niveles.facilitacion.titulo}
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
        <CierreDelEquipo personas={personas} />
        <div className="mt-24 flex flex-col items-center max-lg:hidden">
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
          onClose={closeProfile}
        />
      )}
    </section>
  );
}
