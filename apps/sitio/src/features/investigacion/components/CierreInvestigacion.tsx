"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { SelloED } from "@/components/brand/SelloED";
import { ButtonPrimary } from "@/components/ui/ButtonPrimary";
import { ButtonSecondary } from "@/components/ui/ButtonSecondary";
import type { CierreDeInvestigacion } from "@/features/investigacion/contenido/cierre";
import { LinternaFaro } from "./LinternaFaro";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { CieloCierre } from "./cierre-investigacion/CieloCierre";
import { CierreLinternaMovil } from "./cierre-investigacion/CierreLinternaMovil";
import { ALTO_CIERRE_LVH, crearCierreMovil } from "./cierre-investigacion/coreografia-cierre-movil";
import { NubesCierre } from "./cierre-investigacion/NubesCierre";
import { crearAscenso } from "./coreografia-cierre";

/**
 * Sección 8 — Cierre, absorbiendo la Conexión con Biblioteca (§9 y §10 de
 * docs/content/arquitectura-investigacion.md). Es una INVITACIÓN, no una
 * lectura: eyebrow + título + botón de cada lado, y la luz haciendo el resto.
 *
 * «Cae la noche sobre el archivo»: la hoja llega enmarcada como la hoja 01
 * del hero, metida entre nubes, y al pinnearse el marco se disuelve y el
 * navy se expande hasta los bordes. La cámara baja: las nubes del primer
 * plano suben y se van (cierre-investigacion/NubesCierre.tsx) y el faro
 * sube a su encuentro —el mismo de Qué hacemos, recortado y grande—
 * plantado en el piso. Gira, se enciende arriba y el haz lee de costado:
 * primero se posa sobre la Biblioteca, después sobre el cierre.
 * Los 13 puntos del hero vuelven como estrellas y la luz los va tocando.
 *
 * El SSR renderiza el último frame (todo encendido y en su lugar): es lo que
 * ven touch y reduced-motion. La coreografía (desktop con puntero) vive en
 * coreografia-cierre.ts. Los textos llegan por props (de
 * `features/investigacion/contenido/cierre.ts` o de la base).
 */
