import type { NIVELES } from "../../data";
import { POS } from "./niveles-escena";

type Nivel = (typeof NIVELES)[number];

/**
 * Un nivel como card. En vivo es un botón absoluto plantado en su `POS` con
 * el ping de aterrizaje y la pista de click; en fallback, una card en grilla.
 * `[data-collapse]` y `[data-collapse-icon]` son las cajas que la coreografía
 * mide (`scrollHeight`) y colapsa: su estructura no se toca.
 */
export function NivelCard({ niv, i, live }: { niv: Nivel; i: number; live: boolean }) {
  return (
    <article
      data-nivel-card
      className={
        live
          ? "absolute w-[clamp(270px,27vw,25rem)] cursor-pointer select-none"
          : "relative"
      }
      style={live ? POS[i] : undefined}
      {...(live
        ? {
            role: "button",
            tabIndex: 0,
            "aria-expanded": true,
            "aria-label": `${niv.k}: ver detalle`,
          }
        : {})}
    >
      {/* Ping al aterrizar: una onda que se expande y se va. */}
      {live && (
        <span
          data-nivel-ping
          aria-hidden="true"
          className="border-verde-concepto/50 pointer-events-none absolute top-1/2 left-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 opacity-0"
        />
      )}
      <div className="border-azul-principal/8 relative rounded-2xl border bg-white p-6 shadow-[0_1px_2px_rgb(31_45_77/0.04),0_24px_50px_-24px_rgb(31_45_77/0.18)]">
        {/* Pista de click: + que rota a × cuando la abrís a mano. */}
        {live && (
          <span
            data-nivel-mas
            aria-hidden="true"
            className="text-verde-concepto-texto absolute top-4 right-5 font-mono text-[1.15rem] leading-none transition-transform duration-300"
          >
            +
          </span>
        )}
        <div data-collapse-icon className="overflow-hidden">
          <span className="bg-verde-concepto/10 text-verde-concepto-texto mb-4 flex h-11 w-11 items-center justify-center rounded-xl font-mono text-[0.85rem] font-semibold">
            {String(i + 1).padStart(2, "0")}
          </span>
        </div>
        <h3 className="font-display text-azul-principal text-[1.35rem] leading-tight font-bold">
          {niv.k}
        </h3>
        <div data-collapse className="overflow-hidden">
          <p className="text-gris-texto mt-3 font-sans text-[1.05rem] leading-relaxed">
            {niv.d}
          </p>
        </div>
      </div>
    </article>
  );
}
