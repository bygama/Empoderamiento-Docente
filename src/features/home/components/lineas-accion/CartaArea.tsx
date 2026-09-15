import type { Area } from "./data";

/**
 * La cara de una carta del abanico de Áreas. La capa `data-deck-inner` es la
 * que inclina el tilt por hover; el <li> que la envuelve (en LineasAccion) es
 * el que mueve el reparto, así los dos transforms no se pisan.
 */
export function CartaArea({
  area: { n, titulo, frase, detalle, Icon },
  azulBase,
}: {
  area: Area;
  azulBase: boolean;
}) {
  return (
    <div
      data-deck-inner
      className="deck-card-inner flex h-full flex-col overflow-hidden"
    >
      {/* Encabezado de la carta: etiqueta de área + paginado. */}
      <div className="flex items-start justify-between px-7 pt-6">
        <span className="text-naranja-accion font-mono inline-flex items-center gap-2 text-[0.72rem] font-medium tracking-[0.26em] uppercase">
          <span aria-hidden="true" className="bg-naranja-accion block h-px w-5" />
          Área {n}
        </span>
        <span className="text-azul-principal/20 font-mono text-[0.72rem] font-medium tabular-nums">
          {n} / 07
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
    </div>
  );
}
