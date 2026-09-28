import Image from "next/image";
import type { MovimientoDeNovedades } from "@/features/novedades/contenido/movimiento";
import { estiloDeFoco } from "@/lib/contenido/fotos";

/** Una foto de «ED en movimiento»: card absoluta en `live`, estática en el resto. */
export function Momento({ m, live }: { m: MovimientoDeNovedades["momentos"][number]; live: boolean }) {
  return (
    <figure data-mov-card className={live ? "absolute top-1/2 left-1/2 w-[clamp(200px,22vw,340px)]" : "relative"}>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl shadow-[0_30px_60px_-30px_rgb(0_0_0/0.7)] ring-1 ring-white/10">
        <Image
          src={m.foto.src}
          alt=""
          fill
          sizes="(max-width: 768px) 45vw, 340px"
          className="object-cover"
          style={estiloDeFoco(m.foto.foco)}
        />
        <span className="absolute inset-0 bg-azul-principal/10" />
      </div>
      <figcaption className="mt-2 font-mono text-[0.68rem] tracking-[0.16em] text-azul-claro/90 uppercase">
        {m.etiqueta}
      </figcaption>
    </figure>
  );
}
