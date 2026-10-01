import type { Ficha } from "./fichas";
import { EncabezadoFicha } from "./EncabezadoFicha";
import { Pictograma } from "./Pictograma";

/**
 * Una ficha del archivo, con las proporciones y el orden de la tarjeta de
 * referencia (assistantly.com): un tercio del ancho, alto generoso. Arriba
 * a la izquierda, el lugar de honor: la bandera (o el juego de banderas)
 * con el nombre del país —lo internacional toma protagonismo (Gastón,
 * 2026-09-10)— y, en mono arriba a la derecha, con quién y cuándo: el
 * sello va arriba porque el año pesa más que el número de orden (los dos,
 * en EncabezadoFicha). EL NÚMERO como título, en dos renglones (cifra y
 * unidad en verde); el nombre del proyecto y una sola frase, todo a la
 * izquierda; al pie, discreto, «Proyecto NN». El pictograma del tipo de
 * proyecto baja de rango: marca de agua grande y tenue en la esquina de
 * abajo a la derecha, textura que no compite con la bandera. En vivo es
 * una hoja absoluta dentro de la pila (`[data-ficha]`, la coreografía la
 * mueve); en fallback, una card en grilla.
 */
export function FichaProyecto({
  ficha,
  n,
  live,
  compacta = false,
}: {
  ficha: Ficha;
  n: number;
  live: boolean;
  /**
   * La de la pila en celular (PilaFichasMovil): menos relleno y la cifra un
   * escalón más chica, para que la ficha entera entre debajo del capítulo.
   */
  compacta?: boolean;
}) {
  return (
    <article
      data-ficha
      className={live ? "absolute inset-x-0 top-0" : "relative"}
      style={live ? { opacity: 0 } : undefined}
    >
      <div className={`border-azul-principal/8 relative overflow-hidden rounded-[1.75rem] border bg-white shadow-[0_1px_2px_rgb(31_45_77/0.05),0_34px_70px_-30px_rgb(31_45_77/0.3)] ${compacta ? "p-6 md:p-8" : "p-9 md:p-11"}`}>
        <span
          aria-hidden="true"
          className="text-azul-principal pointer-events-none absolute -right-4 -bottom-5 opacity-[0.09]"
        >
          <Pictograma tipo={ficha.picto} className="h-36 w-36" />
        </span>

        <EncabezadoFicha paises={ficha.paises} sello={ficha.sello} />

        <p
          className={`font-display text-azul-principal relative font-extrabold tracking-[-0.03em] ${compacta ? "mt-6" : "mt-9"}`}
          style={{
            fontSize: compacta ? "clamp(2.1rem, 1.5rem + 2.4vw, 3rem)" : "clamp(2.3rem, 1.4rem + 1.6vw, 3.4rem)",
            lineHeight: 0.98,
          }}
        >
          <span className="block">{ficha.cifra}</span>
          <span className="text-verde-concepto-texto block">
            {ficha.unidad}
          </span>
        </p>

        <h3 className={`font-display text-azul-principal relative leading-snug font-bold text-balance ${compacta ? "mt-4 text-[1.12rem]" : "mt-6 text-[1.25rem]"}`}>
          {ficha.nombre}
        </h3>
        <p className={`text-gris-texto relative max-w-[38ch] font-sans leading-relaxed ${compacta ? "mt-2 text-[0.95rem]" : "mt-3 text-[1rem]"}`}>
          {ficha.texto}
        </p>

        <p className={`text-verde-concepto-texto relative font-mono text-[0.72rem] tracking-[0.14em] uppercase ${compacta ? "mt-5" : "mt-8"}`}>
          Proyecto {String(n).padStart(2, "0")}
        </p>
      </div>
    </article>
  );
}
