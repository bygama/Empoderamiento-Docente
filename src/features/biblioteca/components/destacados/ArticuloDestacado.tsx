import Image from "next/image";
import type { RefObject } from "react";
import { ArrowUpRight } from "@/components/ui/icons";
import { ACCION, type ItemDestacado } from "../../data/materiales";

type ArticuloDestacadoProps = {
  item: ItemDestacado;
  i: number;
  activo: number;
  reduced: boolean;
  /** Callback-ref del artículo: la coreografía lo mide y lo atenúa. */
  refItem: (el: HTMLElement | null) => void;
  /** Solo el primer artículo lleva el slot que define la geometría de la pila. */
  refSlot: RefObject<HTMLDivElement | null>;
};

/**
 * Un artículo destacado. SIN imagen propia en desktop — la columna de
 * medios queda vacía para la pila fija de viajeras; en mobile y con
 * reduced-motion la imagen va inline.
 */
export function ArticuloDestacado({ item, i, activo, reduced, refItem, refSlot }: ArticuloDestacadoProps) {
  const { titulo, tagline, detalle, material } = item;
  // Con reduced-motion no hay pila fija: las imágenes inline se muestran
  // también en desktop.
  const claseImagenInline = reduced ? "" : "lg:hidden";
  return (
    <article
      ref={refItem}
      className={`grid gap-6 border-t border-white/15 py-10 transition-opacity duration-700 md:py-12 lg:min-h-[46svh] lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10 ${
        !reduced && activo !== i ? "lg:opacity-35" : ""
      }`}
    >
      {/* Columna de medios: el primer artículo lleva el slot que
          define la geometría de la pila; el resto, hueco vacío. */}
      {i === 0 ? (
        <div
          ref={refSlot}
          aria-hidden="true"
          className="hidden w-full lg:block lg:aspect-[3/4]"
        />
      ) : (
        <div aria-hidden="true" className="hidden lg:block" />
      )}

      <div className="flex min-w-0 flex-col">
        <div
          className={`${claseImagenInline} bg-azul-medio/25 relative mb-6 aspect-[16/9] overflow-hidden rounded-xl`}
        >
          <Image
            src={material.portada}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>

        {/* hyphens + break-words: títulos con palabras largas
            ("proporcionalidad") desbordaban la columna en anchos
            intermedios (~1024) y estiraban la página 7px. */}
        <h3
          className="font-display font-extrabold tracking-[-0.02em] break-words hyphens-auto text-white"
          lang="es"
          style={{ fontSize: "clamp(1.8rem, 1.1rem + 2.4vw, 2.7rem)", lineHeight: 1.08 }}
        >
          {titulo}
        </h3>
        <p className="text-verde-concepto mt-3 font-sans text-[1.05rem] font-semibold">
          {tagline}
        </p>
        <p className="mt-6 max-w-[58ch] font-sans text-[0.98rem] leading-relaxed text-white/80">
          {material.descripcion}
        </p>
        <p className="mt-4 max-w-[58ch] font-sans text-[0.98rem] leading-relaxed text-white/80">
          {detalle}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-4 lg:mt-auto lg:pt-8">
          <p className="font-mono text-[0.72rem] tracking-[0.08em] text-white/45 uppercase">
            {material.tipo} · {material.fecha} ·{" "}
            {material.paginas
              ? `${material.paginas} páginas`
              : material.formato}
          </p>
          {/* Placeholder hasta tener los archivos reales del catálogo. */}
          <a
            href="#materiales"
            className="bg-naranja-accion inline-flex items-center gap-2 rounded-lg px-5 py-2.5 font-sans text-[0.92rem] font-medium text-white transition-opacity hover:opacity-90"
          >
            {ACCION[material.formato]}
            <ArrowUpRight size={17} />
          </a>
        </div>
      </div>
    </article>
  );
}
