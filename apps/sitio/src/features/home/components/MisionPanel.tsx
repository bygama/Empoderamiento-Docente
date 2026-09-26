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
  return (
    <section
      className="relative flex h-full w-full items-center overflow-hidden py-8 md:py-16 motion-reduce:h-auto motion-reduce:py-24"
      aria-label="Misión"
    >
      <div className="mx-auto grid w-full max-w-[88rem] grid-cols-1 items-start gap-6 px-5 md:px-10 lg:grid-cols-2 lg:gap-16">
        {/* Imagen (izquierda) — en mobile va debajo del texto */}
        <div className="relative order-last aspect-[16/9] w-full overflow-hidden rounded-2xl shadow-[0_24px_60px_-28px_rgba(15,32,64,0.4)] lg:order-first lg:aspect-[5/4]">
          <Image
            src={contenido.foto.src}
            alt={contenido.foto.alt}
            fill
            sizes="(max-width: 1024px) 100vw, 44vw"
            className="object-cover"
            style={estiloDeFoco(contenido.foto.foco)}
          />
        </div>

        {/* Texto (derecha) — TÍTULO arriba + cuerpo debajo, centrados al medio
            del alto de la foto: la columna se estira al alto de la fila. */}
        <div className="relative flex flex-col justify-center self-stretch gap-5 text-left md:gap-6">
          <div>
            <span
              aria-hidden="true"
              className="bg-verde-concepto mb-4 block h-px w-10"
            />
            <h2 className="font-display text-azul-principal font-bold leading-[1.04] tracking-[-0.02em] [font-size:clamp(2rem,3.2vw,3.1rem)]">
              {contenido.titulo}
            </h2>
          </div>

          {/* Cuerpo (verbatim) — se rellena con el scroll: verde base, acentos
              en azul (lo que va entre dobles asteriscos). */}
          <ScrollFillText
            paragraphs={segmentosDe(contenido.cuerpo)}
            className="font-sans text-verde-concepto font-medium leading-relaxed [font-size:clamp(0.92rem,1.1vw,1.15rem)]"
          />
        </div>
      </div>
    </section>
  );
}
