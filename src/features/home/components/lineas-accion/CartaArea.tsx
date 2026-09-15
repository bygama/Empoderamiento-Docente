import type { Area } from "./data";

/**
 * Una carta del abanico de Áreas, en tres capas para que ningún transform
 * pise a otro: el <li> que la envuelve (en LineasAccion) lo mueve el reparto
 * con scroll; `data-deck-mano` es la que se saca del mazo al elegirla
 * (asoma, se endereza, le abren lugar), y `data-deck-inner` es la superficie,
 * que se inclina apenas con el cursor. Las capas de efecto arrancan en
 * opacidad 0 y solo las enciende `mano-cartas.ts`: en la grilla estática
 * (mobile, reduced-motion) no existen a la vista.
 */
export function CartaArea({
  area: { n, titulo, frase, detalle, Icon },
  total,
  azulBase,
}: {
  area: Area;
  total: number;
  azulBase: boolean;
}) {
  return (
    <div data-deck-mano className="relative h-full">
      {/* Sombra larga de la carta elegida: se enciende por opacidad. */}
      <span
        data-deck-sombra
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[1.4rem] opacity-0 shadow-[0_46px_80px_-30px_rgb(31_45_77/0.38),0_20px_40px_-20px_rgb(31_45_77/0.22)]"
      />
      <div
        data-deck-inner
        className="deck-card-inner relative isolate flex h-full flex-col overflow-hidden"
      >
        {/* Encabezado de la carta: etiqueta de área + paginado. */}
        <div className="flex items-start justify-between px-7 pt-6">
          <span className="text-naranja-accion font-mono inline-flex items-center gap-2 text-[0.72rem] font-medium tracking-[0.26em] uppercase">
            <span aria-hidden="true" className="bg-naranja-accion block h-px w-5" />
            Área {n}
          </span>
          <span className="text-azul-principal/20 font-mono text-[0.72rem] font-medium tabular-nums">
            {n} / {String(total).padStart(2, "0")}
          </span>
        </div>

        {/* Título (héroe de la carta) + frase destacada + detalle. */}
        <div className="flex flex-1 flex-col px-7 pt-5">
          <h3 className="font-display text-azul-principal text-[1.18rem] leading-[1.16] font-bold tracking-[-0.012em]">
            {titulo}
          </h3>
          <p className="text-verde-concepto mt-2.5 font-sans text-[0.9rem] font-semibold leading-snug">
            {frase}
          </p>
          <p className="text-gris-texto mt-2 font-sans text-[0.85rem] leading-relaxed">
            {detalle.antes}
            <strong className="text-azul-principal font-semibold">
              {detalle.clave}
            </strong>
            {detalle.despues}
          </p>
        </div>

        {/* Base con el ícono de marca — identidad propia por área. En pantallas
            bajas se afina para que el texto entre entre el menú y el CTA. */}
        <div
          className={`relative mt-5 flex h-[4.25rem] items-center justify-center overflow-hidden lg:h-[6rem] lg:[@media(max-height:700px)]:h-[4.5rem] ${
            azulBase
              ? "bg-azul-claro/25 text-azul-medio"
              : "bg-verde-concepto/[0.12] text-verde-concepto"
          }`}
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-3 -bottom-3 h-24 w-24 opacity-50 [background-image:radial-gradient(circle,rgb(74_111_165/0.22)_2px,transparent_2.5px)] [background-size:14px_14px]"
          />
          <Icon size={44} strokeWidth={1.4} />
        </div>

        {/* Velo: apaga apenas a las vecinas mientras otra está al frente. */}
        <span
          data-deck-velo
          aria-hidden="true"
          className="bg-azul-principal pointer-events-none absolute inset-0 opacity-0"
        />
        {/* Luz sobre papel satinado: un foco tenue que sigue al cursor. Va
            detrás del texto (-z dentro de la carta aislada) para no agrisarlo. */}
        <span
          data-deck-luz
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-0"
        >
          <span
            data-deck-luz-foco
            className="absolute top-0 left-0 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgb(169_197_232/0.22),transparent_60%)]"
          />
        </span>
        {/* Brillo del canto: el mismo foco, recortado al borde de la carta. */}
        <span
          data-deck-borde
          aria-hidden="true"
          className="deck-borde-luz pointer-events-none absolute inset-0 overflow-hidden opacity-0"
        >
          <span
            data-deck-borde-foco
            className="absolute top-0 left-0 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgb(74_111_165/0.95),transparent_65%)]"
          />
        </span>
      </div>
    </div>
  );
}
