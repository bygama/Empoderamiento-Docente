import type { Ref } from "react";
import type { Profile } from "@/features/quienes-somos/data/equipo";
import { ACCENT } from "../acentos";
import { StageContent } from "../profileParts";
import { CONTENT_W, cx } from "./estilos";

type Props = {
  profile: Profile;
  activeStage: number;
  refTrack: Ref<HTMLDivElement>;
  refSvg: Ref<SVGSVGElement>;
  refPath: Ref<SVGPathElement>;
};

/**
 * RECORRIDO — camino maestro (el svg que la coreografía dibuja) + etapas
 * alternadas de composición variada, con el nodo SIEMPRE del lado opuesto
 * al contenido.
 */
export function RecorridoEtapas({ profile, activeStage, refTrack, refSvg, refPath }: Props) {
  return (
    <div ref={refTrack} className="relative pt-8 pb-44">
      <svg
        ref={refSvg}
        aria-hidden="true"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible"
      >
        <path
          ref={refPath}
          d=""
          fill="none"
          stroke="#4a6fa5"
          strokeOpacity={0.45}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <ol className="relative z-10 space-y-36 lg:pl-[16rem]">
        {profile.stages.map((stage, i) => {
          const a = ACCENT[stage.color];
          const passed = stage.n <= activeStage;
          const current = stage.n === activeStage;
          const contentRight = i % 2 === 1;
          const nodeSide = contentRight ? "left" : "right";
          return (
            <li key={stage.id} data-stage data-stage-n={stage.n} className="relative">
              {/* Nodo del camino — SIEMPRE del lado opuesto al contenido */}
              <span
                data-stage-node
                data-node-side={nodeSide}
                aria-hidden="true"
                className="absolute top-1 flex h-10 w-10 items-center justify-center"
                style={nodeSide === "right" ? { left: "min(42rem, 82%)" } : { left: "2.5%" }}
              >
                <span
                  className={cx(
                    // 14.1px bold = "texto grande" para WCAG: el numeral en
                    // blanco sobre el acento queda sobre el umbral de 3:1.
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 font-mono text-[0.88rem] font-bold transition-[border-color,color,background-color,scale,box-shadow] duration-500",
                    !current && "bg-white",
                    passed ? cx(a.border, a.text) : "border-azul-principal/20 text-azul-principal/35",
                    current && cx(a.bg, a.glow, "scale-110 !text-white"),
                  )}
                >
                  {stage.n}
                </span>
              </span>

              <div className={cx("relative", CONTENT_W[stage.variant ?? "default"], contentRight && "ml-auto")}>
                <StageContent stage={stage} side={nodeSide} />
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
