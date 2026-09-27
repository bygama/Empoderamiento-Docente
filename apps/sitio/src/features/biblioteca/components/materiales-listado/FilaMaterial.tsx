import Image from "next/image";
import { ArrowUpRight } from "@/components/ui/icons";
import type { MaterialDelSitio } from "@/features/biblioteca/contenido/material";
import { accionDe } from "@/features/biblioteca/contenido/modelo";
import { estiloDeFoco } from "@/lib/contenido/fotos";

/** Una fila del catálogo: portada, chips de tipo y tema, título, autores, descripción, metadata y el link de acción. */
export function FilaMaterial({ material: m }: { material: MaterialDelSitio }) {
  return (
    <article className="grid gap-5 py-7 md:grid-cols-[218px_minmax(0,1fr)] md:gap-8 md:py-8">
      {/* Portada: cualquier foto que el equipo cargue (mock: fotos del hero) */}
      <div className="bg-azul-claro/30 relative aspect-[16/9] overflow-hidden rounded-xl md:aspect-[4/3]">
        <Image
          src={m.portada.src}
          alt=""
          fill
          sizes="(min-width: 768px) 218px, 100vw"
          className="object-cover"
          style={estiloDeFoco(m.portada.foco)}
        />
      </div>

      <div className="flex min-w-0 flex-col">
        <div className="flex flex-wrap items-center gap-2">
          <span className="bg-azul-principal rounded-md px-2.5 py-1 font-sans text-[0.72rem] font-medium text-white">
            {m.tipo}
          </span>
          <span className="bg-gris-fondo text-azul-principal rounded-md px-2.5 py-1 font-sans text-[0.72rem] font-medium">
            {m.tema}
          </span>
        </div>

        <h3 className="font-display text-azul-principal mt-3 text-[1.3rem] leading-snug font-bold tracking-[-0.01em]">
          {m.titulo}
        </h3>
        <p className="text-azul-principal/70 mt-1.5 font-sans text-[0.9rem] leading-snug">
          {m.autores}
        </p>
        <p className="text-gris-texto mt-2 max-w-[68ch] font-sans text-[0.97rem] leading-relaxed">
          {m.descripcion}
        </p>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-6 gap-y-3 pt-5">
          <p className="text-gris-texto font-mono text-[0.72rem] tracking-[0.08em] uppercase">
            {m.fecha} · {m.paginas ? `${m.paginas} páginas` : m.formato}
          </p>
          {/* Se abre en otra pestaña: la revista, la editorial o el PDF. */}
          <a
            href={m.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-naranja-accion group inline-flex items-center gap-1.5 font-sans text-[0.92rem] font-medium"
          >
            {accionDe(m)}
            <span className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
              <ArrowUpRight size={17} />
            </span>
          </a>
        </div>
      </div>
    </article>
  );
}
