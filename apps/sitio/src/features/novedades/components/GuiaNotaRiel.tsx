"use client";

import { useEffect, useRef } from "react";
import type { NovedadDelSitio } from "@/features/novedades/contenido/novedad";

/**
 * «En esta nota» bajo `lg`: la columna sticky de escritorio no cabe, así que
 * la guía es un riel de chips pegajoso bajo el header, con la sección activa
 * marcada y siempre a la vista (el riel se desplaza solo). Misma lógica de
 * sección activa y de salto que la guía de escritorio (FichaNovedad).
 */
export function GuiaNotaRiel({
  secciones,
  activa,
  onIr,
}: {
  secciones: NovedadDelSitio["cuerpo"];
  activa: string;
  onIr: (e: React.MouseEvent<HTMLAnchorElement>, id: string) => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = ref.current?.querySelector<HTMLElement>('a[aria-current="true"]');
    if (!el || !ref.current) return;
    ref.current.scrollTo({ left: el.offsetLeft - 20, behavior: "smooth" });
  }, [activa]);
  return (
    <nav
      data-guia-riel
      aria-label="En esta nota"
      className="sticky top-[4.75rem] z-20 -mx-5 mt-6 border-b border-azul-principal/10 bg-white/95 backdrop-blur lg:hidden"
    >
      <div ref={ref} className="scrollbar-none relative flex gap-2 overflow-x-auto px-5 py-2">
        {secciones.map((s, i) => {
          const on = activa === s.ancla;
          return (
            <a
              key={s.ancla}
              href={`#s-${s.ancla}`}
              onClick={(e) => onIr(e, s.ancla)}
              aria-current={on ? "true" : undefined}
              className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-3.5 font-sans text-[0.85rem] font-medium whitespace-nowrap ${
                on
                  ? "border-azul-principal bg-azul-principal text-white"
                  : "border-azul-principal/15 text-gris-texto"
              }`}
            >
              <span className={`font-mono text-[0.62rem] ${on ? "text-verde-concepto" : "text-gris-texto/70"}`}>
                {String(i + 1).padStart(2, "0")}
              </span>
              {s.titulo}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
