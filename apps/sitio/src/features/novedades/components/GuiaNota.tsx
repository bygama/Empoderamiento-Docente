"use client";

import type { NovedadSeccion } from "../data";

/**
 * "En esta nota" — índice de secciones de la ficha (referencia: la Table of
 * Contents del blog de Nominal). Presentacional: la sección activa y el
 * scroll los maneja FichaNovedad. El número de la activa va en verde
 * (concepto), el resto en gris.
 */
export function GuiaNota({
  secciones,
  activa,
  onIr,
}: {
  secciones: NovedadSeccion[];
  activa: string;
  onIr: (e: React.MouseEvent<HTMLAnchorElement>, id: string) => void;
}) {
  return (
    <nav
      aria-label="En esta nota"
      className="border-azul-principal/10 bg-gris-fondo/70 rounded-2xl border p-5"
    >
      <p className="text-gris-texto px-3 font-mono text-[0.68rem] tracking-[0.16em] uppercase">
        En esta nota
      </p>
      <ol className="mt-3 space-y-1">
        {secciones.map((s, i) => {
          const on = activa === s.id;
          return (
            <li key={s.id}>
              <a
                href={`#s-${s.id}`}
                onClick={(e) => onIr(e, s.id)}
                aria-current={on ? "true" : undefined}
                className={`flex items-baseline gap-3 rounded-xl px-3 py-2 transition-colors ${
                  on
                    ? "text-azul-principal bg-white shadow-[0_10px_24px_-16px_rgb(31_45_77/0.35)]"
                    : "text-gris-texto hover:text-azul-principal"
                }`}
              >
                <span
                  className={`font-mono text-[0.65rem] tracking-[0.1em] ${
                    on ? "text-verde-concepto-texto" : "text-gris-texto/70"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-sans text-[0.92rem] leading-snug font-medium">
                  {s.titulo}
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
