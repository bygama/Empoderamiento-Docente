/**
 * Panel "¿Quiénes somos?": TÍTULO de sección + cuerpo OFICIAL del cliente
 * (VERBATIM) a la IZQUIERDA y una imagen a la DERECHA [[ed-copy-oficial]]. El
 * título da la jerarquía; el cuerpo (más chico) se rellena con el scroll. La
 * Misión es el espejo (texto derecha / imagen izquierda). El barrido verde lo
 * "borra" y revela la Misión en el mismo lugar — lo orquesta HeroQuienes.
 * Debajo del cuerpo, la salida a Quiénes somos: cada bloque del inicio tiene
 * una sola salida, hacia la página que lo amplía (Gastón, 2026-09-11).
 * NO parafrasear. Respeta prefers-reduced-motion (capas apiladas, sin animación).
 * El contenido llega por props desde `features/home/contenido/quienes-somos.ts`
 * o desde la base: es lo que se edita en el admin.
 */
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@/components/ui/icons";
import type { QuienesSomos } from "@/features/home/contenido/quienes-somos";
import { estiloDeFoco } from "@/lib/contenido/fotos";
import { ScrollFillText } from "./ScrollFillText";
import { segmentosDe } from "./segmentos-de-relleno";

export function Manifiesto({ contenido }: { contenido: QuienesSomos }) {
  // Etiqueta del capítulo sobre la foto, bajo lg: el título sin signos.
  const rotulo = `01 / ${contenido.titulo.replace(/[¿?¡!]/g, "")}`;
  return (
    // Bajo lg la escena arranca arriba (debajo del header flotante), con la
    // foto primero y el texto debajo (Gastón, 2026-09-29, a partir de la Bio
    // móvil de HAF): el barrido cruza solo el texto (data-wipe-texto).
    <section
      className="relative flex h-full w-full items-center overflow-hidden py-8 max-lg:items-start max-lg:pt-[5rem] md:py-16 md:max-lg:pt-20 motion-reduce:h-auto motion-reduce:py-24 [@media(max-height:38.74rem)_and_(max-width:63.999rem)]:h-auto! [@media(max-height:38.74rem)_and_(max-width:63.999rem)]:py-16!"
      aria-labelledby="titulo-quienes-somos"
    >
      <div
        data-wipe-bounds
        className="mx-auto grid w-full max-w-[88rem] grid-cols-1 items-start gap-6 px-5 md:px-10 lg:grid-cols-2 lg:gap-16"
      >
        {/* Texto (izquierda) — TÍTULO arriba + cuerpo debajo, centrados al medio
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
            <h2 id="titulo-quienes-somos" className="font-display text-azul-principal font-bold leading-[1.04] tracking-[-0.02em] [font-size:clamp(2rem,3.2vw,3.1rem)] max-lg:text-[1.7rem]">
              {contenido.titulo}
            </h2>
          </div>

          {/* Cuerpo (verbatim) — se rellena con el scroll: verde base, acentos
              en azul (lo que va entre dobles asteriscos). */}
          <ScrollFillText
            paragraphs={segmentosDe(contenido.cuerpo)}
            // Bajo lg un punto más chico: la foto va arriba y el bloque entero
            // tiene que entrar en 667px de alto.
            className="font-sans text-verde-concepto font-medium leading-relaxed [font-size:clamp(0.92rem,1.1vw,1.15rem)] max-lg:text-[0.88rem] max-lg:leading-[1.55]"
          />

          <Link
            href={contenido.enlace.ruta}
            className="group focus-visible:outline-naranja-accion mt-2 inline-flex w-fit items-center gap-3 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 max-lg:mt-0"
          >
            {/* En un celular no hay hover: el toque pinta el círculo al
                instante (`group-active`, solo con puntero táctil: en
                computadora el clic no cambia nada) y suelta con el fade. */}
            <span className="border-azul-principal/15 text-azul-principal group-hover:border-naranja-accion group-hover:bg-naranja-accion inline-flex h-11 w-11 items-center justify-center rounded-full border transition-colors duration-500 group-hover:text-white pointer-coarse:group-active:border-naranja-accion pointer-coarse:group-active:bg-naranja-accion pointer-coarse:group-active:text-white pointer-coarse:group-active:duration-0">
              <ArrowRight
                size={17}
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              />
            </span>
            <span className="text-azul-principal group-hover:text-naranja-accion font-sans text-[0.9rem] font-medium tracking-wide transition-colors duration-500 pointer-coarse:group-active:text-naranja-accion pointer-coarse:group-active:duration-0">
              {contenido.enlace.texto}
            </span>
          </Link>
        </div>

        {/* Imagen (derecha; bajo lg va primero, con la etiqueta del capítulo
            encima, como la tarjeta de la Bio de HAF). */}
        <div
          data-wipe-foto
          className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl shadow-[0_24px_60px_-28px_rgba(15,32,64,0.4)] max-lg:order-first max-lg:aspect-[2/1] lg:aspect-[5/4]"
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
            className="text-azul-principal absolute top-3 right-3 rounded-full bg-white/90 px-2.5 py-1 font-mono text-[0.66rem] font-medium tracking-[0.18em] uppercase backdrop-blur-sm lg:hidden"
          >
            {rotulo}
          </span>
        </div>
      </div>
    </section>
  );
}
