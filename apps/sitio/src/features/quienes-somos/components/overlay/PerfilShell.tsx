import type { Ref } from "react";
import Image from "next/image";
import { fotoDe, TIER_ROTULO, type Persona } from "@/features/quienes-somos/data/equipo";

type Props = {
  persona: Persona;
  /** El retrato: la apertura lo trae desde la card (FLIP-lite). */
  refHero: Ref<HTMLDivElement>;
  /** El bloque de texto: sus hijos entran escalonados desde la izquierda. */
  refContenido: Ref<HTMLDivElement>;
};

/**
 * SHELL (Parte 1) — sin `persona.profile`: foto + nombre + rol + país. Base
 * validada para las personas sin recorrido desarrollado.
 */
export function PerfilShell({ persona, refHero, refContenido }: Props) {
  return (
    <div className="relative z-[1] mx-auto flex h-full max-w-screen-xl items-center px-6 md:px-12">
      <div className="grid w-full items-center gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16">
        <div
          ref={refHero}
          className="relative mx-auto aspect-[4/5] w-full max-w-[26rem] overflow-hidden rounded-[1.8rem] shadow-[0_40px_100px_-40px_rgb(31_45_77/0.5)] ring-1 ring-black/5"
        >
          {/* Quien pidió no publicar retrato lleva la misma superficie
              tipográfica que en su card, no un hueco (ver Persona.sinFoto). */}
          {persona.sinFoto ? (
            <span aria-hidden="true" className="bg-gris-fondo absolute inset-0 block">
              <span className="absolute inset-0 opacity-[0.5] [background-image:radial-gradient(circle,color-mix(in_srgb,var(--color-azul-principal)_22%,transparent)_1.1px,transparent_1.6px)] [background-size:22px_22px]" />
              <span className="font-display text-azul-principal/12 absolute inset-0 flex items-center justify-center text-[7rem] font-extrabold tracking-[-0.04em] select-none">
                {persona.nombre
                  .split(" ")
                  .map((p) => p[0])
                  .join("")}
              </span>
            </span>
          ) : (
            <Image
              src={fotoDe(persona.key)}
              alt={persona.nombre}
              fill
              sizes="(max-width: 768px) 90vw, 420px"
              style={{ objectPosition: persona.imagePosition }}
              priority
              className="object-cover"
            />
          )}
        </div>

        <div ref={refContenido}>
          <span className="text-verde-concepto font-mono text-[0.72rem] font-medium tracking-[0.22em] uppercase">
            {TIER_ROTULO[persona.tier]}
          </span>
          <h2
            className="font-display text-azul-principal mt-3 font-bold tracking-[-0.02em]"
            style={{ fontSize: "clamp(2.2rem, 1.4rem + 2.4vw, 3.4rem)", lineHeight: 1.05 }}
          >
            {persona.nombre}
          </h2>
          <p className="text-azul-medio mt-3 font-sans text-[1.05rem] font-medium">{persona.rol}</p>
          <p className="text-gris-texto mt-1 font-mono text-[0.78rem] tracking-[0.16em] uppercase">{persona.pais}</p>

          <div aria-hidden="true" className="border-azul-principal/10 mt-8 max-w-[16rem] border-t" />
        </div>
      </div>
    </div>
  );
}
