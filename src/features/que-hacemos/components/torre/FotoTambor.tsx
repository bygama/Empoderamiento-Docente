import type { Ref } from "react";
import Image from "next/image";
import type { TAMBORES } from "../../data";

type Tambor = (typeof TAMBORES)[number];

type Props = {
  tambor: Tambor;
  /** Posición en la torre: fija el translateY inicial (después lo escribe `pintar`). */
  y: number;
  refFoto: Ref<HTMLDivElement>;
};

/**
 * Foto flotando DENTRO de su tambor (la "medusa" de la referencia): no rota
 * — viaja con la torre con leve parallax. En 3D queda entre el texto
 * esmerilado de atrás y el texto nítido de adelante.
 */
export function FotoTambor({ tambor, y, refFoto }: Props) {
  return (
    <div
      ref={refFoto}
      aria-hidden="true"
      className="absolute will-change-transform"
      style={{ transform: `translate(-50%, -50%) translateY(${y}px)` }}
    >
      {/* Resplandor del acento detrás de la foto: da aire de color al
          centro del tambor. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 h-[44vmin] w-[44vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: `radial-gradient(circle, color-mix(in srgb, ${tambor.acento} 22%, transparent) 0%, transparent 68%)`,
        }}
      />
      <div
        className="relative h-[30vmin] w-[30vmin] overflow-hidden rounded-full opacity-95 shadow-[0_30px_80px_-30px_rgb(15_23_42/0.5)]"
        style={{ outline: `2px solid color-mix(in srgb, ${tambor.acento} 35%, transparent)`, outlineOffset: "6px" }}
      >
        <Image
          src={tambor.foto}
          alt=""
          fill
          sizes="30vmin"
          className="object-cover"
        />
        <span className="bg-azul-principal/10 absolute inset-0" />
      </div>
    </div>
  );
}
