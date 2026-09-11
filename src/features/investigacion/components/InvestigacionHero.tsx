"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Highlight } from "@/components/ui/Highlight";
import { ButtonPrimary } from "@/components/ui/ButtonPrimary";
import { ButtonSecondary } from "@/components/ui/ButtonSecondary";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { alClicIrA } from "@/lib/navegar";
import { LinternaFaro } from "./LinternaFaro";
import { Bandada } from "./hero/Bandada";
import { CieloNocturno } from "./hero/CieloNocturno";
import { HojaHistoria } from "./hero/HojaHistoria";
import { crearEncendido } from "./hero/coreografia-encendido";
import { crearHistoria } from "./hero/coreografia-historia";

/** Ángulo del haz en el frame estático: posado hacia el titular. */
const HAZ_REPOSO = -168;

/**
 * Sección 1 — Hero: «la luz abre el archivo», en dos vidas sobre la misma
 * sección pinneada. Copy según docs/content/arquitectura-investigacion.md
 * §3; la bajada no se muestra entera: vive repartida en los cuatro beats
 * de la historia (constelacion.ts → frase).
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
 */
export function InvestigacionHero() {
  const zonaRef = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    if (reduced) return;
    // 64rem = el `lg:` de Tailwind v4 (la linterna solo existe desde lg).
    if (!window.matchMedia("(hover: hover) and (min-width: 64rem)").matches)
      return;
    const zona = zonaRef.current;
    if (!zona) return;

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

      // Las esquinas de abajo se redondean recién cuando el hero se despega
      // (el usuario, 2026-09-11): clavado, su pie coincide con el borde del
      // viewport y unas esquinas fijas se veían todo el recorrido. Son dos
      // tapas del gris de la página que dibujan la esquina y se prenden por
      // opacidad mientras la sección sale: «bottom bottom» es el fin del pin
      // (ScrollTrigger mide sobre el spacer, no sobre el elemento clavado).
      ScrollTrigger.create({
        trigger: zona,
        start: "bottom bottom",
        end: "bottom top",
        toggleClass: { targets: q("[data-hero-esquina]"), className: "opacity-100" },
      });
    }, zona);
    return () => {
      ctx.revert();
      limpiar();
      restaurar();
    };
  }, [reduced]);

  return (
    <section
      ref={zonaRef}
      aria-label="Investigar para transformar"
      className="bg-azul-principal bg-grain-dark relative isolate flex min-h-[100svh] overflow-hidden text-white"
    >
      <CieloNocturno />

      {/* ── Las esquinas del pie, redondeadas con el radio de la hoja. Dos
          tapas del gris de la página, cada una un cuadrado con el cuarto de
          círculo navy recortado por gradiente radial, que aparecen por
          opacidad cuando el hero se despega (ver el trigger del efecto) para
          que el borde recto del navy no choque con el gris de «Nacimos de una
          pregunta». Nacen invisibles por clase y sin JS quedan así: en
          celular no hay historia ni pin, y el hero termina recto. */}
      {(["left", "right"] as const).map((lado) => (
        <span
          key={lado}
          aria-hidden="true"
          data-hero-esquina
          className={`pointer-events-none absolute bottom-0 z-50 hidden h-5 w-5 opacity-0 transition-opacity duration-300 motion-reduce:transition-none lg:block ${lado === "left" ? "left-0" : "right-0"}`}
          style={{
            background: `radial-gradient(circle at top ${lado === "left" ? "right" : "left"}, transparent calc(1.25rem - 0.5px), var(--color-gris-fondo) 1.25rem)`,
          }}
        />
      ))}

      {/* ── La linterna, plantada en el piso a la derecha y saliéndose del
          cuadro por arriba: objeto, no paisaje. El haz nace de acá. */}
      <div
        data-hero-linterna
        className="pointer-events-none absolute right-[5vw] bottom-0 z-20 hidden w-[clamp(200px,32svh,300px)] lg:block"
      >
        <LinternaFaro prefijo="hero" largoHaz={1500} hazPose={HAZ_REPOSO} className="block h-auto w-full" />
      </div>

      {/* ── El titular y los dos caminos. `data-hero-acto` es lo que la
          historia hace subir y salir; adentro, `data-hero-rise` es lo que el
          encendido hace aparecer: dos capas, así ninguna coreografía pisa
          los valores de la otra. */}
      <div className="relative z-30 mx-auto grid w-full max-w-screen-xl items-center gap-x-16 px-6 pt-28 pb-24 md:px-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div data-hero-acto>
          <h1
            data-hero-titulo
            className="font-display max-w-[16ch] font-extrabold tracking-[-0.025em] text-white"
            style={{
              fontSize: "clamp(2.4rem, 1rem + 2.9vw, 3.9rem)",
              lineHeight: 1.06,
            }}
          >
            <Highlight>Investigamos</Highlight> para transformar la matemática
            escolar.
          </h1>
          {/* Los dos CTA cortan directo a su sección (sin recorrer las
              escenas del medio), igual que el navbar. El secundario va a
              los casos, lo que más se vuelve a buscar (decisión de ED,
              2026-09-08; antes salía a la Biblioteca). */}
          <div data-hero-rise className="mt-9 flex flex-wrap gap-4">
            <ButtonPrimary href="#lineas" onClick={alClicIrA("lineas")}>
              Conocé qué investigamos
            </ButtonPrimary>
            <ButtonSecondary
              href="#en-accion"
              variant="dark"
              withArrow
              onClick={alClicIrA("en-accion")}
            >
              Ver los casos
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

      <HojaHistoria />
      <Bandada />
    </section>
  );
}
