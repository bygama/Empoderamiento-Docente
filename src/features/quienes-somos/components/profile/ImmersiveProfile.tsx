"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import type { Profile } from "@/features/quienes-somos/data/equipo";
import { useRefsPerfil } from "./inmersivo/refs-perfil";
import { crearTransformacionHero, medirNombre } from "./inmersivo/viaje-nombre";
import { crearCaminoMaestro, programarRecalculos } from "./inmersivo/camino-maestro";
import { crearCierre, crearEtapas } from "./inmersivo/etapas";
import { crearApertura } from "./inmersivo/apertura-perfil";
import { PerfilLineal } from "./inmersivo/PerfilLineal";
import { IdentidadFija } from "./inmersivo/IdentidadFija";
import { IndiceVivo } from "./inmersivo/IndiceVivo";
import { FiguraPerfil } from "./inmersivo/FiguraPerfil";
import { HeroPerfil } from "./inmersivo/HeroPerfil";
import { RecorridoEtapas } from "./inmersivo/RecorridoEtapas";
import { CierrePerfil } from "./inmersivo/CierrePerfil";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * ImmersiveProfile — MOTOR del perfil inmersivo (Parte 2, refactor editorial).
 *
 * Lógica narrativa: APERTURA FUERTE → TRANSFORMACIÓN DEL HERO → CAMINO →
 * RECORRIDO DOSIFICADO → RAMIFICACIONES → CONVERGENCIA → REGRESO LIMPIO.
 *
 *   · El NOMBRE es UN SOLO elemento (capa fija) que VIAJA: en el hero se ve
 *     grande (posición/tamaño medidos sobre un clon en flujo que reserva el
 *     espacio); con el scroll se achica y se desplaza hasta convertirse en el
 *     encabezado de la columna izquierda. Se anima font-size real (no scale)
 *     → siempre nítido.
 *   · La FIGURA recortada protagoniza la apertura (FLIP desde la foto de la
 *     card) y SE RETIRA al comenzar el recorrido (deriva + fade). Reaparece
 *     recién en la convergencia, integrada al cierre.
 *   · El CAMINO nace bajo la zona del nombre, serpentea entre etapas
 *     alternadas (los nodos quedan SIEMPRE fuera de los bloques de texto,
 *     con puntos-guía por etapa para no atravesar contenido) y converge al
 *     centro hacia el nodo ED del cierre.
 *   · La COLUMNA izquierda es un índice vivo: nace de la transformación del
 *     hero, comparte lenguaje visual con el camino (línea + nodos), marca
 *     activo + memoria de lo recorrido, y se sintetiza al llegar al cierre.
 *   · Reveals con `opacity` (NUNCA autoAlpha en contenido): todo queda en el
 *     árbol de accesibilidad. Al subir, lo ya revelado NO se esconde.
 *
 * REUTILIZABLE: todo sale de `persona.profile` — cantidad de etapas, variantes
 * de composición, categorías. Reduced-motion → layout lineal completo.
 *
 * Piezas (`inmersivo/`): refs en `refs-perfil.ts`; coreografía en
 * `viaje-nombre.ts` (medición + transformación del hero), `camino.ts` +
 * `camino-maestro.ts`, `etapas.ts` y `apertura-perfil.ts`, llamadas en ese
 * orden dentro del gsap.context; markup en PerfilLineal, IdentidadFija,
 * IndiceVivo, FiguraPerfil, HeroPerfil, RecorridoEtapas y CierrePerfil.
 */
