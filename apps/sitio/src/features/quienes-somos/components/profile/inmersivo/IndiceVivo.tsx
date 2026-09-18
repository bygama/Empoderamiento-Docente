import type { Ref } from "react";
import type { Profile } from "@/features/quienes-somos/data/equipo";
import { CategoryRail } from "../profileParts";

type Props = {
  profile: Profile;
  activeStage: number;
  activeCategoryId: string | null;
  passedIds: Set<string>;
  refSidebar: Ref<HTMLElement>;
};

/**
 * ÍNDICE VIVO (fijo, bajo el nombre aterrizado): las categorías con activo y
 * memoria de lo recorrido, y el progreso del recorrido. Decorativo para AT
 * (aria-hidden): el contenido real vive en las etapas.
 */
export function IndiceVivo({ profile, activeStage, activeCategoryId, passedIds, refSidebar }: Props) {
  const total = profile.stages.length;
  return (
    <aside
      ref={refSidebar}
      aria-hidden="true"
      className="pointer-events-none fixed top-[12.5rem] z-[6] hidden w-[14.5rem] flex-col lg:flex"
      style={{ left: "max(1.25rem, calc((100vw - 1440px)/2 + 1.5rem))" }}
    >
      <CategoryRail categories={profile.categories} activeId={activeCategoryId} passedIds={passedIds} variant="sidebar" />
      <div className="mt-8 pl-5">
        <div className="text-gris-texto flex items-center justify-between font-mono text-[0.62rem] tracking-[0.12em] uppercase">
          <span>Recorrido</span>
          <span>
            {String(activeStage).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
        </div>
        <div className="bg-azul-principal/10 mt-2 h-[3px] w-full overflow-hidden rounded-full">
          <div
            className="bg-verde-concepto h-full rounded-full transition-[width] duration-700 ease-out"
            style={{ width: `${(activeStage / total) * 100}%` }}
          />
        </div>
      </div>
    </aside>
  );
}
