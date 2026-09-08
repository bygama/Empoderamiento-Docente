import type { Ref } from "react";
import { ArrowRight } from "@/components/ui/icons";
import type { Profile } from "@/features/quienes-somos/data/equipo";
import { ACCENT } from "../acentos";
import { CategoryRail, StageContent } from "../profileParts";
import { cx } from "./estilos";
import { FiguraPerfil } from "./FiguraPerfil";

type Props = {
  profile: Profile;
  figura: NonNullable<Profile["figura"]>;
  onClose: () => void;
  refWrap: Ref<HTMLDivElement>;
};

/** REDUCED MOTION: el perfil completo, lineal, sin coreografía. */
export function PerfilLineal({ profile, figura, onClose, refWrap }: Props) {
  return (
    <div ref={refWrap} data-perfil-lineal className="relative mx-auto max-w-screen-lg px-6 py-20 md:px-10">
      <header className="grid items-center gap-8 md:grid-cols-[1.2fr_1fr]">
        <div>
          <span className="text-verde-concepto-texto font-mono text-[0.72rem] font-semibold tracking-[0.22em] uppercase">
            {profile.role}
          </span>
          <h2
            className="font-display text-azul-principal mt-3 font-bold tracking-[-0.02em]"
            style={{ fontSize: "clamp(2rem, 1.4rem + 2vw, 3rem)", lineHeight: 1.05 }}
          >
            {profile.fullName}
          </h2>
          <p className="text-azul-medio mt-5 max-w-[34ch] font-display text-[1.4rem] leading-[1.15] font-semibold">
            {profile.headline}
          </p>
          <p className="text-gris-texto mt-4 max-w-[52ch] font-sans text-[1rem] leading-relaxed">{profile.intro}</p>
        </div>
        <FiguraPerfil profile={profile} figura={figura} modo="lineal" />
      </header>

      <div className="border-azul-principal/10 mt-10 border-t pt-8">
        <CategoryRail categories={profile.categories} activeId={null} variant="inline" />
      </div>

      <ol className="border-azul-principal/12 mt-12 space-y-14 border-l-2 pl-8">
        {profile.stages.map((stage) => (
          <li key={stage.id} className="relative">
            <span
              aria-hidden="true"
              className={cx("ring-gris-fondo absolute top-1.5 -left-[41px] h-4 w-4 rounded-full ring-4", ACCENT[stage.color].bg)}
            />
            <StageContent stage={stage} />
          </li>
        ))}
      </ol>

      <section className="border-azul-principal/10 mt-16 border-t pt-10">
        <h3
          className="font-display text-azul-principal font-bold tracking-[-0.015em]"
          style={{ fontSize: "clamp(1.6rem, 1.1rem + 1.4vw, 2.2rem)", lineHeight: 1.12 }}
        >
          {profile.closing.title}
        </h3>
        <p className="text-gris-texto mt-4 max-w-[58ch] font-sans text-[1.05rem] leading-relaxed">{profile.closing.body}</p>
        {profile.closing.body2 && (
          <p className="text-azul-medio mt-3 max-w-[58ch] font-sans text-[1.05rem] leading-relaxed">{profile.closing.body2}</p>
        )}
        <button
          type="button"
          onClick={onClose}
          className="border-azul-principal/15 text-azul-principal hover:border-verde-concepto hover:text-verde-concepto-texto focus-visible:outline-verde-concepto mt-8 inline-flex items-center gap-2 rounded-full border bg-white px-5 py-3 font-sans text-[0.95rem] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <ArrowRight size={16} className="rotate-180" />
          Volver a la red
        </button>
      </section>
    </div>
  );
}