export function ImmersiveProfile({
  profile,
  reduced,
  originEl,
  onClose,
  figuraDesdeCard = true,
}: {
  profile: Profile;
  reduced: boolean;
  /** Card de origen (FLIP figura + nombre). Puede ser null. */
  originEl: HTMLElement | null;
  onClose: () => void;
  /**
   * false = la FOTO de la card ya viaja hasta acá (la lleva el overlay); la
   * figura recortada no FLIPea: aparece cuando esa foto llega, y la reemplaza.
   */
  figuraDesdeCard?: boolean;
}) {
  const r = useRefsPerfil();
  const { wrap, identity, idLine1, idLine2, idRole, clone, cloneL1, cloneL2, cloneRole } = r;
  const { hero, heroBody, sidebar, portraitOuter, portraitMover } = r;
  const { track, path, svg, closing, closingFig } = r;

  const [activeStage, setActiveStage] = useState(0);
  // El camino se mide contra la figura: cuando la imagen termina de cargar hay
  // que rehacerlo. La coreografía deja acá su `recalcular` y el `onLoad` de la
  // figura lo llama (antes era un listener de `load` sobre la `<img>`).
  const recalcularCamino = useRef(() => {});
  const nombrePila = profile.fullName.split(" ")[0];
  const apellido = profile.fullName.split(" ").slice(1).join(" ") || profile.fullName;
  // Buscar por identidad (n), no por posición (motor reutilizable).
  const activeCategoryId =
    activeStage > 0 ? profile.stages.find((s) => s.n === activeStage)?.categoryId ?? null : null;
  const passedIds = new Set<string>();
  for (const s of profile.stages) if (s.n <= activeStage) passedIds.add(s.categoryId);
  /** Tratamiento de la fotografía (ver `Profile.figura`). */
  const figura = profile.figura ?? "recorte";
  // Titular en dos tiempos (frase real, partida en oraciones para jerarquía).
  const headlineParts = profile.headline
    .split(". ")
    .map((s, i, arr) => (i < arr.length - 1 ? `${s}.` : s))
    .filter(Boolean);

  useIsomorphicLayoutEffect(() => {
    if (reduced) return;
    const wrapEl = wrap.current;
    const scroller = wrapEl?.closest<HTMLElement>("[data-profile-scroller]") ?? null;
    if (!wrapEl || !scroller) return;

    const ctx = gsap.context((self) => {
      const st = <T extends ScrollTrigger.Vars>(v: T) => ({ scroller, ...v });
      const medidas = medirNombre(r, scroller);
      crearTransformacionHero(r, st, medidas);
      const { setupPath } = crearCaminoMaestro(r, st);
      crearEtapas(r, st, setActiveStage);
      crearCierre(r, st);
      const quitarIntro = crearApertura(r, { scroller, originEl, figuraDesdeCard, medidas });
      const { recalcular, limpiar } = programarRecalculos(self, setupPath);
      recalcularCamino.current = recalcular;
      return () => {
        limpiar();
        quitarIntro();
      };
    }, wrap);

    return () => ctx.revert();
  }, [reduced, profile, originEl, figuraDesdeCard]);

  // ════════════════════════ REDUCED MOTION (lineal) ═══════════════════════
  if (reduced) {
    return <PerfilLineal profile={profile} figura={figura} onClose={onClose} refWrap={wrap} />;
  }

  // ════════════════════════ INMERSIVO (desktop, con scroll) ═══════════════
  return (
    <div ref={wrap} className="relative">
      <IdentidadFija
        nombrePila={nombrePila}
        apellido={apellido}
        role={profile.role}
        refIdentity={identity}
        refLine1={idLine1}
        refLine2={idLine2}
        refRole={idRole}
      />

      <IndiceVivo
        profile={profile}
        activeStage={activeStage}
        activeCategoryId={activeCategoryId}
        passedIds={passedIds}
        refSidebar={sidebar}
      />

      {/* FIGURA (capa fija): protagonista de la apertura, se retira al
          empezar el recorrido. */}
      <FiguraPerfil
        profile={profile}
        figura={figura}
        modo="fija"
        refOuter={portraitOuter}
        refMover={portraitMover}
        onCargar={() => recalcularCamino.current()}
      />

      {/* ── Contenido scrolleable (banda compartida con las capas fijas) ── */}
      <div className="relative z-[4] mx-auto w-full max-w-[1440px] px-[clamp(1.25rem,4vw,3rem)]">
        <HeroPerfil
          profile={profile}
          nombrePila={nombrePila}
          apellido={apellido}
          headlineParts={headlineParts}
          refHero={hero}
          refClone={clone}
          refCloneL1={cloneL1}
          refCloneL2={cloneL2}
          refCloneRole={cloneRole}
          refHeroBody={heroBody}
        />

        <RecorridoEtapas profile={profile} activeStage={activeStage} refTrack={track} refSvg={svg} refPath={path} />

        <CierrePerfil profile={profile} figura={figura} onClose={onClose} refClosing={closing} refClosingFig={closingFig} />
      </div>
    </div>
  );
}
