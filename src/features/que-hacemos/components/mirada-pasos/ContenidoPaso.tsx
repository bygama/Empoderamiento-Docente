import type { MIRADA } from "@/features/que-hacemos/areas";

type Paso = (typeof MIRADA)[number];

/**
 * Lo de adentro de la tarjeta para un paso: número, verbo, idea y qué pasa
 * concretamente en él. Cada pieza lleva su `data-` porque la coreografía
 * las parte en letras (el verbo) y palabras (el resto) para armarlas y
 * desarmarlas con el scroll.
 *
 * Uno debajo del otro (celular, reduced-motion o sin JS) van separados por
 * un filete y un poco de aire; en desktop la coreografía saca ese filete y
 * los apila.
 */
export function ContenidoPaso({ paso, n }: { paso: Paso; n: number }) {
  return (
    <article
      data-paso
      className="[&+&]:border-azul-principal/10 [&+&]:mt-8 [&+&]:border-t [&+&]:pt-8"
    >
      <p
        data-paso-num
        className="text-gris-texto font-mono text-[0.75rem] tracking-[0.18em] lg:text-[0.8rem]"
      >
        Paso 0{n + 1}
      </p>
      <h3
        data-paso-verbo
        className="font-display mt-2 text-[1.75rem] font-bold tracking-[-0.01em] lg:mt-3 lg:text-[2.75rem]"
      >
        {paso.verbo}
      </h3>
      <p
        data-paso-idea
        className="text-verde-concepto-texto font-display mt-2 text-[1.05rem] font-semibold lg:mt-3 lg:text-[1.35rem]"
      >
        {paso.idea}
      </p>
      <p
        data-paso-texto
        className="text-azul-principal/80 mt-3 font-sans text-[0.98rem] leading-relaxed lg:mt-4 lg:text-[1.15rem]"
      >
        {paso.texto}
      </p>
    </article>
  );
}
