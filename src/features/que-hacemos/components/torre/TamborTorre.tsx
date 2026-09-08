import type { Ref } from "react";
import type { TAMBORES } from "../../data";
import { CHIP_ANGS, type Geo, type GeoTambor } from "./geometria-torre";

type Tambor = (typeof TAMBORES)[number];

type Props = {
  tambor: Tambor;
  /** Índice de la estación: numera los chips (01 · …). */
  i: number;
  geo: Geo;
  g: GeoTambor;
  refDrum: Ref<HTMLDivElement>;
  refAro: (k: number) => (el: HTMLDivElement | null) => void;
  refChip: (k: number) => (el: HTMLDivElement | null) => void;
  refSpan: (j: number) => (el: HTMLSpanElement | null) => void;
};

/**
 * Un tambor: el nombre rebanado en caracteres posicionados con
 * rotateY(θ)·translateZ(R) (CSS 3D puro), los dos aros del cilindro y los
 * chips con la frase sobre la banda. Todo lo que se mueve lo escribe
 * `pintar`; acá van la geometría de reposo y los colores.
 */
export function TamborTorre({ tambor, i, geo, g, refDrum, refAro, refChip, refSpan }: Props) {
  return (
    <div
      ref={refDrum}
      className="absolute"
      style={{
        transformStyle: "preserve-3d",
        transform: `translate(-50%, -50%) translateY(${i * geo.sp}px)`,
      }}
    >
      {/* Aros del cilindro */}
      {[-1, 1].map((lado, k) => (
        <div
          key={lado}
          ref={refAro(k)}
          aria-hidden="true"
          className="absolute rounded-full border"
          // Aro del color de la estación (antes navy fijo).
          style={{
            borderColor: `color-mix(in srgb, ${tambor.acento} 22%, transparent)`,
            width: geo.r * 2.06,
            height: geo.r * 2.06,
            left: -geo.r * 1.03,
            top: -geo.r * 1.03,
            transform: `translateY(${lado * g.f * 0.72}px) rotateX(90deg)`,
          }}
        />
      ))}
      {/* Chips con la frase de la línea, girando sobre la banda; de
          espaldas se apagan (pintar). */}
      {CHIP_ANGS.map((ang, k) => (
        <div
          key={"chip-" + k}
          ref={refChip(k)}
          aria-hidden="true"
          className="text-azul-principal/85 absolute w-[32ch] text-center font-mono text-[0.68rem] tracking-[0.14em] uppercase [backface-visibility:hidden]"
          style={{
            transform: `translate(-50%, -50%) rotateY(${ang}deg) translateZ(${geo.r + 2}px) translateY(${g.f * 0.62}px)`,
            opacity: 0,
          }}
        >
          {String(i + 1).padStart(2, "0")} · {tambor.frase}
        </div>
      ))}

      {/* Rebanadas del nombre */}
      {g.slices.map((ch, j) => (
        <span
          key={j}
          ref={refSpan(j)}
          className="font-display absolute select-none font-extrabold"
          style={{
            // Color de la estación, no navy fijo: el viaje deja de ser
            // monocromo.
            color: tambor.acento,
            fontSize: g.f,
            lineHeight: 1,
            transform: `translate(-50%, -50%) rotateY(${g.angs[j]}deg) translateZ(${geo.r}px)`,
          }}
        >
          {ch === " " ? " " : ch}
        </span>
      ))}
    </div>
  );
}
