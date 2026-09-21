import type { CSSProperties } from "react";
import Image from "next/image";
import type { ComoTrabajamos } from "@/features/home/contenido/como-trabajamos";
import { resolverFoto } from "@/lib/contenido/fotos";
import { focoMovil } from "./foco-movil";

/** Un paso del contenido, con su número («01») y su frase (la idea del verbo de Qué hacemos) ya puestos por el compositor. */
export type Paso = ComoTrabajamos["pasos"][number] & { n: string; frase: string };

/**
 * Un paso del recorrido: foto real a un lado del eje central y texto al otro,
 * alternando por índice (01 izq · 02 der · 03 izq · 04 der). El wrapper lleva
 * `[data-paso]`, que es lo que la coreografía apila y cross-fadea: exactamente
 * uno por paso.
 *
 * En celular (< md) son dos mitades: la foto apaisada centrada en la de arriba
 * (entre el header y `--metodo-linea`) y el texto en la de abajo, a
 * `--metodo-texto` del eje. Las medidas las define `ComoTrabajamos`. El recorte
 * apaisado de cada foto se apunta con `focoMovil` (`foco-movil.ts`); en
 * computadora manda el foco editable de la foto.
 */
export function PasoMetodo({ paso, idx }: { paso: Paso; idx: number }) {
  const fotoRight = idx % 2 === 1;
  return (
    <div
      data-paso={idx}
      className="absolute inset-0 flex items-start md:items-center"
    >
      <div className="mx-auto grid w-full max-w-screen-xl grid-cols-12 items-center gap-x-6 px-5 md:gap-x-8 md:px-10">

        {/* Foto real — pegada al eje central (alterna lado) */}
        <div
          className={`col-span-12 flex h-(--metodo-linea) items-center pt-20 pb-6 md:col-span-5 md:row-start-1 md:block md:h-auto md:p-0 ${
            fotoRight ? "md:col-start-8" : "md:col-start-1"
          }`}
        >
          <div
            className={`relative w-full overflow-hidden rounded-2xl md:max-w-[25rem] shadow-[0_28px_72px_-18px_rgb(31_45_77/0.20)] ${
              fotoRight ? "mr-auto" : "ml-auto"
            }`}
          >
            <Image
              src={paso.foto.src}
              alt={paso.foto.alt}
              width={400}
              height={533}
              className="h-(--metodo-foto) w-full object-cover object-(--foco-movil) md:aspect-[3/4] md:h-auto md:max-h-[66vh] md:object-(--foco)"
              style={{ "--foco-movil": focoMovil(paso.foto), "--foco": resolverFoto(paso.foto).objectPosition } as CSSProperties}
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
          className={`relative col-span-12 col-start-1 mt-(--metodo-texto) md:col-span-5 md:mt-0 md:row-start-1 ${
            fotoRight
              ? "md:col-start-1 md:text-right"
              : "md:col-start-8 md:text-left"
          }`}
        >
          {/* Número watermark — sangra hacia el borde EXTERIOR */}
          <span
            aria-hidden="true"
            className={`font-display text-azul-principal/[0.05] pointer-events-none absolute -top-4 z-0 select-none text-[9rem] leading-none font-bold tabular-nums md:-top-20 md:text-[14rem] ${
              fotoRight ? "-left-2" : "-right-2"
            }`}
          >
            {paso.n}
          </span>

          {/* Bloque de texto de ancho fijo, anclado al eje central. */}
          <div
            className={`relative z-10 max-w-[25rem] max-md:mx-auto ${
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
              {paso.frase}
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
