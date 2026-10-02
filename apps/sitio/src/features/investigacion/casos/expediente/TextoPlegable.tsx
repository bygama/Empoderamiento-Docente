"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ROTULO_MICRO } from "../tintes";

/**
 * Un párrafo largo del expediente (el contexto, el análisis) que bajo `lg`
 * arranca PLEGADO: cuatro renglones y «Seguir leyendo». En un celular esos
 * párrafos, mecanografiados, se llevaban una pantalla cada uno y tapaban lo
 * que engancha —la pregunta, las evidencias, qué cambió—; así se elige
 * cuánto leer (Gastón, 2026-10-02). No se saca texto: el recorte es visual
 * (`line-clamp`), el párrafo entero sigue en el DOM para los lectores de
 * pantalla, y en escritorio va siempre completo.
 *
 * El botón aparece solo si el texto de verdad no entra en cuatro renglones:
 * se mide, y se vuelve a medir si el ancho cambia. Abre y cierra de una, sin
 * animar el alto (regla del proyecto).
 */
export function TextoPlegable({ children, className }: { children: string; className: string }) {
  const ref = useRef<HTMLParagraphElement | null>(null);
  const [abierto, setAbierto] = useState(false);
  const [desborda, setDesborda] = useState(false);
  const id = useId();

  useEffect(() => {
    const p = ref.current;
    if (!p) return;
    // Solo importa plegado: abierto, el párrafo mide lo que mide.
    const medir = () => {
      if (p.dataset.abierto === undefined) setDesborda(p.scrollHeight > p.clientHeight + 2);
    };
    const observador = new ResizeObserver(medir);
    observador.observe(p);
    return () => observador.disconnect();
  }, []);

  return (
    <>
      <p
        ref={ref}
        id={id}
        data-abierto={abierto ? "" : undefined}
        className={`${className} max-lg:line-clamp-4 max-lg:data-[abierto]:line-clamp-none`}
      >
        {children}
      </p>
      {desborda && (
        <button
          type="button"
          aria-expanded={abierto}
          aria-controls={id}
          onClick={() => setAbierto((a) => !a)}
          className={`text-azul-principal focus-visible:outline-verde-concepto mt-2 inline-flex min-h-11 items-center gap-2 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 lg:hidden ${ROTULO_MICRO}`}
        >
          {abierto ? "MOSTRAR MENOS" : "SEGUIR LEYENDO"}
          <span aria-hidden="true">{abierto ? "↑" : "↓"}</span>
        </button>
      )}
    </>
  );
}
