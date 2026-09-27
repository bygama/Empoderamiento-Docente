import Image from "next/image";
import { RevealLines } from "@/components/ui/RevealLines";
import { ArrowUpRight } from "@/components/ui/icons";
import { etiquetaDeCategoria, fechaCorta } from "@/features/novedades/contenido/modelo";
import type { NovedadDelSitio } from "@/features/novedades/contenido/novedad";
import { estiloDeFoco } from "@/lib/contenido/fotos";
import { RevealFoco } from "../RevealFoco";
import { ScrambleText } from "../ScrambleText";
import { LinkNota } from "./LinkNota";
import { VERDE_SOBRE_AZUL } from "./verde-sobre-azul";

/**
 * Card 1, la nota de tapa: grande, texto a la izquierda y foto a sangre a la
 * derecha. Es la protagonista; su titular es el único con jerarquía de H2 en
 * la sección.
 */
export function TapaDestacada({ n }: { n: NovedadDelSitio }) {
  return (
    <article
      data-nd-card
      className="group border-azul-claro/20 hover:border-azul-claro/45 relative grid overflow-hidden rounded-2xl border transition-colors duration-300 md:w-[78%] md:grid-cols-[1.05fr_1fr]"
      style={{
        background: "color-mix(in srgb, var(--color-azul-medio) 12%, var(--color-azul-principal))",
      }}
    >
      <div className="order-2 flex flex-col justify-center p-6 md:order-1 md:p-10">
        <div className="flex items-center gap-3 font-mono text-[0.72rem] tracking-[0.16em] uppercase">
          <ScrambleText text={etiquetaDeCategoria(n.categoria)} style={VERDE_SOBRE_AZUL} />
          <span className="bg-azul-claro/40 h-1 w-1 rounded-full" />
          <span className="text-azul-claro/80">{fechaCorta(n.fecha)}</span>
        </div>

        <RevealLines
          as="h2"
          className="font-display mt-4 font-bold tracking-[-0.02em] text-white"
          style={{ fontSize: "clamp(1.6rem, 1rem + 1.7vw, 2.4rem)", lineHeight: 1.12 }}
        >
          {n.titulo}
        </RevealLines>

        <p className="mt-4 max-w-[48ch] font-sans text-[1rem] leading-relaxed text-white/75">{n.bajada}</p>

        {/* El chip de la flecha se enciende naranja con el hover de TODA
            la card (group): naranja = acción, ganado por interacción.
            «Leer la nota» abre la ficha; si la nota no tiene cuerpo, baja
            al listado (Gastón, 2026-09-11). */}
        <LinkNota n={n} className="mt-7 inline-flex w-fit items-center gap-3 font-sans text-[0.95rem] font-medium text-white">
          Leer la nota
          <span className="group-hover:border-naranja-accion group-hover:bg-naranja-accion flex h-8 w-8 items-center justify-center rounded-full border border-white/25 transition-colors duration-300">
            <ArrowUpRight size={15} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </LinkNota>
      </div>

      {/* Foto a sangre contra el borde derecho; llega desenfocada y se
          enfoca, y al hover respira (zoom lento, como en el listado). */}
      <RevealFoco className="order-1 aspect-[4/3] w-full md:order-2 md:aspect-auto md:h-full">
        <div className="relative h-full w-full overflow-hidden">
          <Image
            src={n.imagen.src}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 480px"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            style={estiloDeFoco(n.imagen.foco)}
          />
        </div>
      </RevealFoco>
    </article>
  );
}
