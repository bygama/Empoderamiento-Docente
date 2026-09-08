"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "@/components/ui/icons";
import { CATEGORIA_LABEL, fechaCorta, type Novedad } from "../data";
import { useTransicionFaro } from "./TransicionFaro";

/**
 * Card de novedad. Hover sobrio: elevación sutil con sombra que se asienta y
 * borde que se enciende (nada de tilt 3D). La elevación vive en el <article>
 * interno y el FLIP de la grilla en el wrapper [data-card], así el transform
 * del hover (transición CSS) nunca pelea con el transform del FLIP (GSAP).
 *
 * Si la novedad tiene cuerpo, la card entera linkea a su ficha (stretched
 * link) y la apertura pasa por la transición del faro; sin provider (o sin
 * JS) cae a navegación normal.
 */
export function NovedadCard({ n }: { n: Novedad }) {
  const abrir = useTransicionFaro();
  const href = `/novedades/${n.id}`;
  const calentado = useRef(false);
  // Al primer hover/focus, pedir la ficha en segundo plano: en dev dispara
  // el compile de la ruta (el jank que rompía la transición) y en prod
  // deja la página SSG en caché. Una sola vez por card.
  const calentar = () => {
    if (calentado.current) return;
    calentado.current = true;
    fetch(href).catch(() => {});
  };

  return (
    <div data-card data-id={n.id} data-cat={n.categoria} className="group relative">
      {/* Sombra del hover en capa propia animando SOLO opacity (y el mismo
          lift), porque animar box-shadow es paint (regla: transform/opacity).
          Vive fuera del article: su overflow-hidden la recortaría. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 shadow-[0_2px_4px_rgb(31_45_77/0.06),0_30px_60px_-24px_rgb(31_45_77/0.26)] transition-[translate,opacity] duration-300 ease-out group-hover:-translate-y-1.5 group-hover:opacity-100"
      />
      <article className="border-azul-principal/8 group-hover:border-azul-claro/70 relative flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-[0_1px_2px_rgb(31_45_77/0.04),0_18px_40px_-20px_rgb(31_45_77/0.14)] transition-[translate,border-color] duration-300 ease-out group-hover:-translate-y-1.5">
        <div className="relative aspect-[16/10] w-full overflow-hidden">
          <Image
            src={n.imagen}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
        </div>
        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-center gap-2 font-mono text-[0.68rem] tracking-[0.14em] uppercase">
            <span className="text-verde-concepto-texto">
              {CATEGORIA_LABEL[n.categoria]}
            </span>
            <span className="bg-gris-texto/40 h-1 w-1 rounded-full" />
            <span className="text-gris-texto">{fechaCorta(n.fecha)}</span>
          </div>
          <h3 className="font-display text-azul-principal mt-3 text-[1.15rem] leading-snug font-bold">
            {n.titulo}
          </h3>
          <p className="text-gris-texto mt-2 line-clamp-2 font-sans text-[0.92rem] leading-relaxed">
            {n.bajada}
          </p>
          {n.cuerpo && (
            <span className="text-azul-principal mt-4 inline-flex items-center gap-1.5 font-sans text-[0.9rem] font-medium">
              Leer la nota
              <ArrowUpRight
                size={14}
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </span>
          )}
        </div>
      </article>
      {n.cuerpo && (
        <Link
          href={href}
          aria-label={n.titulo}
          className="absolute inset-0 z-10"
          onMouseEnter={calentar}
          onFocus={calentar}
          onClick={(e) => {
            // Nueva pestaña / ventana (ctrl, cmd, shift, rueda): que el
            // navegador haga lo suyo, sin telón.
            if (!abrir || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0)
              return;
            e.preventDefault();
            abrir(href);
          }}
        />
      )}
    </div>
  );
}