export function CierreInvestigacion({ contenido }: { contenido: CierreDeInvestigacion }) {
  const { biblioteca, conversemos } = contenido;
  const zonaRef = useRef<HTMLDivElement | null>(null);
  const hojaRef = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();
  // Tres modos, decididos enteros en cada corrida y de nuevo en cada cambio
  // de pantalla: el ascenso de escritorio, la escena de celular (el faro chico
  // sube y su haz gira hacia cada mensaje) y la hoja quieta.
  const [modo, setModo] = useState<"quieto" | "vivo" | "movil">("quieto");
  const live = modo === "vivo";

  useIsomorphicLayoutEffect(() => {
    if (reduced) {
      setModo("quieto");
      return;
    }
    // 64rem = el `lg:` de Tailwind v4 (la linterna grande solo existe desde lg).
    const mqVivo = window.matchMedia("(hover: hover) and (min-width: 64rem)");
    const mqMovil = window.matchMedia("(max-width: 63.999rem) and (min-height: 38.75rem)");
    const decidir = () => {
      setModo(mqVivo.matches ? "vivo" : mqMovil.matches ? "movil" : "quieto");
    };
    decidir();
    mqVivo.addEventListener("change", decidir);
    mqMovil.addEventListener("change", decidir);
    return () => {
      mqVivo.removeEventListener("change", decidir);
      mqMovil.removeEventListener("change", decidir);
    };
  }, [reduced]);

  useIsomorphicLayoutEffect(() => {
    if (!live) return;
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
  }, [live]);

  useIsomorphicLayoutEffect(() => {
    if (modo !== "movil") return;
    const zona = zonaRef.current;
    if (!zona) return;
    return crearCierreMovil(zona);
  }, [modo]);

  return (
    // Con el tint "propio" el footer se monta --footer-radio sobre esta
    // sección con la muesca transparente: el redondeo recorta el cielo
    // real (el final del degradé, con su grano), que ningún color plano
    // iguala. Por eso la sección deja esa franja de cielo bajo el piso
    // (pb) y el faro se planta sobre el piso, no sobre el borde de la caja.
    <div
      ref={zonaRef}
      data-footer-dock-tint="propio"
      data-cierre-pista
      style={modo === "movil" ? { height: `${ALTO_CIERRE_LVH}lvh` } : undefined}
    >
      <section
        ref={hojaRef}
        data-modo={modo}
        id="conversemos"
        data-indice="Cierre"
        aria-label="Cierre e invitación a conversar"
        className="bg-azul-principal bg-grain-dark relative isolate flex min-h-[100svh] overflow-hidden [--faro-movil:clamp(96px,18svh,140px)] pb-[var(--footer-radio)] text-white data-[modo=movil]:sticky data-[modo=movil]:top-0 data-[modo=movil]:h-lvh"
      >
        {/* ── El cielo: cae la noche sobre el archivo. */}
        <CieloCierre />

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

        {/* ── Las nubes: la capa más cercana (cierre-investigacion/NubesCierre.tsx). */}
        <NubesCierre />

        {/* Folio: la hoja 01 abrió el archivo; esta lo cierra. Va impreso
            en el papel, no en la escena: por encima de las nubes. */}
        <span className="text-azul-claro/60 absolute top-7 right-8 z-[36] hidden font-mono text-[0.68rem] tracking-[0.2em] uppercase lg:block">
          Archivo ED · Última hoja · Cierre
        </span>
        {/* La firma, en la esquina opuesta al folio y por encima de las
            nubes como él. */}
        <SelloED className="absolute top-6 left-8 z-[36]" />

        {/* ── El faro, plantado en el piso. El ancho escala con el alto para
            que la linterna quede a la altura de los mensajes en cualquier
            pantalla. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-[var(--footer-radio)] z-30 hidden justify-center lg:flex">
          <div data-cierre-linterna className="w-[clamp(168px,26svh,236px)]">
            <LinternaFaro className="block h-auto w-full" />
          </div>
        </div>

        {/* ── Bajo `lg`: el faro chico (llega ya encendido) sube desde el
            piso entre dos nubes; el haz gira de costado hacia cada mensaje
            (cierre-investigacion/coreografia-cierre-movil.ts). */}
        <CierreLinternaMovil />

        {/* ── Los dos mensajes que la luz lee de costado: invitaciones. */}
        <div className="relative z-30 mx-auto grid min-h-[100svh] w-full max-w-screen-xl items-center gap-x-8 gap-y-14 px-6 py-24 md:px-12 lg:grid-cols-[1fr_minmax(200px,17vw)_1fr] lg:gap-x-6 [[data-modo=movil]_&]:min-h-0 [[data-modo=movil]_&]:h-full [[data-modo=movil]_&]:content-between [[data-modo=movil]_&]:pb-[calc(var(--footer-radio)+var(--faro-movil))]">
          {/* Primera parada del haz: dónde vive lo que investigamos. */}
          <div id="biblioteca" data-cierre-bloque className="max-w-[30rem] lg:max-w-none lg:justify-self-end">
            <h2
              data-cierre-titulo
              className="font-display text-azul-claro font-extrabold tracking-[-0.02em] text-balance"
              style={{ fontSize: "clamp(1.6rem, 0.8rem + 1.5vw, 2.1rem)", lineHeight: 1.08 }}
            >
              {biblioteca.titulo}
            </h2>
            <div className="mt-7">
              <ButtonSecondary href="/biblioteca" variant="dark" withArrow>
                {biblioteca.boton}
              </ButtonSecondary>
            </div>
          </div>

          {/* El hueco del faro. */}
          <div aria-hidden="true" className="hidden lg:block" />

          {/* Última parada del haz: el camino. */}
          <div data-cierre-bloque className="max-w-[min(30rem,calc(100%-var(--faro-movil)-1rem))] lg:max-w-none">
            <p className="text-azul-claro/70 font-mono text-[0.68rem] tracking-[0.2em] uppercase">
              {conversemos.antetitulo}
            </p>
            <h2
              data-cierre-titulo
              className="font-display mt-5 font-extrabold tracking-[-0.025em] text-balance"
              style={{ fontSize: "clamp(1.6rem, 0.8rem + 1.5vw, 2.1rem)", lineHeight: 1.08 }}
            >
              {conversemos.titulo}
            </h2>
            <div className="mt-8">
              <ButtonPrimary href="/contacto?tema=investigacion">{conversemos.boton}</ButtonPrimary>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
