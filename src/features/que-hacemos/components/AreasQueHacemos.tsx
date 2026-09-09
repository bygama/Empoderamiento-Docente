"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AREAS, AREAS_INTRO } from "@/features/que-hacemos/areas";

/**
 * Las seis áreas de trabajo de ED, en texto plano y legibles de una.
 *
 * Raquel y Daniela (2026-09-08): la web se veía espectacular pero no se
 * entendía qué hace ED. Esta sección es la respuesta: nada se esconde
 * detrás de una animación. Cada área dice qué es, qué te llevás y para quién
 * es. A la izquierda (en desktop) un índice pegado que
 * marca el bloque que se está leyendo y sirve para saltar; en celular es una
 * fila de chips deslizable. El único JS es ese resaltado, y sin JS todo se
 * lee igual.
 */
export function AreasQueHacemos() {
  const rootRef = useRef<HTMLElement | null>(null);
  const [activa, setActiva] = useState(0);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !("IntersectionObserver" in window)) return;
    const bloques = Array.from(
      root.querySelectorAll<HTMLElement>("[data-area]"),
    );
    if (!bloques.length) return;
    // El bloque que cruza la franja del medio de la pantalla es el activo.
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const i = Number((e.target as HTMLElement).dataset.area);
          if (!Number.isNaN(i)) setActiva(i);
        }
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 },
    );
    bloques.forEach((b) => io.observe(b));
    return () => io.disconnect();
  }, []);

  const rotulo =
    "font-sans text-[0.78rem] font-medium tracking-[0.22em] text-gris-texto uppercase";

  return (
    <section
      ref={rootRef}
      id="areas"
      data-indice="Áreas"
      className="text-azul-principal scroll-mt-28 bg-white"
    >
      <div className="mx-auto w-full max-w-[88rem] px-5 py-20 md:px-10 md:py-28">
        <header className="max-w-[62ch]">
          <h2
            className="font-display text-[2rem] font-bold tracking-[-0.02em] text-balance md:text-[2.75rem]"
            style={{ lineHeight: 1.1 }}
          >
            Seis áreas de trabajo
          </h2>
          <p className="text-gris-texto mt-5 font-sans text-[1.05rem] leading-relaxed md:text-[1.15rem]">
            {AREAS_INTRO}
          </p>
        </header>

        <div className="mt-12 lg:mt-16 lg:grid lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-16">
          {/* Índice: pegado al costado en desktop, chips deslizables en celular.
              CENTRADO EN EL VIEWPORT, no pegado arriba: el mismo eje que el
              índice decorativo del borde derecho (IndicePagina, que es
              fixed top-1/2 -translate-y-1/2), así los dos costados se leen
              simétricos.

              El centrado NO va con -translate-y-1/2 sobre el nav. Un translate
              se aplica después del layout y también mientras el sticky está en
              flujo normal, así que dibujaba el índice 151px más arriba de donde
              ocupa: mientras la sección entraba en pantalla, le pisaba la bajada
              del header por 87px. En su lugar el nav va dentro de una caja de
              alto de viewport que se pega arriba y lo centra con flex: la caja
              no puede subir por encima de su celda, así que no hay forma de que
              se escape hacia el header. */}
          <div className="lg:sticky lg:top-0 lg:flex lg:h-svh lg:items-center lg:self-start">
            <nav aria-label="Áreas de trabajo" className="lg:w-full">
              <ol className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-3 lg:mx-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:px-0 lg:pb-0">
                {AREAS.map((a, i) => {
                  const activo = i === activa;
                  return (
                    <li key={a.id} className="shrink-0">
                      <a
                        href={`#area-${a.id}`}
                        aria-current={activo ? "true" : undefined}
                        className={`focus-visible:outline-verde-concepto flex items-center gap-3 rounded-full border px-3.5 py-1.5 font-sans text-[0.85rem] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 lg:rounded-none lg:border-0 lg:border-l-2 lg:px-4 lg:py-2.5 lg:text-[0.95rem] ${
                          activo
                            ? "border-azul-principal bg-azul-principal lg:text-azul-principal lg:border-verde-concepto text-white lg:bg-transparent"
                            : "border-azul-principal/15 text-gris-texto hover:border-azul-principal/40 hover:text-azul-principal lg:border-azul-principal/10"
                        }`}
                      >
                        <span className="font-mono text-[0.72rem] tabular-nums opacity-70">
                          0{i + 1}
                        </span>
                        <span>{a.nombre}</span>
                      </a>
                    </li>
                  );
                })}
              </ol>
            </nav>
          </div>

          <div className="mt-10 lg:mt-0">
            {AREAS.map((a, i) => (
              <article
                key={a.id}
                id={`area-${a.id}`}
                data-area={i}
                className="border-azul-principal/10 scroll-mt-28 border-t py-12 first:border-t-0 first:pt-0 md:py-16 lg:grid lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-12"
              >
                <div>
                  <p className="font-mono text-[0.78rem] tracking-[0.18em] text-gris-texto uppercase">
                    Área 0{i + 1}
                  </p>
                  <h3
                    className="font-display mt-3 text-[1.7rem] font-bold tracking-[-0.02em] md:text-[2.2rem]"
                    style={{ lineHeight: 1.12 }}
                  >
                    {a.nombre}
                  </h3>
                  <p className="text-verde-concepto-texto font-display mt-3 text-[1.1rem] font-semibold md:text-[1.25rem]">
                    {a.idea}
                  </p>
                  <p className="text-azul-principal/85 mt-5 max-w-[62ch] font-sans text-[1.02rem] leading-relaxed md:text-[1.1rem]">
                    {a.queEs}
                  </p>

                  <div className="mt-8 grid gap-8 sm:grid-cols-2">
                    <div>
                      <p className={rotulo}>Qué te llevás</p>
                      <ul className="mt-3 space-y-2">
                        {a.teLlevas.map((t) => (
                          <li
                            key={t}
                            className="flex gap-3 font-sans text-[0.98rem] leading-snug"
                          >
                            <span
                              aria-hidden="true"
                              className="bg-verde-concepto mt-[0.55em] block h-1.5 w-1.5 shrink-0 rounded-full"
                            />
                            <span>{t}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className={rotulo}>Para quién</p>
                      <p className="mt-3 font-sans text-[0.98rem] leading-snug">
                        {a.paraQuien}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 lg:mt-0">
                  <div className="relative aspect-[16/9] overflow-hidden rounded-[1.5rem] lg:aspect-[4/5]">
                    <Image
                      src={a.foto}
                      alt={a.alt}
                      fill
                      sizes="(min-width: 1024px) 17rem, 100vw"
                      className="object-cover"
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
