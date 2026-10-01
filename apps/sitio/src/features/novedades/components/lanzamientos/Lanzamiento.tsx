import Image from "next/image";
import type { LanzamientosDeNovedades } from "@/features/novedades/contenido/lanzamientos";
import { estiloDeFoco } from "@/lib/contenido/fotos";

type Props = { lanzamiento: LanzamientosDeNovedades["lanzamientos"][number] };

/**
 * Una tarjeta del riel: la foto a sangre y, abajo sobre un degradé, el tipo y
 * el título. La tarjeta entera es el link al artículo, en otra pestaña. No se
 * deja arrastrar: el arrastre nativo de un link le cortaría el gesto al riel.
 * Sin cursor propio en desktop, como el resto del riel: ahí manda la pill.
 */
export function Lanzamiento({ lanzamiento: l }: Props) {
  return (
    <a
      href={l.url}
      target="_blank"
      rel="noopener noreferrer"
      draggable={false}
      className="group relative block aspect-[3/4] w-[76vw] shrink-0 overflow-hidden rounded-2xl focus-visible:outline-hidden max-md:snap-start sm:w-[42vw] md:cursor-none lg:w-[23rem]"
    >
      <Image
        src={l.foto.src}
        alt=""
        fill
        sizes="(max-width: 640px) 76vw, (max-width: 1024px) 42vw, 368px"
        draggable={false}
        className="object-cover transition-transform duration-700 group-hover:scale-105 group-focus-visible:scale-105"
        style={estiloDeFoco(l.foto.foco)}
      />
      <div className="from-azul-principal/90 via-azul-principal/10 absolute inset-0 bg-gradient-to-t to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-6 text-white">
        <span className="text-azul-claro font-mono text-[0.66rem] tracking-[0.14em] uppercase">{l.tipo}</span>
        <h3 className="font-display mt-1.5 text-[1.15rem] leading-snug font-bold">{l.titulo}</h3>
        <span className="sr-only"> (se abre en otra pestaña)</span>
      </div>
      {/* El foco de teclado va en una capa arriba de todo: un outline por
          fuera lo recorta el riel (no tiene aire arriba) y uno por dentro
          queda tapado por la foto. El outline del link va `hidden` y no
          `none`: en alto contraste vuelve y marca el foco igual. */}
      <span
        aria-hidden="true"
        className="group-focus-visible:border-verde-concepto pointer-events-none absolute inset-0 rounded-2xl border-2 border-transparent"
      />
    </a>
  );
}
