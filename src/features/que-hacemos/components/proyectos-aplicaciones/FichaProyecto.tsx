import type { Ficha } from "@/features/que-hacemos/proyectos";
import { Pictograma } from "./Pictograma";

/**
 * Una ficha del archivo, con las proporciones y el orden de la tarjeta de
 * referencia (assistantly.com): un tercio del ancho, alto generoso,
 * pictograma grande arriba a la izquierda y el número de proyecto en mono
 * arriba a la derecha; EL NÚMERO como título, en dos renglones (cifra y
 * unidad en verde); el nombre del proyecto y una sola frase, todo a la
 * izquierda; y al pie, como un sello, dónde y cuándo. En vivo es una hoja
 * absoluta dentro de la pila (`[data-ficha]`, la coreografía la mueve); en
 * fallback, una card en grilla.
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
      className={
        live ? "absolute inset-x-0 top-0" : "relative"
      }
      style={live ? { opacity: 0 } : undefined}
    >
      <div className="border-azul-principal/8 rounded-[1.75rem] border bg-white p-9 shadow-[0_1px_2px_rgb(31_45_77/0.05),0_34px_70px_-30px_rgb(31_45_77/0.3)] md:p-11">
        <div className="flex items-start justify-between gap-6">
          <Pictograma
            tipo={ficha.picto}
            className="text-azul-principal h-14 w-14"
          />
          <p className="text-gris-texto font-mono text-[0.72rem] tracking-[0.18em] uppercase">
            Proyecto {String(n).padStart(2, "0")}
          </p>
        </div>

        <p
          className="font-display text-azul-principal mt-9 font-extrabold tracking-[-0.03em]"
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

        <h3 className="font-display text-azul-principal mt-6 text-[1.25rem] leading-snug font-bold text-balance">
          {ficha.nombre}
        </h3>
        <p className="text-gris-texto mt-3 max-w-[38ch] font-sans text-[1rem] leading-relaxed">
          {ficha.texto}
        </p>

        <p className="text-verde-concepto-texto mt-8 font-mono text-[0.72rem] tracking-[0.14em] uppercase">
          {ficha.lugar}
        </p>
      </div>
    </article>
  );
}
