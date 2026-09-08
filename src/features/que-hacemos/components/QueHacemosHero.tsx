"use client";

import { useRef, type CSSProperties } from "react";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { useMouseParallax } from "@/lib/hooks/useMouseParallax";
import { crearEntradaQH } from "./que-hacemos-hero/coreografia-hero-qh";
import { crearEstrellaFugaz } from "./que-hacemos-hero/estrella-fugaz";
import { crearMagnetismo } from "./que-hacemos-hero/capsula-magnetismo";
import { crearPortal } from "./que-hacemos-hero/portal-viaje";
import { CieloPolvo } from "./que-hacemos-hero/CieloPolvo";
import { TitularQH } from "./que-hacemos-hero/TitularQH";
import { CapsulaPortal } from "./que-hacemos-hero/CapsulaPortal";

/**
 * Hero de Qué hacemos — pantalla completa (100svh) a sangre, sin bordes
 * redondeados, todo centrado en el medio: titular, bajada y el botón portal
 * (referencia Ink). Fondo atmosférico propio, "NOCHE DE FARO" — distinto
 * de Biblioteca/Novedades (que comparten la grilla de PuntosFaro): navy
 * que oscurece hacia arriba, HORIZONTE DE LUZ azul abajo (el faro debajo
 * del horizonte, a punto de encenderse — el click del portal lo enciende
 * en verde encima), CIELO ESTRELLADO disperso (constelación determinista,
 * algunas titilan) y EL HAZ DEL FARO GIRANDO: un cono ancho (~48°)
 * y muy tenue (pico 6%) da la vuelta cada 18s — no se ve un rayo, la
 * zona del cielo que toca respira un poco más de luz. Titular: "Generamos y /
 * transformamos." (antes "No formamos. / Transformamos."; se cambió a
 * pedido de Gastón el 2026-09-01). PENDIENTE validar titular exacto con ED.
 *
 * SIN escena de fotos: las imágenes flotantes competían con el titular y
 * adelantaban lo que la torre muestra mejor. En su lugar el primer viewport
 * gana un POLVO de estrellas finas y una ESTRELLA FUGAZ ocasional (una
 * sola, cada ~9-13s, sutil) — vida sin protagonismo. El cielo de fondo es
 * el compartido con la escena del faro (page.tsx): un solo cielo.
 *
 * Entrada: el haz barre encendiendo los puntos y las dos líneas suben desde
 * su máscara cuando la luz cruza el centro (~0.95s, constantes de PuntosFaro).
 * Sin motion: todo visible y quieto.
 *
 * MOUSE-PARALLAX (misma fórmula que el hero del home): un solo RAF con lerp
 * setea --qhx/--qhy (-1..1 desde el centro del viewport) sobre la section.
 * Cada capa los multiplica por su profundidad: el contenido sigue LEVEMENTE
 * al cursor (+), el fondo (glow/bola) se desplaza en contra (-) para dar
 * profundidad. Amplitudes chicas (≤18px) — acompaña, no marea. Solo con
 * puntero fino (hover:hover); sin motion no hay parallax.
 *
 * ESTRUCTURA (referencia Ink): titular blanco con "transformamos." teñido
 * de celeste y subrayado verde (el marcador de concepto en versión
 * subrayado) → bajada → CÁPSULA DE LUZ VERDE (el portal).
 *
 * Portal al recorrido — cápsula de luz: vidrio verde con halo que respira,
 * deliberadamente distinta del CTA naranja del sitio (esto no es un CTA de
 * conversión: es el interactivo del hero). Juguetona: magnetismo fuerte
 * desde un radio amplio con retorno elástico, parallax interno del texto,
 * olita de letras y flecha en hover. Click Y hold encienden: apretar
 * hincha el cuerpo (squash gomoso) mientras la luz interna crece con la
 * carga (~1.1s); soltar antes = click, la carga restante se acelera
 * (~0.4s). Al completar: pop elástico, la luz verde inunda desde abajo y
 * arranca el VIAJE NOCTURNO: un scroll automático largo (~4s, easing
 * cinematográfico) que atraviesa la noche y entra al scroll-story del faro
 * hasta dejarlo ENCENDIDO (p≈0.30 de su timeline). Como es scroll real, el
 * usuario puede frenarlo o seguirlo a su ritmo. El hover aviva la brasita
 * (carga al 15%) como affordance. NO es una puerta: scrollear de largo
 * sigue funcionando siempre. Teclado (click sintético) carga rápido; con
 * prefers-reduced-motion la cápsula queda quieta y el click salta directo.
 *
 * Piezas (una por efecto, cada una con su limpieza): entrada en
 * `que-hacemos-hero/coreografia-hero-qh.ts`, estrella en `estrella-fugaz.ts`,
 * magnetismo en `capsula-magnetismo.ts`, portal y viaje en `portal-viaje.ts`;
 * markup en `CieloPolvo`, `TitularQH` y `CapsulaPortal`.
 */
