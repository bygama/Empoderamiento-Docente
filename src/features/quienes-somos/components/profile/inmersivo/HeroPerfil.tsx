import type { Ref } from "react";
import type { Profile } from "@/features/quienes-somos/data/equipo";
import { cx } from "./estilos";

type Props = {
  profile: Profile;
  nombrePila: string;
  apellido: string;
  /** Titular en dos tiempos (frase real, partida en oraciones para jerarquía). */
  headlineParts: string[];
  refHero: Ref<HTMLElement>;
  refClone: Ref<HTMLDivElement>;
  refCloneL1: Ref<HTMLSpanElement>;
  refCloneL2: Ref<HTMLSpanElement>;
  refCloneRole: Ref<HTMLSpanElement>;
  refHeroBody: Ref<HTMLDivElement>;
};

/**
 * HERO — apertura editorial: nombre protagonista + frase con peso. El clon
 * del nombre (invisible, en flujo) reserva el espacio del que viaja y le da
 * su pose de hero con sus `clamp()`; la identidad fija se mide contra él.
 */
export function HeroPerfil({
  profile,
  nombrePila,
  apellido,
  headlineParts,
  refHero,
  refClone,
  refCloneL1,
  refCloneL2,
  refCloneRole,
  refHeroBody,
}: Props) {
  return (
    <section ref={refHero} className="relative flex min-h-[100svh] flex-col justify-center pt-24 pb-16">
      {/* Patrón de marca SOLO acá: sutil, localizado tras la figura */}
      <span
        aria-hidden="true"
        className="pattern-dots absolute top-[8%] right-[-2%] h-[64%] w-[40%] opacity-[0.05]"
        style={{
          maskImage: "radial-gradient(ellipse 70% 60% at 60% 45%, #000 30%, transparent 78%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 60% 45%, #000 30%, transparent 78%)",
        }}
      />
      <div className="max-w-[46rem] lg:pr-0">
        {/* Clon del nombre (reserva el espacio del que viaja — solo layout) */}
        <div ref={refClone} aria-hidden="true" className="invisible">
          <span
            ref={refCloneL1}
            className="font-display block font-bold tracking-[-0.02em]"
            style={{ fontSize: "clamp(2.7rem, 1.8rem + 2.8vw, 4.4rem)", lineHeight: 1.06 }}
          >
            {nombrePila}
          </span>
          <span
            ref={refCloneL2}
            className="font-display block font-bold tracking-[-0.02em]"
            style={{ fontSize: "clamp(2.7rem, 1.8rem + 2.8vw, 4.4rem)", lineHeight: 1.06 }}
          >
            {apellido}
          </span>
          <span
            ref={refCloneRole}
            className="block font-mono font-semibold tracking-[0.2em] uppercase"
            style={{ fontSize: "0.95rem", marginTop: 16 }}
          >
            {profile.role}
          </span>
        </div>

        <div ref={refHeroBody}>
          <p
            data-hero-el
            className="font-display mt-8 font-semibold tracking-[-0.015em]"
            style={{ fontSize: "clamp(1.45rem, 1.05rem + 1.3vw, 2.05rem)", lineHeight: 1.22 }}
          >
            {headlineParts.map((part, i) => (
              <span key={part} className={cx("block", i === 0 ? "text-azul-principal" : "text-azul-medio")}>
                {part}
              </span>
            ))}
          </p>
          <p data-hero-el className="text-gris-texto mt-5 max-w-[44ch] font-sans text-[1.02rem] leading-relaxed">
            {profile.intro}
          </p>
          <span
            data-hero-el
            className="text-azul-medio mt-10 inline-flex items-center gap-2.5 font-mono text-[0.72rem] tracking-[0.16em] uppercase"
          >
            <span
              aria-hidden="true"
              className="border-azul-principal/25 flex h-8 w-5 items-start justify-center rounded-full border pt-1.5"
            >
              <span className="bg-verde-concepto h-1.5 w-1 rounded-full motion-safe:animate-[scroll-nudge_1.9s_ease-in-out_infinite]" />
            </span>
            Descubrí su recorrido
          </span>
        </div>
      </div>
    </section>
  );
}
