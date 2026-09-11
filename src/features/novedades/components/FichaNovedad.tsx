"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { RevealLines } from "@/components/ui/RevealLines";
import { ArrowRight } from "@/components/ui/icons";
import { getLenis } from "@/lib/lenis";
import { CATEGORIA_LABEL, fechaCorta, type Novedad } from "../data";
import { useTransicionFaro, FLAG_ENTRADA_FARO } from "./TransicionFaro";
import { GuiaNota } from "./GuiaNota";
import { RevealFoco } from "./RevealFoco";
import { AccionPublicacion } from "./AccionPublicacion";

/**
 * Ficha de una novedad (/novedades/[slug]), con el layout del artículo de
 * Nominal traducido a ED: columna de lectura a la izquierda (meta, titular,
 * lede y secciones tituladas) y a la derecha, sticky, la foto y la "guía de
 * la nota" (índice con sección activa según scroll). En mobile la foto va
 * bajo el titular y la guía se omite.
 *
 * Si se llegó vía la transición del faro (flag en sessionStorage), los
 * reveals del titular y la foto esperan a que el telón destape (~0.7s).
 */
const irASeccion = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
  e.preventDefault();
  const el = document.getElementById(`s-${id}`);
  if (!el) return;
  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(el, { offset: -120, duration: 1 });
  } else {
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 120 });
  }
};

export function FichaNovedad({ n }: { n: Novedad }) {
  const abrir = useTransicionFaro();
  const secciones = n.cuerpo ?? [];
  const [activa, setActiva] = useState(secciones[0]?.id ?? "");
  // Solo LEER en el initializer (StrictMode lo re-ejecuta: tiene que ser
  // puro); el flag se consume después, en un efecto.
  const [conTelon] = useState(() => {
    // En el servidor no hay sessionStorage: el guard explícito reemplaza al
    // catch como rama de SSR y deja el initializer puro.
    if (typeof window === "undefined") return false;
    try {
      return sessionStorage.getItem(FLAG_ENTRADA_FARO) === "1";
    } catch {
      return false;
    }
  });
  useEffect(() => {
    if (!conTelon) return;
    try {
      sessionStorage.removeItem(FLAG_ENTRADA_FARO);
    } catch {}
  }, [conTelon]);
  // El destape del telón (ver TransicionFaro) arranca ~0.3-0.7s después de
  // montar esta página y barre hacia arriba en 0.6s: el titular (arriba de
  // todo) queda descubierto al final. 0.9s hace que su mask-rise ocurra
  // justo cuando el borde del telón le pasa por encima.
  const espera = conTelon ? 0.9 : 0;

  const volver = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Nueva pestaña / ventana: que el navegador haga lo suyo, sin telón.
    if (!abrir || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0)
      return;
    e.preventDefault();
    abrir("/novedades");
  };

  // Sección activa de la guía: la primera visible en la franja de lectura.
  useEffect(() => {
    if (secciones.length === 0) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visibles = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visibles[0]) setActiva(visibles[0].target.id.replace(/^s-/, ""));
      },
      { rootMargin: "-25% 0px -60% 0px" },
    );
    secciones.forEach((s) => {
      const el = document.getElementById(`s-${s.id}`);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n.id]);

  return (
    <article className="bg-white">
      <div className="mx-auto w-full max-w-screen-xl px-5 pt-32 pb-20 md:px-10 md:pt-36 md:pb-28">
        <Link
          href="/novedades"
          onClick={volver}
          className="group text-gris-texto hover:text-azul-principal inline-flex items-center gap-2 font-mono text-[0.72rem] tracking-[0.14em] uppercase transition-colors"
        >
          <ArrowRight size={14} className="rotate-180 transition-transform group-hover:-translate-x-0.5" />
          Todas las novedades
        </Link>

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-16">
          {/* Columna de lectura */}
          <div className="min-w-0">
            <div className="flex items-center gap-3 font-mono text-[0.72rem] tracking-[0.16em] uppercase">
              <span className="text-verde-concepto-texto">
                {CATEGORIA_LABEL[n.categoria]}
              </span>
              <span className="bg-gris-texto/40 h-1 w-1 rounded-full" />
              <span className="text-gris-texto">{fechaCorta(n.fecha)}</span>
            </div>

            <RevealLines
              as="h1"
              delay={espera}
              className="font-display text-azul-principal mt-4 font-bold tracking-[-0.02em]"
              style={{ fontSize: "clamp(1.9rem, 1.1rem + 2.4vw, 3.1rem)", lineHeight: 1.08 }}
            >
              {n.titulo}
            </RevealLines>

            {/* Foto en mobile: bajo el titular (en lg vive en la columna derecha). */}
            <RevealFoco
              delay={espera}
              className="mt-8 aspect-[16/10] w-full overflow-hidden rounded-2xl lg:hidden"
            >
              <div className="relative h-full w-full">
                <Image src={n.imagen} alt="" fill sizes="100vw" className="object-cover" priority />
              </div>
            </RevealFoco>

            <p className="text-azul-principal mt-8 font-sans text-[1.15rem] leading-relaxed font-medium">
              {n.bajada}
            </p>

            {secciones.map((s) => (
              <section key={s.id} id={`s-${s.id}`} className="mt-10 scroll-mt-32">
                <h2 className="font-display text-azul-principal text-[1.3rem] font-bold tracking-[-0.01em]">
                  {s.titulo}
                </h2>
                {s.parrafos.map((parrafo) => (
                  <p key={parrafo} className="text-gris-texto mt-4 font-sans text-[1.02rem] leading-relaxed">
                    {parrafo}
                  </p>
                ))}
              </section>
            ))}

            {n.publicacion && <AccionPublicacion titulo={n.publicacion} />}

            <div className="border-azul-principal/10 mt-14 border-t pt-8">
              <Link
                href="/novedades"
                onClick={volver}
                className="group text-azul-principal inline-flex items-center gap-2 font-sans text-[0.98rem] font-medium"
              >
                <ArrowRight size={16} className="rotate-180 transition-transform group-hover:-translate-x-0.5" />
                Volver a novedades
              </Link>
            </div>
          </div>

          {/* Columna derecha: foto + guía, sticky (solo lg). */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-6">
              <RevealFoco
                delay={espera + 0.1}
                className="aspect-[4/3] w-full overflow-hidden rounded-2xl"
              >
                <div className="relative h-full w-full">
                  <Image src={n.imagen} alt="" fill sizes="340px" className="object-cover" priority />
                </div>
              </RevealFoco>
              {secciones.length > 1 && (
                <GuiaNota secciones={secciones} activa={activa} onIr={irASeccion} />
              )}
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}
