"use client";

import { ArrowRight } from "@/components/ui/icons";

/**
 * Paginación numerada del archivo de novedades (1 2 3 ›). Los números en la
 * misma mono de la metadata; la activa en azul-principal. Las flechas
 * deshabilitadas quedan visibles (atenuadas) para que el control no cambie
 * de ancho entre páginas.
 */
export function PaginacionNovedades({
  total,
  actual,
  onCambiar,
}: {
  total: number;
  actual: number;
  onCambiar: (pagina: number) => void;
}) {
  const base =
    "flex h-9 w-9 items-center justify-center rounded-full font-mono text-[0.72rem] transition-colors";
  const flecha = (activa: boolean) =>
    `${base} border border-azul-principal/15 text-azul-principal ${
      activa
        ? "hover:border-azul-principal/40"
        : "pointer-events-none opacity-30"
    }`;

  return (
    <nav
      className="flex items-center justify-center gap-1.5"
      aria-label="Paginación de novedades"
    >
      <button
        type="button"
        onClick={() => onCambiar(actual - 1)}
        disabled={actual === 1}
        aria-label="Página anterior"
        className={flecha(actual > 1)}
      >
        <ArrowRight size={14} className="rotate-180" />
      </button>
      {Array.from({ length: total }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onCambiar(p)}
          aria-current={p === actual ? "page" : undefined}
          aria-label={`Página ${p}`}
          className={`${base} ${
            p === actual
              ? "bg-azul-principal text-white"
              : "text-gris-texto hover:bg-azul-claro/30 hover:text-azul-principal"
          }`}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onCambiar(actual + 1)}
        disabled={actual === total}
        aria-label="Página siguiente"
        className={flecha(actual < total)}
      >
        <ArrowRight size={14} />
      </button>
    </nav>
  );
}
