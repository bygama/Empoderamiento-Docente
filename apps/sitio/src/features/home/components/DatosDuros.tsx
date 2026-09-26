"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { ALIADOS } from "@/config/aliados";
import { partirCifra } from "@/features/home/contenido/cifra";
import type { EnNumeros } from "@/features/home/contenido/en-numeros";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Pie de "datos duros": 4 métricas de impacto + franja de ALIANZAS. Sección
 * normal (scroll común) debajo de la Misión. Los números cuentan hasta su valor
 * (count-up) al entrar al viewport. Respeta prefers-reduced-motion (valores
 * finales, sin animación).
 *
 * Las cuatro métricas llegan por props desde
 * `features/home/contenido/en-numeros.ts` (con de dónde sale cada cifra) o
 * desde la base: se editan en el admin.
 *
 * Logos de aliados: la lista y sus alturas viven en @/config/aliados y son
 * las mismas que usa el Footer.
 */
const fmt = (n: number) => n.toLocaleString("es-AR");

export function DatosDuros({ contenido }: { contenido: EnNumeros }) {
  const rootRef = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const el = rootRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const nums = el.querySelectorAll<HTMLElement>("[data-dato-num]");
      nums.forEach((n) => (n.textContent = "0"));

      ScrollTrigger.create({
        trigger: el,
        start: "top 75%",
        once: true,
        onEnter: () => {
          nums.forEach((n) => {
            const target = Number(n.dataset.datoValue ?? "0");
            const obj = { v: 0 };
            gsap.to(obj, {
              v: target,
              duration: 1.6,
              ease: "power2.out",
              onUpdate: () => {
                n.textContent = Math.round(obj.v).toLocaleString("es-AR");
              },
            });
          });
        },
      });
    }, el);

    return () => ctx.revert();
  }, [reduced]);

  // La cifra ya pasó el esquema, así que se parte siempre; el `flatMap` solo
  // descarta un dato que llegue roto en vez de romper la franja.
  const datos = contenido.datos.flatMap(({ cifra, etiqueta, nota }) => {
    const partes = partirCifra(cifra);
    return partes ? [{ ...partes, etiqueta, nota }] : [];
  });

  return (
    <section
      ref={rootRef}
      id="en-numeros"
      data-indice="En números"
      className="bg-azul-principal relative overflow-hidden pt-12 pb-14 md:pt-16 md:pb-20"
      aria-label="En números y alianzas"
    >
      {/* Textura de puntos (motivo de marca) muy sutil para que el azul no
          quede plano. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:radial-gradient(circle,#fff_1.1px,transparent_1.6px)] [background-size:22px_22px]"
      />
      <div className="relative z-10 mx-auto w-full max-w-[88rem] px-5 md:px-10">
        {/* Métricas */}
        <ul className="grid grid-cols-2 gap-y-10 md:grid-cols-4">
          {datos.map((d, i) => (
            <li
              key={d.etiqueta}
              className={`flex flex-col items-center px-2 text-center ${
                i > 0 ? "md:border-white/12 md:border-l" : ""
              }`}
            >
              <p
                className="font-display flex items-baseline font-bold tracking-[-0.02em] text-white tabular-nums"
                style={{ fontSize: "clamp(2.4rem, 4.4vw, 4rem)" }}
              >
                {d.prefijo && (
                  <span className="text-verde-concepto">{d.prefijo}</span>
                )}
                <span data-dato-num data-dato-value={d.valor}>
                  {fmt(d.valor)}
                </span>
                {d.sufijo && (
                  <span className="text-verde-concepto">{d.sufijo}</span>
                )}
              </p>
              <p className="mt-2 font-sans text-[0.82rem] font-semibold tracking-[0.16em] text-white uppercase">
                {d.etiqueta}
              </p>
              <p className="text-azul-claro/80 mt-1.5 max-w-[14rem] font-sans text-[0.85rem] leading-snug">
                {d.nota}
              </p>
            </li>
          ))}
        </ul>

        {/* Alianzas — sin título; logos en blanco sobre el azul, subidos. */}
        <div className="border-white/12 mt-10 border-t pt-9">
          <ul className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 md:gap-x-20">
            {ALIADOS.map((a) => (
              <li key={a.src} className="flex h-12 items-center">
                {/* El alto lo manda la clase y el ancho va `auto`: las medidas del
                    archivo (config/aliados) solo reservan la proporción. */}
                <Image
                  src={a.src}
                  alt={a.alt}
                  width={a.w}
                  height={a.h}
                  unoptimized={"vectorial" in a}
                  draggable={false}
                  className={`${a.alto.home} w-auto opacity-60 transition-opacity duration-300 [filter:brightness(0)_invert(1)] hover:opacity-100`}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
