import type { ReactNode } from "react";
import { PILARES } from "./data";
import { GRILLA } from "./estilos";

/**
 * Cáscara común de los pilares 01–03. Los tres beats comparten grilla,
 * anclaje vertical y jerarquía (regla verde → etiqueta numerada → título →
 * cuerpo); solo cambian el título y el cuerpo que reciben. Que la estructura
 * viva en un único componente es lo que garantiza que no se desfasen.
 */
export function Pilar({
  i,
  titulo,
  cuerpo,
}: {
  i: 0 | 1 | 2;
  titulo: ReactNode;
  cuerpo: ReactNode;
}) {
  const { n, label } = PILARES[i];
  return (
    <div
      data-beat={i}
      className={`flex h-full items-center motion-reduce:h-auto motion-reduce:py-24 ${GRILLA}`}
    >
      <div className="text-center md:text-left">
        <span
          data-pilar-rule
          aria-hidden="true"
          className="bg-verde-concepto mx-auto mb-4 block h-[3px] w-8 rounded-full md:mx-0"
        />
        <span
          data-pilar-eyebrow
          className="text-azul-claro/80 font-mono text-[0.78rem] font-medium tracking-[0.24em] uppercase"
        >
          {n} — {label}
        </span>
        {titulo}
        {cuerpo}
      </div>
    </div>
  );
}
