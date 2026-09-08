import type { Ref } from "react";
import { TAMBORES } from "../../data";

type Props = {
  refApoyo: Ref<HTMLDivElement>;
  refTitulo: Ref<HTMLParagraphElement>;
  refFrase: Ref<HTMLParagraphElement>;
  refDetalle: Ref<HTMLParagraphElement>;
};

/**
 * Apoyos fijos al pie: se cruzan al cambiar de tambor (crossfade +
 * textContent, sin re-render de React).
 */
export function ApoyoTorre({ refApoyo, refTitulo, refFrase, refDetalle }: Props) {
  return (
    <div className="relative z-20 mx-auto w-full max-w-screen-xl px-5 pb-10 md:px-10">
      <div
        ref={refApoyo}
        // Contenedor PROPIO: el tambor y su foto pasan por detrás y
        // antes lavaban este texto hasta volverlo ilegible. Con
        // superficie opaca y un borde tenue, el apoyo se lee siempre,
        // esté donde esté la torre.
        // Rótulo y frase a la izquierda, detalle a la derecha, con
        // dos límites (pedido de Mateo, 2026-09-02): la frase en UNA
        // línea y el detalle en DOS como máximo. Se resuelve por el
        // lado del texto, no del layout: la torre usa la versión
        // corta de cada línea (ver data.ts: frase ≤35 caracteres,
        // detalle ≤85). Con eso, dos columnas iguales de la tarjeta
        // de 1280px (548px desde 1280 de viewport, 420px a 1024)
        // alcanzan: la frase más larga mide ~420px a 1.5rem y el
        // detalle más largo ~600px a 0.9rem, dos líneas aun con el
        // peor corte de palabra.
        className="bg-gris-fondo/92 ring-azul-principal/10 grid gap-3 rounded-2xl px-6 py-5 shadow-[0_18px_50px_-30px_rgb(15_23_42/0.4)] ring-1 backdrop-blur-[2px] md:grid-cols-2 md:items-end md:gap-10 md:px-8 md:py-6"
      >
      <div>
        <p
          ref={refTitulo}
          data-torre-slot
          className="text-azul-principal font-sans text-[0.95rem] font-semibold"
        >
          {TAMBORES[0].titulo}
        </p>
        <p
          ref={refFrase}
          data-torre-slot
          className="text-verde-concepto-texto font-display mt-1 text-[1.5rem] leading-snug font-bold"
        >
          {TAMBORES[0].frase}
        </p>
      </div>
      <p
        ref={refDetalle}
        data-torre-slot
        className="text-gris-texto max-w-[52ch] font-sans text-[0.9rem] leading-relaxed md:justify-self-end"
      >
        {TAMBORES[0].detalle}
      </p>
      </div>
    </div>
  );
}
