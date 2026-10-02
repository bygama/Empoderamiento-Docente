"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ButtonPrimary } from "@/components/ui/ButtonPrimary";
import { ButtonSecondary } from "@/components/ui/ButtonSecondary";
import type { HeroInvestigacion } from "@/features/investigacion/contenido/hero";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { alClicIrA } from "@/lib/navegar";
import { ConResaltado } from "./ConResaltado";
import { LinternaFaro } from "./LinternaFaro";
import { Bandada } from "./hero/Bandada";
import { CieloNocturno } from "./hero/CieloNocturno";
import { EtapasEnFlujo } from "./hero/EtapasEnFlujo";
import { HojaHistoria } from "./hero/HojaHistoria";
import { crearEncendido } from "./hero/coreografia-encendido";
import { crearHistoria } from "./hero/coreografia-historia";
import { ALTO_PISTA_LVH, crearEscenaMovil } from "./hero/movil/escena";
import { HAZ_POSE_MOVIL } from "./hero/movil/partes";
import { posarQuieto } from "./hero/movil/quieto";

/** Ángulo del haz en el frame estático: posado hacia el titular. */
const HAZ_REPOSO = -168;

/**
 * Sección 1 — Hero: «la luz abre el archivo», en dos vidas sobre la misma
 * sección pinneada. Copy según docs/content/arquitectura-investigacion.md
 * §3; la bajada no se muestra entera: vive repartida en los cuatro beats
 * de la historia. El titular, los botones y los beats llegan por props (de
 * `features/investigacion/contenido/hero.ts` o de la base).
 *
 * - **Encendido (autónomo, al cargar):** de noche, la linterna del faro
 *   plantada abajo a la derecha (el mismo faro de la marca, recortado y
 *   grande, como en el cierre) y el titular a la izquierda en penumbra. La
 *   lámpara se enciende, el haz baja del cielo y se posa sobre el titular,
 *   que se enciende con él: investigar es alumbrar lo que no se ve. Unos
 *   2.5 s, sin bloquear el scroll (hero/coreografia-encendido.ts).
 * - **Historia (scrubbeada):** al scrollear la sección se pinnea, el
 *   titular cede y la luz lo suelta, el faro se apaga y baja girando (el
 *   cierre lo sube girando y lo enciende: mismo gesto, espejado), la hoja
 *   01 sube sobre la noche y las 13 estrellas que la luz tocó bajan en
 *   bandada sobre ella y se arman en la pregunta; después corren los cuatro
 *   beats, riel 01–04, verbo que se releva y frase que se pinta palabra por
 *   palabra (pregunta → lupa → red → espiral)
 *   (hero/coreografia-historia.ts).
 *
 * Las estrellas y los puntos de la constelación son los mismos 13 círculos
 * (hero/Bandada.tsx), en una capa que cubre la sección por encima de la
 * hoja: no hay relevo entre dos dibujos.
 *
 * El SSR renderiza el frame final del encendido (todo encendido, haz
 * posado, cielo estrellado): es lo que ven touch, reduced-motion y las
 * pantallas sin `lg`, donde la linterna no existe y queda el titular sobre
 * la noche. La historia solo existe con la coreografía (desktop con
 * puntero).
 *
 * Bajo `lg` (con alto para la escena) corre la misma historia en una escena
 * pegajosa propia (hero/movil/escena.ts): el titular arriba, los botones
 * abajo a la izquierda y el faro plantado en el borde de la pantalla; el haz
 * lee el titular al pasar y se posa en las estrellas, y al scrollear el faro
 * se hunde, la hoja sube y esas estrellas bajan a armar la pregunta. La pista
 * (`[data-hero-pista]`) le da el recorrido; en escritorio no hace nada.
 */
