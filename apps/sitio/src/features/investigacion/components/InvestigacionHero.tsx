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
import { HistoriaMovil } from "./hero/HistoriaMovil";
import { HojaHistoria } from "./hero/HojaHistoria";
import { crearEncendido } from "./hero/coreografia-encendido";
import { HAZ_POSE_MOVIL, posarQuieto } from "./hero/coreografia-encendido-movil";
import { crearEntregaMovil } from "./hero/coreografia-entrega-movil";
import { crearHistoria } from "./hero/coreografia-historia";

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
 * Bajo `lg` (con alto para la escena) el faro chico también se enciende al
 * cargar, y al scrollear su haz baja hacia la historia móvil y se la entrega
 * (hero/coreografia-entrega-movil.ts).
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
  const reduced = useReducedMotion();

  // El modo de la escena: vivo = la historia de escritorio (armarVivo, la de
  // main); movil = el faro chico encendido + la entrega; quieto = sin
  // movimiento, con el haz posado hacia el titular (medido). Se decide
  // entero en cada corrida y se vuelve a decidir al cambiar cualquier media
  // query (rotar el dispositivo o cruzar 1024px), desarmando el modo anterior.
  useIsomorphicLayoutEffect(() => {
    const zona = zonaRef.current;
    if (!zona) return;
    const mqVivo = window.matchMedia("(hover: hover) and (min-width: 64rem)");
    const mqMovil = window.matchMedia("(max-width: 63.999rem) and (min-height: 38.75rem)");
    let limpiar = () => {};
    const decidir = () => {
      limpiar();
      limpiar = () => {};
      const modo = reduced ? "quieto" : mqVivo.matches ? "vivo" : mqMovil.matches ? "movil" : "quieto";
      zona.dataset.modo = modo;
      if (modo === "vivo") limpiar = armarVivo(zona);
      else if (modo === "movil") limpiar = crearEntregaMovil(zona);
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
    };
  }, [reduced]);

  return (
    <>
      {/* `#sentido` es el ancla de «Por qué investigamos» (nav y doc): la
          hoja 01 vive adentro de este pin, así que la sección entera es el
          destino y la historia arranca al scrollear. Fuera del índice
          lateral (ahí el tope es «Portada»). */}
      <section
        ref={zonaRef}
        id="sentido"
        aria-label="Investigar para transformar"
        className="bg-azul-principal bg-grain-dark relative isolate flex min-h-[100svh] max-lg:min-h-[92lvh] overflow-hidden text-white"
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

        {/* ── El faro chico bajo `lg`: el mismo lenguaje del faro grande, a
            un tamaño que no compite con el titular ni con los CTA. Se
            enciende y entrega la historia (efecto de arriba); el SSR lo
            dibuja con el haz posado, que es lo que queda sin coreografía. El
            haz es largo porque nace en la esquina y tiene que llegar al
            titular; nunca menor que el foco (950): el cono se dibujaría hacia
            la izquierda y todos los ángulos se invertirían. */}
        <div
          data-hero-linterna-movil
          className="pointer-events-none absolute right-2 bottom-0 z-20 w-[clamp(64px,16svh,88px)] lg:hidden"
        >
          <LinternaFaro prefijo="hero-movil" largoHaz={3200} hazPose={HAZ_POSE_MOVIL} className="block h-auto w-full" />
        </div>

        {/* ── El titular y los dos caminos. `data-hero-acto` es lo que la
            historia hace subir y salir; adentro, `data-hero-rise` es lo que
            el encendido hace aparecer: dos capas, así ninguna coreografía
            pisa los valores de la otra. */}
        <div className="relative z-30 mx-auto grid w-full max-w-screen-xl items-center gap-x-16 px-6 pt-28 pb-24 max-lg:pt-24 max-lg:pb-44 md:px-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div data-hero-acto>
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
            <div data-hero-rise className="mt-9 flex flex-wrap gap-4">
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
      <HistoriaMovil pasos={contenido.pasos} />
    </>
  );
}