export function QueHacemosHero() {
  const rootRef = useRef<HTMLElement | null>(null);
  const holdRef = useRef<HTMLButtonElement | null>(null);
  const campoRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLSpanElement | null>(null);
  const reduced = useReducedMotion();

  // ── Entrada ────────────────────────────────────────────────────────────
  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return;
    return crearEntradaQH(root);
  }, [reduced]);

  // ── Mouse-parallax del hero ────────────────────────────────────────────
  // Solo actualiza CSS vars; las capas mueven vía transform con calc() — GSAP
  // nunca toca esos nodos, así que no hay pelea de transforms. EASE bajo =
  // trailing suave. Solo con hover real. El RAF con lerp vive en el hook.
  useMouseParallax(rootRef, { x: "--qhx", y: "--qhy", ease: 0.07, activo: !reduced, soloHover: true });

  // ── Estrella fugaz ocasional ───────────────────────────────────────────
  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return;
    const fugaz = root.querySelector<HTMLElement>("[data-qh-fugaz]");
    if (!fugaz) return;
    return crearEstrellaFugaz(fugaz);
  }, [reduced]);

  // ── Cápsula: magnetismo fuerte + olita de letras ───────────────────────
  useIsomorphicLayoutEffect(() => {
    const campo = campoRef.current;
    const inner = innerRef.current;
    const btn = holdRef.current;
    if (!campo || !inner || !btn || reduced) return;
    return crearMagnetismo(campo, inner, btn);
  }, [reduced]);

  // ── Portal al recorrido (click / hold sobre la cápsula) ────────────────
  useIsomorphicLayoutEffect(() => {
    const btn = holdRef.current;
    const root = rootRef.current;
    if (!btn || !root) return;
    return crearPortal(btn, root, reduced);
  }, [reduced]);

  // overflow-x-clip y NO overflow-hidden: el recorte horizontal sigue haciendo
  // falta (el titular a 2.75rem se pasa del ancho en pantallas angostas y
  // generaría scroll lateral), pero el vertical tiene que quedar abierto
  // para que la luz del portal pueda cruzar el borde inferior y caer sobre
  // la escena del faro. El polvo de estrellas se recorta solo, en su span.
  return (
    <section
      ref={rootRef}
      className="relative z-20 isolate flex min-h-svh flex-col justify-center overflow-x-clip pt-24 pb-12 text-white"
      aria-label="Qué hacemos"
      style={
        {
          "--qhx": "0",
          "--qhy": "0",
          // Sin fondo propio: lo pone el envoltorio compartido con la
          // escena del faro (ver app/que-hacemos/page.tsx), para que no haya
          // costura entre los dos cielos.
        } as CSSProperties
      }
    >
      {/* SIN FONDO PROPIO. Antes esta sección tenía sus propias capas —
          resplandor de horizonte, cielo estrellado y un haz girando— que la
          hacían distinta de la escena del faro que viene abajo y marcaban
          una línea horizontal en la junta. Ahora el cielo lo pone
          únicamente el envoltorio compartido (app/que-hacemos/page.tsx) y
          las dos secciones se leen como una sola.
          Se conserva el glow verde del botón: es respuesta a la interacción,
          no decorado de fondo. */}
      <CieloPolvo />

      <div
        className="relative z-10 mx-auto flex w-full max-w-screen-xl flex-col items-center px-5 text-center will-change-transform md:px-10"
        style={{
          // Sigue al mouse y ADEMÁS se inclina apenas hacia él (mira al
          // cursor) — mismos signos que useTilt: rotateY con x, rotateX
          // contra y. Ángulos chicos para que acompañe sin marear.
          transform:
            "perspective(1000px) translate3d(calc(var(--qhx, 0) * 10px), calc(var(--qhy, 0) * 8px), 0) rotateY(calc(var(--qhx, 0) * 2.6deg)) rotateX(calc(var(--qhy, 0) * -2.1deg))",
        }}
      >
        <TitularQH />
        <CapsulaPortal refCampo={campoRef} refBoton={holdRef} refInner={innerRef} />
      </div>
    </section>
  );
}
