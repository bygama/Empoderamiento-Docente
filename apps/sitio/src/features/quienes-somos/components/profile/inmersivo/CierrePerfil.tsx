import type { Ref } from "react";
import { ArrowRight } from "@/components/ui/icons";
import type { Profile } from "@/features/quienes-somos/data/equipo";
import { FiguraPerfil } from "./FiguraPerfil";

type Props = {
  profile: Profile;
  figura: NonNullable<Profile["figura"]>;
  onClose: () => void;
  refClosing: Ref<HTMLElement>;
  refClosingFig: Ref<HTMLDivElement>;
};

/** CIERRE — la convergencia: escala, aire y ceremonia. */
export function CierrePerfil({ profile, figura, onClose, refClosing, refClosingFig }: Props) {
  return (
    <section ref={refClosing} data-cierre-perfil className="relative flex min-h-[96svh] flex-col items-center justify-center pb-24 text-center">
      <span
        aria-hidden="true"
        className="pattern-dots absolute inset-x-[22%] top-[8%] h-[52%] opacity-[0.04]"
        style={{
          maskImage: "radial-gradient(ellipse 60% 55% at 50% 40%, #000 25%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse 60% 55% at 50% 40%, #000 25%, transparent 75%)",
        }}
      />
      {/* La figura reaparece, integrada a la convergencia */}
      <FiguraPerfil profile={profile} figura={figura} modo="cierre" refCierre={refClosingFig} />

      <div className="relative max-w-[48rem]">
        <span
          data-closing-el
          className="bg-verde-concepto mx-auto flex h-12 w-12 items-center justify-center rounded-full font-mono text-[0.9rem] font-bold text-white shadow-[0_0_0_9px_rgb(31_154_120/0.13)]"
        >
          ED
        </span>
        {/* Síntesis de la columna: las dimensiones convergen en una línea */}
        <ul aria-hidden="true" className="mt-9 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5">
          {profile.categories.map((c, i) => (
            <li key={c.id} data-closing-cat className="text-gris-texto/90 flex items-center gap-3 font-mono text-[0.62rem] tracking-[0.16em] uppercase">
              {i > 0 && <span aria-hidden="true" className="bg-azul-principal/25 h-1 w-1 rounded-full" />}
              {c.label}
            </li>
          ))}
        </ul>
        <h3
          data-closing-el
          className="font-display text-azul-principal mt-7 font-bold tracking-[-0.02em]"
          style={{ fontSize: "clamp(2.1rem, 1.4rem + 2.2vw, 3.2rem)", lineHeight: 1.06 }}
        >
          {profile.closing.title}
        </h3>
        <p data-closing-el className="text-gris-texto mx-auto mt-6 max-w-[52ch] font-sans text-[1.08rem] leading-relaxed">
          {profile.closing.body}
        </p>
        {profile.closing.body2 && (
          <p data-closing-el className="text-azul-medio mx-auto mt-3 max-w-[52ch] font-sans text-[1.08rem] leading-relaxed">
            {profile.closing.body2}
          </p>
        )}
        <div data-closing-el className="mt-12">
          <button
            type="button"
            onClick={onClose}
            className="border-azul-principal/15 text-azul-principal hover:border-verde-concepto hover:text-verde-concepto-texto focus-visible:outline-verde-concepto inline-flex items-center gap-2 rounded-full border bg-white px-6 py-3 font-sans text-[0.95rem] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <ArrowRight size={16} className="rotate-180" />
            Volver a la red
          </button>
        </div>
      </div>
    </section>
  );
}
