import Image from "next/image";
import { ArrowUpRight } from "@/components/ui/icons";
import { etiquetaDeCategoria, fechaCorta } from "@/features/novedades/contenido/modelo";
import type { NovedadDelSitio } from "@/features/novedades/contenido/novedad";
import { estiloDeFoco } from "@/lib/contenido/fotos";
import { RevealFoco } from "../RevealFoco";
import { LinkNota } from "./LinkNota";
import { VERDE_SOBRE_AZUL } from "./verde-sobre-azul";

/**
 * Card 2, la que sigue: más chica, corrida abajo a la derecha y montada sobre
 * la esquina de la tapa. Composición invertida (foto a la izquierda) y titular
 * con line-clamp-2: es «la que sigue», deliberadamente no compite.
 */
export function SegundaDestacada({ n }: { n: NovedadDelSitio }) {
  return (
    <article
      data-nd-card
      className="group border-azul-claro/25 hover:border-azul-claro/50 relative z-10 mt-5 ml-auto flex overflow-hidden rounded-2xl border shadow-[0_30px_60px_-30px_rgb(0_0_0/0.55)] transition-colors duration-300 md:-mt-24 md:w-[56%]"
      style={{
        background: "color-mix(in srgb, var(--color-azul-medio) 24%, var(--color-azul-principal))",
      }}
    >
      <RevealFoco delay={0.25} className="w-[36%] shrink-0 self-stretch md:w-[40%]">
        <div className="relative h-full min-h-[8.5rem] w-full overflow-hidden">
          <Image
            src={n.imagen.src}
            alt=""
            fill
            sizes="(max-width: 768px) 40vw, 280px"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            style={estiloDeFoco(n.imagen.foco)}
          />
        </div>
      </RevealFoco>

      <div className="flex min-w-0 flex-col justify-center p-5 md:p-7">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[0.68rem] tracking-[0.14em] uppercase">
          <span style={VERDE_SOBRE_AZUL}>{etiquetaDeCategoria(n.categoria)}</span>
          <span className="bg-azul-claro/40 hidden h-1 w-1 rounded-full sm:block" />
          <span className="text-azul-claro/80">{fechaCorta(n.fecha)}</span>
        </div>

        <h3 className="font-display mt-2.5 line-clamp-2 text-[1.1rem] leading-snug font-bold text-white md:text-[1.35rem]">{n.titulo}</h3>

        <LinkNota n={n} className="text-azul-claro mt-4 inline-flex w-fit items-center gap-2.5 font-sans text-[0.88rem] font-medium">
          Leer la nota
          <span className="group-hover:border-naranja-accion group-hover:bg-naranja-accion group-hover:text-white flex h-7 w-7 items-center justify-center rounded-full border border-white/25 transition-colors duration-300">
            <ArrowUpRight size={13} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </LinkNota>
      </div>
    </article>
  );
}
