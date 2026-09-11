"use client";

import { useRef } from "react";
import gsap from "gsap";
import { PuntosFaro } from "@/components/ui/PuntosFaro";
import { RotadorPalabras } from "./RotadorPalabras";
import { SplitFlap } from "./SplitFlap";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { NOVEDADES } from "../data";

/**
 * Hero de Novedades — comparte la BASE de marca con Biblioteca (patrón §6
 * vivo: <PuntosFaro />, glow superior contenido, titular blanco con remate en
 * verde-concepto) pero la identidad es propia: el tablero split-flap. Donde
 * Biblioteca es un catálogo quieto con buscador, Novedades es flujo — y lo
 * dice el titular mismo: "Siempre hay [palabra]" con la palabra verde girando
 * en loop por las categorías de la página (<RotadorPalabras />), como tablero
 * de salidas de una estación. La fecha de última actualización usa la misma
 * mecánica (<SplitFlap />): una sola identidad, dos escalas.
 *
 * Diferencias espejadas que se conservan del layout original: el barrido del
 * faro entra por la DERECHA (`desde="derecha"`) y la bola azul-medio por
 * abajo-derecha.
 *
 * Entrada (~2.5s, un gesto): el haz barre encendiendo los puntos; la línea
 * "Siempre hay" sube desde su máscara cuando la luz cruza el centro
 * (constantes de PuntosFaro: delay 0.3 + 1.3s → cruce ≈ 0.95s) mientras el
 * rotador llega GIRANDO y frena sobre "novedades." recién pasada la luz
 * (settleDelay acoplado a ese cruce); glow, bola y remates cierran como en
 * Biblioteca. Sin motion / prefers-reduced-motion: todo visible y quieto,
 * rotador fijo en "novedades.".
 */
// La fecha del tablero es la de la novedad más nueva, con la precisión que
// trae (día·mes·año, mes·año o solo año): antes era un string fijo y quedó
// mostrando la fecha de una nota inventada (Gastón, 2026-09-11).
const ULTIMA = NOVEDADES[0].fecha.split("-").reverse().join("·");

export function NovedadesHero() {
  const rootRef = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return;

    const ctx = gsap.context(() => {
      gsap.set("[data-nh-word]", { yPercent: 115 });
      gsap.set("[data-nh-glow]", { autoAlpha: 0 });
      // Espejo de Biblioteca: allá entra desde la izquierda (x: -170), acá
      // desde la derecha.
      gsap.set("[data-nh-bola]", { x: 170, y: 170 });
      gsap.set("[data-nh-rise]", { autoAlpha: 0, y: 24 });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to("[data-nh-word]", { yPercent: 0, duration: 1, stagger: 0.12 }, 0.75)
        .to("[data-nh-glow]", { autoAlpha: 1, duration: 1, ease: "power2.out" }, 1.0)
        .to("[data-nh-bola]", { x: 0, y: 0, duration: 1 }, 0.9)
        .to("[data-nh-rise]", { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.12 }, 1.45);
    }, root);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      ref={rootRef}
      className="bg-azul-principal relative isolate flex min-h-[88svh] flex-col justify-between overflow-hidden rounded-b-[2rem] pt-28 pb-10 text-white md:rounded-b-[2.75rem] md:pt-32"
      aria-label="Novedades"
    >
      {/* Fondo: glow de faro contenido + forma plana (manual §6) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <span
          data-nh-glow
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(55% 42% at 50% 0%, color-mix(in srgb, var(--color-azul-claro) 24%, transparent), transparent 70%)",
          }}
        />
        <span
          data-nh-bola
          className="bg-azul-medio/25 absolute -right-36 -bottom-44 h-[26rem] w-[26rem] rounded-full"
        />
        {/* Puntos vivos: capa base + haz que sigue al cursor. El barrido entra
            por la DERECHA, espejando el de Biblioteca igual que la bola. */}
        <PuntosFaro desde="derecha" />
      </div>

      {/* Bloque central — centrado, como el hero de Biblioteca. */}
      <div className="mx-auto my-auto flex w-full max-w-screen-xl flex-col items-center px-5 text-center md:px-10">
        <h1
          className="font-display font-extrabold tracking-[-0.03em] text-white"
          style={{ fontSize: "clamp(2.75rem, 1.1rem + 7vw, 6.25rem)", lineHeight: 1 }}
        >
          {/* El texto accesible es ESTABLE (sr-only): el rotador visual es
              aria-hidden y no anuncia cada giro al lector de pantalla. */}
          <span className="sr-only">Siempre hay novedades.</span>
          <span aria-hidden="true" className="block overflow-hidden pb-[0.06em]">
            <span data-nh-word className="block">
              Siempre hay
            </span>
          </span>
          {/* Sin máscara de subida: esta línea ENTRA girando como tablero y
              frena cuando el haz del faro cruza el centro (~0.95s). */}
          <RotadorPalabras
            words={[
              "novedades.",
              "publicaciones.",
              "encuentros.",
              "convocatorias.",
              "prensa.",
            ]}
            settleDelay={0.95}
            className="text-verde-concepto block"
          />
        </h1>

        <p
          data-nh-rise
          className="mt-7 max-w-[54ch] font-sans text-[1.05rem] leading-relaxed text-white/85 md:text-[1.2rem]"
        >
          Seguí de cerca lo que investigamos, diseñamos y llevamos al aula.
        </p>

        {/* Tablero "en vivo": punto verde latiendo + última fecha que gira.
            Apilado (etiqueta arriba, fecha abajo) para que la FECHA quede
            centrada en sí misma y no corrida a la derecha, que es lo que pasa
            cuando etiqueta y fecha comparten un renglón centrado como bloque. */}
        <div
          data-nh-rise
          className="text-azul-claro/90 mt-10 flex flex-col items-center gap-2.5 font-mono text-[0.8rem] tracking-[0.18em] uppercase"
        >
          {/* El punto va absoluto (fuera del flujo) para que NO sume ancho:
              la frase queda centrada en sí misma, como la fecha de abajo. */}
          <span className="relative whitespace-nowrap">
            <span className="bg-verde-concepto absolute top-1/2 -left-5 h-2 w-2 -translate-y-1/2 animate-pulse rounded-full" />
            Última actualización
          </span>
          <SplitFlap
            text={ULTIMA}
            charset="digits"
            trigger="mount"
            className="text-white"
          />
        </div>
      </div>

      {/* Pista de scroll al pie del hero. */}
      <div
        data-nh-rise
        className="mx-auto w-full max-w-screen-xl px-5 text-center md:px-10"
      >
        <span className="font-mono text-[0.72rem] tracking-[0.2em] text-white/45 uppercase">
          Scrolleá para ver lo último ↓
        </span>
      </div>
    </section>
  );
}