/** La escena de escritorio (encendido + historia): la arma y devuelve su limpieza. */
function armarVivo(zona: HTMLElement) {
  let restaurar = () => {};
  let limpiar = () => {};
  const ctx = gsap.context(() => {
    const q = gsap.utils.selector(zona);
    const encendido = crearEncendido(zona);
    restaurar = encendido.restaurar;
    limpiar = crearHistoria({
      zona,
      hoja: q<HTMLElement>("[data-hero-hoja]")[0],
      linterna: q<HTMLElement>("[data-hero-linterna]")[0],
      bandada: q<SVGSVGElement>("[data-hero-bandada]")[0],
      destino: q<HTMLElement>("[data-historia-destino]")[0],
      circulos: q<SVGCircleElement>("[data-hero-estrella]"),
      lineas: q<SVGLineElement>("[data-hero-arista]"),
      encendido,
    }).limpiar;
  }, zona);
  return () => {
    ctx.revert();
    limpiar();
    restaurar();
  };
}

export function InvestigacionHero({ contenido }: { contenido: HeroInvestigacion }) {
  const zonaRef = useRef<HTMLElement | null>(null);
  const pistaRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();

  // El modo de la escena: vivo = la historia de escritorio (armarVivo, la de
  // main); movil = la escena pegajosa de celular; quieto = sin movimiento,
  // con el haz posado sobre las estrellas (medido). Se decide
  // entero en cada corrida y se vuelve a decidir al cambiar cualquier media
  // query (rotar el dispositivo o cruzar 1024px), desarmando el modo anterior.
  useIsomorphicLayoutEffect(() => {
    const zona = zonaRef.current;
    const pista = pistaRef.current;
    if (!zona || !pista) return;
    const mqVivo = window.matchMedia("(hover: hover) and (min-width: 64rem)");
    const mqMovil = window.matchMedia("(max-width: 63.999rem) and (min-height: 38.75rem)");
    let limpiar = () => {};
    const decidir = () => {
      limpiar();
      limpiar = () => {};
      const modo = reduced ? "quieto" : mqVivo.matches ? "vivo" : mqMovil.matches ? "movil" : "quieto";
      // La pista lleva el modo antes de armar nada: es lo que vuelve pegajosa
      // a la sección y le da su alto, y la escena se mide con eso puesto.
      zona.dataset.modo = modo;
      pista.dataset.modo = modo;
      if (modo === "vivo") limpiar = armarVivo(zona);
      else if (modo === "movil") limpiar = crearEscenaMovil(zona, pista);
      else if (modo === "quieto") limpiar = posarQuieto(zona);
    };
    decidir();
    mqVivo.addEventListener("change", decidir);
    mqMovil.addEventListener("change", decidir);
    return () => {
      mqVivo.removeEventListener("change", decidir);
      mqMovil.removeEventListener("change", decidir);
      limpiar();
      delete zona.dataset.modo;
      delete pista.dataset.modo;
    };
  }, [reduced]);

  return (
    <div
      ref={pistaRef}
      data-hero-pista
      className="data-[modo=movil]:h-[var(--alto)]"
      style={{ "--alto": `${ALTO_PISTA_LVH}lvh` } as React.CSSProperties}
    >
      {/* `#sentido` es el ancla de «Por qué investigamos» (nav y doc): la
          hoja 01 vive adentro de este pin, así que la sección entera es el
          destino y la historia arranca al scrollear. Fuera del índice
          lateral (ahí el tope es «Portada»). */}
      <section
        ref={zonaRef}
        id="sentido"
        aria-label="Investigar para transformar"
        className="bg-azul-principal bg-grain-dark relative isolate flex min-h-[100svh] overflow-hidden text-white max-lg:min-h-lvh [[data-modo=movil]_&]:sticky [[data-modo=movil]_&]:top-0"
      >
        <CieloNocturno />

        {/* Las esquinas grises del pie que había hasta el 2026-09-14 se
            fueron con «Nacimos de una pregunta»: ahora sigue Líneas, navy
            sobre navy, y el borde recto es el correcto. */}

        {/* ── La linterna, plantada en el piso a la derecha y saliéndose del
            cuadro por arriba: objeto, no paisaje. El haz nace de acá. */}
        <div
          data-hero-linterna
          className="pointer-events-none absolute right-[5vw] bottom-0 z-20 hidden w-[clamp(200px,32svh,300px)] lg:block"
        >
          <LinternaFaro prefijo="hero" largoHaz={1500} hazPose={HAZ_REPOSO} className="block h-auto w-full" />
        </div>

        {/* ── El faro bajo `lg`: objeto, no ícono. Plantado en el borde de la
            escena (que mide un alto GRANDE de pantalla: con la barra del
            navegador a la vista su pie queda detrás de ella, nunca flotando
            sobre un hueco) y pegado al borde derecho. El SSR lo dibuja con el
            haz posado, que es lo que queda sin coreografía. El haz es corto a
            propósito: un cono abierto que se disuelve antes de cruzar la
            pantalla, no una franja que tacha el titular. Nunca menor que el
            foco (950): el cono se dibujaría hacia la izquierda. */}
        <div
          data-hero-linterna-movil
          className="pointer-events-none absolute -right-1 bottom-0 z-20 w-[clamp(96px,19svh,132px)] md:right-8 md:w-[clamp(140px,20svh,190px)] lg:hidden"
        >
          <LinternaFaro prefijo="hero-movil" largoHaz={1400} hazPose={HAZ_POSE_MOVIL} className="block h-auto w-full" />
        </div>

        {/* ── El titular y los dos caminos. `data-hero-acto` es lo que la
            historia hace subir y salir; adentro, `data-hero-rise` es lo que
            el encendido hace aparecer: dos capas, así ninguna coreografía
            pisa los valores de la otra. */}
        <div className="relative z-30 mx-auto grid w-full max-w-screen-xl items-center gap-x-16 px-6 pt-28 pb-24 max-lg:items-stretch max-lg:pt-24 max-lg:pb-[calc(100lvh-100svh+1.75rem)] md:px-12 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Bajo `lg` el bloque se estira: titular arriba y botones abajo a
              la izquierda, sobre el borde VISIBLE (el padding del contenedor
              descuenta la barra del navegador); el cielo del medio es de las
              estrellas y del haz. */}
          <div data-hero-acto className="max-lg:flex max-lg:flex-col">
            <h1
              data-hero-titulo
              className="font-display max-w-[16ch] font-extrabold tracking-[-0.025em] text-white"
              style={{
                fontSize: "clamp(2.4rem, 1rem + 2.9vw, 3.9rem)",
                lineHeight: 1.06,
              }}
            >
              <ConResaltado texto={contenido.titulo} />
            </h1>
            {/* Los dos CTA cortan directo a su sección (sin recorrer las
                escenas del medio), igual que el navbar. El destino queda en
                código: es el trabajo de cada botón (SPEC §4). */}
            <div
              data-hero-rise
              data-hero-botones
              className="mt-9 flex flex-wrap gap-4 max-lg:mt-auto max-lg:pt-9 max-md:flex-col max-md:items-start max-md:gap-3"
            >
              <ButtonPrimary href="#lineas" onClick={alClicIrA("lineas")}>
                {contenido.botonPrincipal}
              </ButtonPrimary>
              <ButtonSecondary
                href="#en-accion"
                variant="dark"
                withArrow
                onClick={alClicIrA("en-accion")}
              >
                {contenido.botonSecundario}
              </ButtonSecondary>
            </div>
          </div>
          {/* El hueco de la linterna. */}
          <div aria-hidden="true" className="hidden lg:block" />
        </div>

        {/* ── Cue de scroll: la página sigue abajo. */}
        <div
          data-hero-acto
          aria-hidden="true"
          className="absolute bottom-8 left-6 z-30 hidden md:left-12 lg:block"
        >
          <div
            data-hero-rise
            className="text-azul-claro/70 flex items-center gap-3 font-mono text-[0.68rem] tracking-[0.2em] uppercase"
          >
            <span className="bg-azul-claro/50 block h-10 w-px" />
            Seguí bajando
          </div>
        </div>

        <HojaHistoria pasos={contenido.pasos} />
        <Bandada />
      </section>
      <EtapasEnFlujo pasos={contenido.pasos} />
    </div>
  );
}
