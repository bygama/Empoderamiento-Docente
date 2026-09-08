import Image from "next/image";
import type { Paso } from "@/features/home/data";

/**
 * Un paso del recorrido: foto real a un lado del eje central y texto al otro,
 * alternando por índice (01 izq · 02 der · 03 izq · 04 der). El wrapper lleva
 * `[data-paso]`, que es lo que la coreografía apila y cross-fadea: exactamente
 * uno por paso.
 */
export function PasoMetodo({ paso, idx }: { paso: Paso; idx: number }) {
  const fotoRight = idx % 2 === 1;
  return (
    <div
      data-paso={idx}
      className="absolute inset-0 flex items-center"
      style={{ willChange: "opacity, transform, filter" }}
    >
      <div className="mx-auto grid w-full max-w-screen-xl grid-cols-12 items-center gap-x-6 px-5 md:gap-x-8 md:px-10">

        {/* Foto real — pegada al eje central (alterna lado) */}
        <div
          className={`hidden md:col-span-5 md:row-start-1 md:block ${
            fotoRight ? "md:col-start-8" : "md:col-start-1"
          }`}
        >
          <div
            className={`relative w-full max-w-[25rem] overflow-hidden rounded-2xl shadow-[0_28px_72px_-18px_rgb(31_45_77/0.20)] ${
              fotoRight ? "mr-auto" : "ml-auto"
            }`}
          >
            <Image
              src={paso.foto}
              alt={paso.fotoAlt}
              width={400}
              height={533}
              className="aspect-[3/4] max-h-[66vh] w-full object-cover"
              sizes="(max-width: 768px) 90vw, 400px"
              priority={idx === 0}
            />
            {/* Overlay tenue de marca */}
            <div
              aria-hidden="true"
              className="bg-verde-concepto/10 absolute inset-0 mix-blend-multiply"
            />
          </div>
        </div>

        {/* Contenido — pega al eje central en AMBOS lados (espejo):
            el texto-derecha alinea a la izquierda y el texto-izquierda
            a la derecha, ambos arrancando/terminando en el centro →
            simétrico al intercalar. Mismo ancho de bloque que la foto
            (25rem) para que los bordes exteriores coincidan. */}
        <div
          className={`relative col-span-12 col-start-1 pl-10 md:col-span-5 md:row-start-1 md:pl-0 ${
            fotoRight
              ? "md:col-start-1 md:text-right"
              : "md:col-start-8 md:text-left"
          }`}
        >
          {/* Número watermark — sangra hacia el borde EXTERIOR */}
          <span
            aria-hidden="true"
            className={`font-display text-azul-principal/[0.05] pointer-events-none absolute -top-20 z-0 select-none text-[9rem] leading-none font-bold tabular-nums md:text-[14rem] ${
              fotoRight ? "-left-2" : "-right-2"
            }`}
          >
            {paso.n}
          </span>

          {/* Bloque de texto de ancho fijo, anclado al eje central. */}
          <div
            className={`relative z-10 max-w-[25rem] ${
              fotoRight ? "md:ml-auto" : "md:mr-auto"
            }`}
          >
            <h2
              className="font-display text-azul-principal leading-[1.02] font-bold tracking-[-0.022em]"
              style={{ fontSize: "clamp(2.1rem, 5vw, 3.7rem)" }}
            >
              {paso.titulo}
            </h2>

            {/* Resumen — verde concepto (frase destacada). Tamaño
                ajustado para que la más larga ("Toda solución
                nace de una realidad comprendida") entre en una
                línea en desktop; text-balance evita cortes feos
                cuando igual envuelve en mobile. */}
            <p className="text-verde-concepto mt-4 font-sans text-[1rem] font-semibold leading-snug text-balance md:text-[1.05rem]">
              {paso.resumen}
            </p>

            <p className="text-gris-texto mt-3 font-sans text-[0.97rem] leading-relaxed md:text-[1.02rem]">
              {paso.detalle}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
