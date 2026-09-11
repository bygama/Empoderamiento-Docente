"use client";

import { type MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, BookOpen } from "@/components/ui/icons";
import { ITEMS_DESTACADOS } from "@/features/biblioteca/data/materiales";

// Biblioteca: los mismos cuatro destacados que abren la página Biblioteca
// (publicaciones reales, curadas en `biblioteca/data/materiales`), y cada
// fila lleva a la publicación, como allá. Antes era un mock de recursos
// inventados (Gastón, 2026-09-11).
const BIBLIOTECA = ITEMS_DESTACADOS.map(({ material }) => material);

// Novedades: siempre con imagen (reusamos fotos reales del hero como mock).
const NOVEDADES = [
  {
    titulo: "Encuentro docente en torno a la matemática educativa",
    meta: "Evento · Jun 2026",
    img: "/hero/hero-3.webp",
  },
  {
    titulo: "Nueva investigación sobre el aprendizaje matemático",
    meta: "Investigación · May 2026",
    img: "/hero/hero-5.webp",
  },
  {
    titulo: "ED amplía su presencia en Chile, México, Argentina, Colombia y Brasil",
    meta: "Institucional · Abr 2026",
    img: "/hero/hero-7.webp",
  },
  {
    titulo: "Conversatorio: las matemáticas más allá del cálculo",
    meta: "Charla · Mar 2026",
    img: "/hero/hero-9.webp",
  },
] as const;

/** Realce que sigue al cursor: guarda la posición del mouse en CSS vars. */
function trackPointer(e: MouseEvent<HTMLElement>) {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  el.style.setProperty("--bn-mx", `${e.clientX - r.left}px`);
  el.style.setProperty("--bn-my", `${e.clientY - r.top}px`);
}

/**
 * Biblioteca y Novedades — dos columnas divididas por el patrón de puntos de
 * marca (con nodo verde al centro). Izquierda: las publicaciones destacadas
 * como archivos; derecha: novedades con imagen. Cada fila tiene un realce verde
 * que nace en el cursor, lo sigue y se expande SIN mover el contenido. La
 * flecha diagonal ↗ junto a cada título lleva a su página.
 *
 * Sin reveal de scroll: el contenido está siempre presente (evita el "pop"
 * janky al bajar hacia el footer). La interacción vive en el hover.
 */
export function BibliotecaNovedades() {
  return (
    <section
      id="biblioteca-novedades"
      data-indice="Biblioteca y novedades"
      data-section="biblioteca-novedades"
      className="bg-grain-light relative bg-white py-24 md:py-32"
      aria-label="Biblioteca y Novedades"
    >
      <div className="relative z-10 mx-auto max-w-screen-xl px-5 md:px-10">
        <div className="grid gap-y-14 md:grid-cols-[1fr_auto_1fr] md:gap-x-16">
          {/* ── Biblioteca ──────────────────────────────────────────────
              En mobile va SEGUNDA (Novedades arriba) vía `order`; en desktop
              vuelve a la izquierda. El separador punteado superior es solo
              mobile (en desktop divide la línea vertical de marca). */}
          <div className="border-azul-medio/30 order-2 flex flex-col border-t-2 border-dotted pt-14 md:order-none md:border-t-0 md:pt-0">
            <header>
              <Link
                href="/biblioteca"
                aria-label="Ir a Biblioteca"
                className="group inline-flex items-center gap-4"
              >
                <h3
                  className="font-display text-azul-principal font-bold tracking-[-0.02em]"
                  style={{ fontSize: "clamp(2rem, 3.4vw, 2.75rem)" }}
                >
                  Biblioteca
                </h3>
                <span className="text-azul-principal group-hover:text-naranja-accion transition-[color,translate] duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                  <ArrowUpRight size={28} strokeWidth={2} />
                </span>
              </Link>
              <p className="text-gris-texto mt-3 font-sans text-[0.97rem] leading-relaxed">
                Materiales y recursos para llevar al aula.
              </p>
            </header>

            <ul className="mt-9 flex flex-col gap-3">
              {BIBLIOTECA.map(({ titulo, fuente, fecha, formato, url }) => (
                <li key={titulo}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onMouseMove={trackPointer}
                    className="bn-row block"
                  >
                    <span aria-hidden="true" className="bn-glow" />
                    <div className="bn-row-inner flex items-center gap-4 p-3.5">
                      {/* Tile de archivo */}
                      <span className="bg-azul-claro/30 text-azul-medio relative flex h-16 w-16 shrink-0 flex-col items-center justify-center gap-1 rounded-xl">
                        <BookOpen size={22} />
                        <span className="font-mono text-[0.66rem] font-medium tracking-[0.12em]">
                          {formato}
                        </span>
                      </span>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-display text-azul-principal line-clamp-2 text-[1.02rem] leading-snug font-bold">
                          {titulo}
                        </h4>
                        <p className="text-gris-texto mt-1 font-mono text-[0.72rem] tracking-[0.08em] uppercase">
                          {fuente} · {fecha}
                        </p>
                      </div>
                      <span className="text-azul-principal/25 group-hover:text-naranja-accion shrink-0">
                        <ArrowRight size={18} />
                      </span>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Divisor de marca (vertical en desktop) ──────────────── */}
          <div className="bn-divider hidden md:block" aria-hidden="true">
            <span className="bn-node" />
          </div>

          {/* ── Novedades ───────────────────────────────────────────────
              En mobile va PRIMERA (arriba de Biblioteca) vía `order`; en
              desktop vuelve a la derecha. */}
          <div className="order-1 flex flex-col md:order-none">
            <header>
              <Link
                href="/novedades"
                aria-label="Ir a Novedades"
                className="group inline-flex items-center gap-4"
              >
                <h3
                  className="font-display text-azul-principal font-bold tracking-[-0.02em]"
                  style={{ fontSize: "clamp(2rem, 3.4vw, 2.75rem)" }}
                >
                  Novedades
                </h3>
                <span className="text-azul-principal group-hover:text-naranja-accion transition-[color,translate] duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                  <ArrowUpRight size={28} strokeWidth={2} />
                </span>
              </Link>
              <p className="text-gris-texto mt-3 font-sans text-[0.97rem] leading-relaxed">
                Lo último de la comunidad y la investigación.
              </p>
            </header>

            <ul className="mt-9 flex flex-col gap-3">
              {NOVEDADES.map(({ titulo, meta, img }) => (
                <li key={titulo}>
                  <Link
                    href="/novedades"
                    onMouseMove={trackPointer}
                    className="bn-row block"
                  >
                    <span aria-hidden="true" className="bn-glow" />
                    <div className="bn-row-inner flex items-center gap-4 p-3.5">
                      {/* Miniatura (imagen real) */}
                      <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                        <Image
                          src={img}
                          alt=""
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </span>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-display text-azul-principal text-[1.02rem] leading-snug font-bold">
                          {titulo}
                        </h4>
                        <p className="text-gris-texto mt-1 font-mono text-[0.72rem] tracking-[0.08em] uppercase">
                          {meta}
                        </p>
                      </div>
                      <span className="text-azul-principal/25 group-hover:text-naranja-accion shrink-0">
                        <ArrowRight size={18} />
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
