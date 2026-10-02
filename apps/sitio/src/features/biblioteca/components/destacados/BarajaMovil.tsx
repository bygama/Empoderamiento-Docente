"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "@/components/ui/icons";
import type { DestacadoDelSitio } from "@/features/biblioteca/contenido/material";
import { accionDe } from "@/features/biblioteca/contenido/modelo";
import { contar } from "@/lib/contadores/contar";
import { PortadaDeMaterial } from "@/features/biblioteca/components/portada/PortadaDeMaterial";
import { TextoPlegable } from "./TextoPlegable";

/**
 * «Material destacado» bajo `lg`: en escritorio las cuatro portadas se pinean,
 * convergen en una pila y cada divisoria barre la de arriba. Acá el gesto es
 * la BARAJA: las portadas van en un riel con snap (una por vez, asomando la
 * siguiente) y el texto del artículo activo se cruza en fundido debajo; los
 * puntitos son el índice. Los cuatro artículos están en el DOM (grilla de una
 * celda: el activo opaco, los otros invisibles), así nada se pierde. Solo
 * opacity y el scroll nativo.
 */
export function BarajaMovil({ items }: { items: readonly DestacadoDelSitio[] }) {
  const rielRef = useRef<HTMLDivElement | null>(null);
  const [activo, setActivo] = useState(0);

  useEffect(() => {
    const riel = rielRef.current;
    if (!riel) return;
    const covers = Array.from(riel.querySelectorAll<HTMLElement>("[data-baraja-cover]"));

    // Con dos portadas visibles a la vez (tablet), el IntersectionObserver
    // por umbral de intersección elegía cualquiera de las dos según cómo
    // cayeran los thresholds. Acá se calcula, en cada scroll, cuál portada
    // tiene su centro más cerca del centro del riel — inequívoco sea cual
    // sea el ancho de cada tarjeta.
    const masCercana = () => {
      const centroRiel = riel.scrollLeft + riel.clientWidth / 2;
      let mejor = 0;
      let mejorDist = Infinity;
      covers.forEach((cover, i) => {
        const centroCover = cover.offsetLeft + cover.offsetWidth / 2;
        const dist = Math.abs(centroCover - centroRiel);
        if (dist < mejorDist) {
          mejorDist = dist;
          mejor = i;
        }
      });
      return mejor;
    };

    let rafId: number | null = null;
    const alScrollear = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        setActivo((prev) => {
          const i = masCercana();
          return i === prev ? prev : i;
        });
      });
    };

    riel.addEventListener("scroll", alScrollear, { passive: true });
    window.addEventListener("resize", alScrollear);
    return () => {
      riel.removeEventListener("scroll", alScrollear);
      window.removeEventListener("resize", alScrollear);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  const ir = (i: number) => {
    setActivo(i);
    rielRef.current?.querySelectorAll<HTMLElement>("[data-baraja-cover]")[i]?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  };

  return (
    <div data-baraja className="bg-azul-principal relative lg:hidden">
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:radial-gradient(circle,#fff_1.1px,transparent_1.6px)] [background-size:22px_22px]" />
      <div className="relative z-10 mx-auto max-w-screen-xl pt-10 pb-14 md:px-10">
        {/* Riel de portadas: 72vw en celular, 38vw en tablet; el resto asoma. */}
        <div ref={rielRef} className="scrollbar-none flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 md:px-0">
          {items.map(({ material }, i) => (
            <button
              key={material.id}
              type="button"
              data-baraja-cover
              aria-label={`Ver ${material.titulo}`}
              onClick={() => ir(i)}
              className="bg-azul-claro/30 relative aspect-[3/4] w-[72vw] shrink-0 snap-center overflow-hidden rounded-xl md:w-[38vw]"
            >
              <PortadaDeMaterial material={material} variante="tarjeta" sizes="(min-width: 768px) 38vw, 72vw" />
            </button>
          ))}
        </div>
        <div role="group" className="mt-5 flex justify-center gap-1" aria-label="Destacados">
          {items.map(({ rotulo, material }, i) => (
            <button
              key={material.id}
              type="button"
              data-baraja-punto
              data-i={i}
              aria-current={activo === i ? "true" : undefined}
              aria-label={rotulo}
              onClick={() => ir(i)}
              className="flex h-11 w-11 items-center justify-center"
            >
              <span className={`block h-1.5 w-1.5 rounded-full bg-white transition-[transform,opacity] duration-300 ${activo === i ? "w-6 opacity-100" : "opacity-40"}`} />
            </button>
          ))}
        </div>

        {/* Los cuatro artículos en la misma celda: el activo opaco, los otros invisibles. */}
        <div className="mt-6 grid px-5 md:px-0">
          {items.map(({ frase, detalle, material }, i) => (
            <article
              key={material.id}
              data-baraja-art
              data-i={i}
              data-activo={activo === i ? "" : undefined}
              aria-hidden={activo !== i}
              inert={activo !== i}
              className={`col-start-1 row-start-1 transition-opacity duration-500 ${activo === i ? "opacity-100" : "pointer-events-none opacity-0"}`}
            >
              <h3 className="font-display font-extrabold tracking-[-0.02em] break-words hyphens-auto text-white" lang="es" style={{ fontSize: "clamp(1.6rem, 1rem + 2.4vw, 2.4rem)", lineHeight: 1.08 }}>
                {material.titulo}
              </h3>
              <p className="text-verde-concepto mt-2 font-sans text-[1rem] font-semibold">{frase}</p>
              <div className="mt-4 flex flex-col">
                <TextoPlegable descripcion={material.descripcion} detalle={detalle} plegado={activo !== i} claseParrafo="font-sans text-[0.95rem] leading-relaxed text-white/80" />
              </div>
              <p className="mt-2 font-mono text-[0.7rem] tracking-[0.08em] text-white/45 uppercase">
                {material.autores} · {material.fecha} · {material.paginas ? `${material.paginas} páginas` : material.formato}
              </p>
              <a
                href={material.url}
                target="_blank"
                rel="noopener noreferrer"
                tabIndex={activo === i ? undefined : -1}
                onClick={() => contar("material-consultado", material.id)}
                className="bg-naranja-accion mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg px-5 font-sans text-[0.92rem] font-medium text-white"
              >
                {accionDe(material)}
                <ArrowUpRight size={17} />
              </a>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
