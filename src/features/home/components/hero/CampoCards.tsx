import Image from "next/image";
import { CARDS } from "./hero-cards";

/**
 * Campo de tarjetas dispersas (desktop, ≥ lg). Tres capas por tarjeta:
 * `[data-card-outer]` (posición + parallax de scroll), `[data-card-mouse]`
 * (parallax de mouse por profundidad) y `[data-card-inner]` (la entrada).
 */
export function CampoCards() {
  return (
    <div
      data-hero-cards
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-10 hidden lg:block"
    >
      {CARDS.map((c, i) => {
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
              className="will-change-transform"
              style={{ transform: `translate(calc(var(--pnx, 0) * ${depth}px), calc(var(--pny, 0) * ${depth}px))` }}
            >
              <div data-card-inner className="relative">
                <div
                  className="relative w-full overflow-hidden rounded-2xl shadow-[0_28px_70px_-28px_rgb(31_45_77_/_0.5)] ring-1 ring-white/40"
                  style={{ aspectRatio: c.ar }}
                >
                  {c.img ? (
                    <Image src={c.img} alt={c.alt ?? ""} fill sizes="22vw" className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-azul-principal via-[#34507f] to-verde-concepto">
                      <span
                        className="absolute inset-0 opacity-30"
                        style={{ background: "radial-gradient(circle at 30% 25%, rgb(255 255 255 / 0.5) 0%, transparent 55%)" }}
                      />
                      <span className="font-display absolute bottom-3 left-4 text-[1.5rem] font-bold tracking-tight text-white/85">
                        ED
                      </span>
                    </div>
                  )}
                </div>

                {/* Cartel referencial (tipo web de referencia): sobresale del
                    borde inferior para "rellenar" el hueco al scrollear. */}
                {c.label && (
                  <div
                    data-card-label
                    className="absolute -bottom-5 left-3 z-10 w-max max-w-[20rem] rounded-xl bg-white/85 px-3.5 py-2.5 shadow-[0_16px_36px_-18px_rgb(31_45_77_/_0.45)] ring-1 ring-azul-principal/10 backdrop-blur-md"
                  >
                    <p className="font-display text-verde-concepto text-[0.82rem] leading-tight font-semibold tracking-[-0.01em]">
                      {c.label.title}
                    </p>
                    {c.label.desc && (
                      <p className="text-gris-texto mt-0.5 font-sans text-[0.72rem] leading-snug whitespace-nowrap">
                        {c.label.desc}
                      </p>
                    )}
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
