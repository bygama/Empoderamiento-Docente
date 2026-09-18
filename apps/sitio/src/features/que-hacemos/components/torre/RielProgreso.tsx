import type { Ref } from "react";

type Props = {
  refRiel: Ref<HTMLDivElement>;
  refFill: Ref<HTMLSpanElement>;
  refPct: Ref<HTMLSpanElement>;
};

/** Riel derecho: progreso del recorrido (barra + porcentaje, los escribe `pintar`). */
export function RielProgreso({ refRiel, refFill, refPct }: Props) {
  return (
    <div
      ref={refRiel}
      aria-hidden="true"
      className="absolute top-1/2 right-5 z-20 hidden -translate-y-1/2 flex-col items-center gap-3 lg:flex xl:right-9"
    >
      <span className="text-gris-texto/60 font-mono text-[0.6rem] tracking-[0.16em] uppercase [writing-mode:vertical-rl]">
        Recorrido
      </span>
      <span className="bg-azul-principal/15 relative block h-36 w-px overflow-hidden">
        <span
          ref={refFill}
          className="bg-verde-concepto absolute inset-0 origin-top"
          style={{ transform: "scaleY(0)" }}
        />
      </span>
      <span
        ref={refPct}
        className="text-azul-principal font-mono text-[0.62rem] tracking-[0.12em]"
      >
        0%
      </span>
    </div>
  );
}
