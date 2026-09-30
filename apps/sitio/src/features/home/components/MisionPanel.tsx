/**
 * Panel "Misión": espejo de "¿Quiénes somos?" — imagen a la IZQUIERDA y, a la
 * DERECHA, TÍTULO de sección + cuerpo OFICIAL del cliente (VERBATIM)
 * [[ed-copy-oficial]]. El título da la jerarquía; el cuerpo (más chico) se
 * rellena con el scroll. Lo revela el barrido verde (lo orquesta HeroQuienes).
 * NO parafrasear. Respeta reduced-motion. El contenido llega por props desde
 * `features/home/contenido/mision.ts` o desde la base.
 */
import Image from "next/image";
import type { Mision } from "@/features/home/contenido/mision";
import { estiloDeFoco } from "@/lib/contenido/fotos";
import { ScrollFillText } from "./ScrollFillText";
import { segmentosDe } from "./segmentos-de-relleno";

export function MisionPanel({ contenido }: { contenido: Mision }) {
  // Etiqueta del capítulo sobre la foto, bajo lg: el título sin signos.
  const rotulo = `02 / ${contenido.titulo.replace(/[¿?¡!]/g, "")}`;
  return (
    <section
      // Bajo lg: misma composición que Manifiesto (foto arriba con su etiqueta,
      // texto debajo) para que el barrido cruce el texto en el mismo lugar.
      className="relative flex h-full w-full items-center overflow-hidden py-8 max-lg:items-start max-lg:pt-[5rem] md:py-16 md:max-lg:pt-20 motion-reduce:h-auto motion-reduce:py-24 [@media(max-height:38.74rem)_and_(max-width:63.999rem)]:h-auto! [@media(max-height:38.74rem)_and_(max-width:63.999rem)]:py-16!"
      aria-labelledby="titulo-mision"
    >
      <div className="mx-auto grid w-full max-w-[88rem] grid-cols-1 items-start gap-6 px-5 md:px-10 lg:grid-cols-2 lg:gap-16">
        {/* Imagen (izquierda) — bajo lg va primero, con la etiqueta del
            capítulo en la otra esquina que la de Quiénes somos. */}
        <div
          data-wipe-foto
          className="relative order-last aspect-[16/9] w-full overflow-hidden rounded-2xl shadow-[0_24px_60px_-28px_rgba(15,32,64,0.4)] max-lg:order-first max-lg:aspect-[2/1] lg:order-first lg:aspect-[5/4]"
        >
          <Image
            src={contenido.foto.src}
            alt={contenido.foto.alt}
            fill
            sizes="(max-width: 1024px) 100vw, 44vw"
            className="object-cover"
            style={estiloDeFoco(contenido.foto.foco)}
          />
          <span
            aria-hidden="true"
            className="text-azul-principal absolute right-3 bottom-3 rounded-full bg-white/90 px-2.5 py-1 font-mono text-[0.66rem] font-medium tracking-[0.18em] uppercase backdrop-blur-sm lg:hidden"
          >
            {rotulo}
          </span>
        </div>

        {/* Texto (derecha) — TÍTULO arriba + cuerpo debajo, centrados al medio
            del alto de la foto: la columna se estira al alto de la fila. */}
        <div
          data-wipe-texto
          className="relative flex flex-col justify-center self-stretch gap-5 text-left max-lg:gap-4 md:gap-6"
        >
          <div>
            <span
              aria-hidden="true"
              className="bg-verde-concepto mb-4 block h-px w-10"
            />
            {/* Nombra la sección (aria-labelledby): el nombre accesible es el título que se publica. */}
            <h2 id="titulo-mision" className="font-display text-azul-principal font-bold leading-[1.04] tracking-[-0.02em] [font-size:clamp(2rem,3.2vw,3.1rem)] max-lg:text-[1.7rem]">
              {contenido.titulo}
            </h2>
          </div>

          {/* Cuerpo (verbatim) — se rellena con el scroll: verde base, acentos
              en azul (lo que va entre dobles asteriscos). */}
          <ScrollFillText
            paragraphs={segmentosDe(contenido.cuerpo)}
            className="font-sans text-verde-concepto font-medium leading-relaxed [font-size:clamp(0.92rem,1.1vw,1.15rem)] max-lg:text-[0.88rem] max-lg:leading-[1.55]"
          />
        </div>
      </div>
    </section>
  );
}
