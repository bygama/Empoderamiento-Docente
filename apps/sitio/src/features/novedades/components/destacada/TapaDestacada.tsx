import Image from "next/image";
import { RevealLines } from "@/components/ui/RevealLines";
import { ArrowUpRight } from "@/components/ui/icons";
import { etiquetaDeCategoria } from "@/features/novedades/contenido/modelo";
import { fechaCorta } from "@/features/novedades/contenido/fechas";
import type { NovedadDelSitio } from "@/features/novedades/contenido/novedad";
import { estiloDeFoco } from "@/lib/contenido/fotos";
import { RevealFoco } from "../RevealFoco";
import { ScrambleText } from "../ScrambleText";
import { LinkNota } from "./LinkNota";
import { VERDE_SOBRE_AZUL } from "./verde-sobre-azul";

const FONDO = "color-mix(in srgb, var(--color-azul-medio) 12%, var(--color-azul-principal))";

/**
 * Card 1, la nota de tapa: grande, texto a la izquierda y foto a sangre a la
 * derecha. Es la protagonista; su titular es el único con jerarquía de H2 en
 * la sección.
 *
 * Bajo lg es una PORTADA: la foto ocupa el ancho entero (alta en celular,
 * apaisada en tablet) y la categoría y el titular van encima, sobre un degradé
 * que termina en el color de la card; la bajada y el link quedan debajo. Dos
 * columnas en ese ancho dejaban el texto en una tira de 140 px. El pie guarda
 * aire para la segunda card, que se le monta encima.
 */
export function TapaDestacada({ n, boton }: { n: NovedadDelSitio; boton: string }) {
  return (
    <article
      data-nd-card
      className="group border-azul-claro/20 hover:border-azul-claro/45 relative grid overflow-hidden rounded-2xl border transition-colors duration-300 lg:w-[78%] lg:grid-cols-[1.05fr_1fr]"
      style={{ background: FONDO }}
    >
      <div className="max-lg:contents lg:order-1 lg:flex lg:flex-col lg:justify-center lg:p-10">
        <div className="max-lg:relative max-lg:z-10 max-lg:col-start-1 max-lg:row-start-1 max-lg:self-end max-lg:px-5 max-lg:pb-1 md:max-lg:px-8">
          <div className="flex items-center gap-3 font-mono text-[0.72rem] tracking-[0.16em] uppercase">
            <ScrambleText text={etiquetaDeCategoria(n.categoria)} style={VERDE_SOBRE_AZUL} />
            <span className="bg-azul-claro/40 h-1 w-1 rounded-full" />
            <span className="text-azul-claro/80">{fechaCorta(n.fecha)}</span>
          </div>

          <RevealLines
            as="h2"
            className="font-display mt-4 font-bold tracking-[-0.02em] text-white max-lg:mt-3"
            style={{ fontSize: "clamp(1.6rem, 1rem + 1.7vw, 2.4rem)", lineHeight: 1.12 }}
          >
            {n.titulo}
          </RevealLines>
        </div>

        <div className="flex flex-col max-lg:row-start-2 max-lg:px-5 max-lg:pt-3 max-lg:pb-14 md:max-lg:px-8 md:max-lg:pb-16">
          <p className="mt-4 max-w-[48ch] font-sans text-[1rem] leading-relaxed text-white/75 max-lg:mt-0 max-lg:line-clamp-3 max-md:hidden">{n.bajada}</p>

          {/* El chip de la flecha se enciende naranja con el hover de TODA
              la card (group): naranja = acción, ganado por interacción.
              «Leer la nota» abre la ficha; si la nota no tiene cuerpo, baja
              al listado (Gastón, 2026-09-11). */}
          <LinkNota n={n} className="mt-7 inline-flex w-fit items-center gap-3 font-sans text-[0.95rem] font-medium text-white max-lg:mt-4 max-lg:min-h-11 max-md:mt-0">
            {boton}
            <span className="group-hover:border-naranja-accion group-hover:bg-naranja-accion flex h-8 w-8 items-center justify-center rounded-full border border-white/25 transition-colors duration-300">
              <ArrowUpRight size={15} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </LinkNota>
        </div>
      </div>

      {/* Foto a sangre contra el borde derecho; llega desenfocada y se
          enfoca, y al hover respira (zoom lento, como en el listado). */}
      <RevealFoco className="aspect-[4/5] w-full max-lg:col-start-1 max-lg:row-start-1 md:aspect-[16/9] lg:order-2 lg:aspect-auto lg:h-full">
        <div className="relative h-full w-full overflow-hidden">
          <Image
            src={n.imagen.src}
            alt=""
            fill
            sizes="(max-width: 1023px) 100vw, 480px"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            style={estiloDeFoco(n.imagen.foco)}
          />
          {/* Portada: el degradé que sostiene el titular sobre la foto. */}
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-0 -bottom-px lg:hidden"
            style={{ background: `linear-gradient(to top, ${FONDO} 0%, color-mix(in srgb, ${FONDO} 78%, transparent) 30%, transparent 68%)` }}
          />
        </div>
      </RevealFoco>
    </article>
  );
}
