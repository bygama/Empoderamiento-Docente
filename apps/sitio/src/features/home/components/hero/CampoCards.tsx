import Image from "next/image";
import type { Hero } from "@/features/home/contenido/hero";
import { estiloDeFoco } from "@/lib/contenido/fotos";
import { GEOMETRIA_CARDS } from "./geometria-hero";

/**
 * Campo de tarjetas dispersas (desktop, ≥ lg). Tres capas por tarjeta:
 * `[data-card-outer]` (posición + parallax de scroll), `[data-card-mouse]`
 * (parallax de mouse por profundidad) y `[data-card-inner]` (la entrada).
 * La geometría vive en código; foto y cartel llegan por props, en el mismo
 * orden.
 */
export function CampoCards({ tarjetas }: { tarjetas: Hero["tarjetas"] }) {
  return (
    <div
      data-hero-cards
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-10 hidden lg:block"
    >
      {GEOMETRIA_CARDS.map((c, i) => {
        const tarjeta = tarjetas[i];
        // El esquema garantiza once; el chequeo es por si alguna vez llega un documento a medias.
        if (!tarjeta) return null;
        // Profundidad del mouse-parallax: más grande = más cerca = se mueve más
        // (negativo = en contra del mouse), igual que la referencia.
        const depth = -Math.round(c.w * 2);
        return (
          <div
            key={i}
            data-card-outer
            data-par={c.par}
            className="absolute"
            style={{ left: `${c.cx}%`, top: `${c.cy}%`, width: `${c.w}vw`, transform: "translate(-50%, -50%)" }}
          >
            <div
              data-card-mouse
              style={{ transform: `translate(calc(var(--pnx, 0) * ${depth}px), calc(var(--pny, 0) * ${depth}px))` }}
            >
              <div data-card-inner className="relative">
                <div
                  className="relative w-full overflow-hidden rounded-2xl shadow-[0_28px_70px_-28px_rgb(31_45_77_/_0.5)] ring-1 ring-white/40"
                  style={{ aspectRatio: c.ar }}
                >
                  {/* Sin style cuando el foco está en el centro: el HTML de hoy queda igual. */}
                  <Image
                    src={tarjeta.foto.src}
                    alt={tarjeta.foto.alt}
                    fill
                    sizes="22vw"
                    className="object-cover"
                    style={estiloDeFoco(tarjeta.foto.foco)}
                  />
                </div>

                {/* Cartel referencial (tipo web de referencia): sobresale del
                    borde inferior para "rellenar" el hueco al scrollear. */}
                {tarjeta.cartel && (
                  <div
                    data-card-label
                    className="absolute -bottom-5 left-3 z-10 w-max max-w-[20rem] rounded-xl bg-white/85 px-3.5 py-2.5 shadow-[0_16px_36px_-18px_rgb(31_45_77_/_0.45)] ring-1 ring-azul-principal/10 backdrop-blur-md"
                  >
                    <p className="font-display text-verde-concepto text-[0.82rem] leading-tight font-semibold tracking-[-0.01em]">
                      {tarjeta.cartel.titulo}
                    </p>
                    <p className="text-gris-texto mt-0.5 font-sans text-[0.72rem] leading-snug whitespace-nowrap">
                      {tarjeta.cartel.descripcion}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
