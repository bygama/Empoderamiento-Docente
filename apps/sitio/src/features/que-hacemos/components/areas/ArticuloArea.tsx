import Image from "next/image";
import type { AreaDeQueHacemos, AreasDeQueHacemos } from "@/features/que-hacemos/contenido/areas";
import { estiloDeFoco } from "@/lib/contenido/fotos";
import { sinMarcas } from "@/lib/contenido/resaltado";
import { PanelArea } from "./PanelArea";

/** Lo que se oculta con el área cerrada, en celular: al abrirse aparece con un fundido corto. */
const cuerpo = (abierta: boolean) =>
  abierta ? "max-lg:motion-safe:animate-[filtros-abre_0.32s_ease-out]" : "max-lg:hidden";

/**
 * Un área de especialización.
 *
 * En escritorio, el artículo entero a la vista (el índice del costado lo
 * acompaña). En celular y tablet (< lg), un DESPLEGABLE: se ven el número,
 * el nombre y la idea, y al tocar se abren la foto, qué es y el panel; una
 * sola abierta por vez (useDesplegableAreas). Eran siete artículos largos
 * seguidos, unas ocho pantallas de celular (Gastón, 2026-09-26).
 *
 * El HTML es el mismo en los dos: el botón que abre existe siempre pero
 * solo se muestra debajo de lg, y lo que se oculta se oculta con CSS. Así
 * no hay diferencia entre el SSR y la hidratación, y sin JS en celular se
 * ve la lista de nombres. El botón va SOBRE la cabecera (absoluto) y no
 * envolviéndola: el h3 sigue siendo el título del artículo para la
 * navegación por encabezados.
 */
export function ArticuloArea({
  area,
  rotulos,
  id,
  i,
  abierta,
  alternar,
}: {
  area: AreaDeQueHacemos;
  rotulos: AreasDeQueHacemos["rotulos"];
  /** El ancla del artículo (areas/anclas.ts): estructura, no copy. */
  id: string;
  i: number;
  abierta: boolean;
  alternar: (i: number, cabecera: HTMLElement) => void;
}) {
  return (
    <article
      id={id}
      data-area={i}
      // Dos columnas recién desde XL, y en PROPORCIONES: a 1024px el índice ya
      // se lleva 19rem y partirlo ahí destrozaba la foto. Entre 1024 y 1279 el
      // artículo va en una columna, con la foto abajo en 16/9. En celular es
      // una columna flexible para poder poner la foto entre el nombre y el
      // texto (order).
      className="border-azul-principal/10 scroll-mt-28 border-t py-12 first:border-t-0 first:pt-0 max-lg:flex max-lg:flex-col max-lg:py-0! md:py-16 xl:grid xl:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] xl:gap-12"
    >
      <div className="max-lg:contents">
        {/* Abierta, la cabecera queda pegada arriba mientras se lee el área
            (debajo del logo y el menú, que flotan), con la flecha para
            cerrarla. */}
        <div
          data-area-cabecera
          className={`relative max-lg:order-1 max-lg:flex max-lg:items-start max-lg:gap-4 max-lg:py-5 ${abierta ? "max-lg:border-azul-principal/10 max-lg:sticky max-lg:top-[4.75rem] max-lg:z-10 max-lg:border-b max-lg:bg-white" : ""}`}
        >
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[0.78rem] tracking-[0.18em] text-gris-texto uppercase">Área 0{i + 1}</p>
            <h3
              className="font-display mt-3 text-[1.7rem] font-bold tracking-[-0.02em] max-lg:mt-1.5 max-lg:text-[1.3rem]! md:text-[2.2rem] md:max-lg:text-[1.6rem]!"
              style={{ lineHeight: 1.12 }}
            >
              {area.titulo}
            </h3>
            <p className="text-verde-concepto-texto font-display mt-3 text-[1.1rem] font-semibold max-lg:mt-1.5 max-lg:text-[0.98rem]! md:text-[1.25rem]">
              {area.frase}
            </p>
          </div>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`mt-6 h-6 w-6 shrink-0 transition-transform duration-300 motion-reduce:transition-none lg:hidden ${abierta ? "rotate-180" : ""}`}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
          <button
            type="button"
            aria-expanded={abierta}
            aria-controls={`${id}-texto ${id}-foto`}
            aria-label={`Área 0${i + 1}: ${area.titulo}`}
            onClick={(e) => alternar(i, e.currentTarget.parentElement as HTMLElement)}
            className="focus-visible:outline-verde-concepto absolute inset-0 cursor-pointer rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 lg:hidden"
          />
        </div>

        <div id={`${id}-texto`} className={`max-lg:order-3 max-lg:pb-9 ${cuerpo(abierta)}`}>
          <p className="text-azul-principal/85 mt-5 max-w-[62ch] font-sans text-[1.02rem] leading-relaxed max-lg:mt-0 md:text-[1.1rem]">
            {sinMarcas(area.detalle)}
          </p>
          {/* TERCER NIVEL DE LECTURA: el panel separa el detalle sin esconder
              nada, así se lee primero qué es el área. */}
          <PanelArea area={area} rotulos={rotulos} />
        </div>
      </div>

      <div id={`${id}-foto`} className={`mt-8 max-lg:order-2 max-lg:mt-0 max-lg:mb-6 xl:mt-0 xl:h-full ${cuerpo(abierta)}`}>
        <div className="relative aspect-[16/9] overflow-hidden rounded-[1.5rem] max-lg:rounded-[1.1rem] xl:aspect-auto xl:h-full">
          <Image
            src={area.foto.src}
            alt={area.foto.alt}
            fill
            sizes="(min-width: 1280px) 30vw, 100vw"
            className="object-cover"
            style={estiloDeFoco(area.foto.foco)}
          />
        </div>
      </div>
    </article>
  );
}
