import type { Ficha } from "@/features/que-hacemos/proyectos";
import { nombrarPaises } from "@/features/que-hacemos/proyectos";
import { Banderas } from "./Bandera";
import { Pictograma } from "./Pictograma";

/**
 * Una ficha del archivo, con las proporciones y el orden de la tarjeta de
 * referencia (assistantly.com): un tercio del ancho, alto generoso. Arriba
 * a la izquierda, el lugar de honor: la bandera (o el juego de banderas)
 * con el nombre del país al lado —lo internacional toma protagonismo
 * (Gastón, 2026-09-10)— y, en mono arriba a la derecha, con quién y
 * cuándo: el sello va arriba porque el año pesa más que el número de
 * orden; EL NÚMERO como título, en dos renglones (cifra y unidad en
 * verde); el nombre del proyecto y una sola frase, todo a la izquierda; al
 * pie, discreto, «Proyecto NN». El pictograma del tipo de
 * proyecto baja de rango: marca de agua grande y tenue en la esquina de
 * abajo a la derecha, textura que no compite con la bandera. En vivo es
 * una hoja absoluta dentro de la pila (`[data-ficha]`, la coreografía la
 * mueve); en fallback, una card en grilla.
 */
export function FichaProyecto({
  ficha,
  n,
  live,
}: {
  ficha: Ficha;
  n: number;
  live: boolean;
}) {
  return (
    <article
      data-ficha
      className={live ? "absolute inset-x-0 top-0" : "relative"}
      style={live ? { opacity: 0 } : undefined}
    >
      <div className="border-azul-principal/8 relative overflow-hidden rounded-[1.75rem] border bg-white p-9 shadow-[0_1px_2px_rgb(31_45_77/0.05),0_34px_70px_-30px_rgb(31_45_77/0.3)] md:p-11">
        <span
          aria-hidden="true"
          className="text-azul-principal pointer-events-none absolute -right-4 -bottom-5 opacity-[0.09]"
        >
          <Pictograma tipo={ficha.picto} className="h-36 w-36" />
        </span>

        {/* El país manda en el ancho: el sello se acomoda a la derecha en
            dos renglones si hace falta, antes que partir el nombre en tres. */}
        <div className="relative flex items-center justify-between gap-5">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Banderas paises={ficha.paises} />
            <p className="font-display text-azul-principal text-[1.05rem] leading-tight font-semibold tracking-[-0.01em]">
              {nombrarPaises(ficha.paises)}
            </p>
          </div>
          <p className="text-gris-texto max-w-[38%] shrink-0 text-right font-mono text-[0.72rem] leading-relaxed tracking-[0.18em] uppercase">
            {ficha.sello}
          </p>
        </div>

        <p
          className="font-display text-azul-principal relative mt-9 font-extrabold tracking-[-0.03em]"
          style={{
            fontSize: "clamp(2.3rem, 1.4rem + 1.6vw, 3.4rem)",
            lineHeight: 0.98,
          }}
        >
          <span className="block">{ficha.cifra}</span>
          <span className="text-verde-concepto-texto block">
            {ficha.unidad}
          </span>
        </p>

        <h3 className="font-display text-azul-principal relative mt-6 text-[1.25rem] leading-snug font-bold text-balance">
          {ficha.nombre}
        </h3>
        <p className="text-gris-texto relative mt-3 max-w-[38ch] font-sans text-[1rem] leading-relaxed">
          {ficha.texto}
        </p>

        <p className="text-verde-concepto-texto relative mt-8 font-mono text-[0.72rem] tracking-[0.14em] uppercase">
          Proyecto {String(n).padStart(2, "0")}
        </p>
      </div>
    </article>
  );
}
