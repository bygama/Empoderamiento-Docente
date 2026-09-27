import Image from "next/image";
import type { LanzamientosDeNovedades } from "@/features/novedades/contenido/lanzamientos";
import { estiloDeFoco } from "@/lib/contenido/fotos";

type Props = { lanzamiento: LanzamientosDeNovedades["lanzamientos"][number] };

/** Una tarjeta del riel: la foto a sangre y, abajo sobre un degradé, el tipo y el título. */
export function Lanzamiento({ lanzamiento: l }: Props) {
  return (
    <article className="group relative aspect-[3/4] w-[76vw] shrink-0 overflow-hidden rounded-2xl sm:w-[42vw] lg:w-[23rem]">
      <Image
        src={l.foto.src}
        alt=""
        fill
        sizes="(max-width: 640px) 76vw, (max-width: 1024px) 42vw, 368px"
        draggable={false}
        className="object-cover transition-transform duration-700 group-hover:scale-105"
        style={estiloDeFoco(l.foto.foco)}
      />
      <div className="from-azul-principal/90 via-azul-principal/10 absolute inset-0 bg-gradient-to-t to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-6 text-white">
        <span className="text-azul-claro font-mono text-[0.66rem] tracking-[0.14em] uppercase">{l.tipo}</span>
        <h3 className="font-display mt-1.5 text-[1.15rem] leading-snug font-bold">{l.titulo}</h3>
      </div>
    </article>
  );
}
