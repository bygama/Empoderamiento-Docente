"use client";

import { useEffect, useRef, useState } from "react";
import type { NovedadDelSitio } from "@/features/novedades/contenido/novedad";

// Alto de la barra: el renglón del nav (top-4 + h-11) más su aire.
const ALTO_BARRA = 76;

/**
 * «En esta nota» bajo `lg`: la columna sticky de escritorio no cabe, así que
 * la guía es una BARRA fija arriba que comparte renglón con el nav: el logo a
 * la izquierda, el botón del menú a la derecha y, en el medio, los chips de
 * las secciones con la activa marcada y siempre a la vista (el riel se
 * desplaza solo). Aparece cuando la cabecera de la nota ya pasó (la marca que
 * deja en el flujo sale por arriba) y le da al nav un fondo propio: sin ella,
 * el texto de la nota pasaba por detrás del logo. Con una sola sección no hay
 * chips y la barra lleva el título de la nota.
 *
 * Misma lógica de sección activa y de salto que la guía de escritorio
 * (FichaNovedad).
 */
export function GuiaNotaRiel({
  titulo,
  secciones,
  activa,
  onIr,
}: {
  titulo: string;
  secciones: NovedadDelSitio["cuerpo"];
  activa: string;
  onIr: (e: React.MouseEvent<HTMLAnchorElement>, id: string) => void;
}) {
  const riel = useRef<HTMLDivElement | null>(null);
  const marca = useRef<HTMLSpanElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = marca.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => setVisible(!e.isIntersecting && e.boundingClientRect.top < ALTO_BARRA + 24),
      { rootMargin: `-${ALTO_BARRA}px 0px 0px 0px` },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const el = riel.current?.querySelector<HTMLElement>('a[aria-current="true"]');
    if (!el || !riel.current) return;
    riel.current.scrollTo({ left: el.offsetLeft - 12, behavior: "smooth" });
  }, [activa]);

  return (
    <>
      <span ref={marca} aria-hidden="true" className="block h-px lg:hidden" />
      <div
        data-guia-riel
        inert={!visible}
        className={`border-azul-principal/10 fixed inset-x-0 top-0 z-40 border-b bg-white/95 backdrop-blur transition-transform duration-300 ease-out motion-reduce:transition-none lg:hidden ${
          visible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        {/* Los márgenes dejan libres el logo y el botón del menú; el degradé
            de los bordes dice que el riel sigue. */}
        <div
          ref={riel}
          className="scrollbar-none relative mr-[5.25rem] ml-[4.25rem] flex items-center gap-2 overflow-x-auto px-3 py-4 [mask-image:linear-gradient(to_right,transparent,black_0.75rem,black_calc(100%-0.75rem),transparent)]"
        >
          {secciones.length > 1 ? (
            <nav aria-label="En esta nota" className="flex gap-2">
              {secciones.map((s, i) => {
                const on = activa === s.ancla;
                return (
                  <a
                    key={s.ancla}
                    href={`#s-${s.ancla}`}
                    onClick={(e) => onIr(e, s.ancla)}
                    aria-current={on ? "true" : undefined}
                    className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-3.5 font-sans text-[0.85rem] font-medium whitespace-nowrap transition-colors duration-200 ${
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
            </nav>
          ) : (
            <p aria-hidden="true" className="font-display text-azul-principal flex min-h-11 items-center text-[0.9rem] font-bold whitespace-nowrap">
              {titulo}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
