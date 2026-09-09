"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { ALIADOS } from "@/config/aliados";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Pie de "datos duros": 4 métricas de impacto + franja de ALIANZAS. Sección
 * normal (scroll común) debajo de la Misión. Los números cuentan hasta su valor
 * (count-up) al entrar al viewport. Respeta prefers-reduced-motion (valores
 * finales, sin animación).
 *
 * Las cifras salen de los proyectos documentados en el CV de Daniela, uno por
 * uno en docs/content/que-hace-ed-fuentes.md §6: los cuatro programas con la
 * Subsecretaría de Educación Media Superior de México (5.900 + 1.900 + 3.060 +
 * 3.500), Yucatán (75) y Techint (15) suman 14.450 docentes en cursos propios;
 * el Plan Nacional Aprender Matemática formó 500 formadores que llegaron a
 * 75.000 docentes. Los cinco países son los de siteConfig.paises.
 *
 * Antes acá había cifras inventadas («+2.000 docentes», «+120 escuelas») que
 * además quedaban cortas. Falta que Daniela confirme dos cosas: si cuenta la
 * etapa 2018-2020, hecha desde el Cinvestav con ella como coordinadora (Raquel
 * ya cuenta «más de 15 años», que la incluye), y cuántas escuelas son, que es
 * el único dato que no aparece en ningún documento.
 *
 * Logos de aliados: la lista y sus alturas viven en @/config/aliados y son
 * las mismas que usa el Footer.
 */
const DATOS = [
  { value: 15, prefix: "+", suffix: "", label: "Años de trayectoria", nota: "Diseñando intervenciones situadas." },
  { value: 14000, prefix: "+", suffix: "", label: "Docentes", nota: "En programas de desarrollo profesional en Matemáticas." },
  { value: 500, prefix: "", suffix: "", label: "Formadoras y formadores", nota: "Que llevaron el Plan Nacional Aprender Matemática a 75.000 docentes." },
  { value: 5, prefix: "", suffix: "", label: "Países", nota: "Argentina, México, Chile, Colombia y Brasil." },
] as const;

const fmt = (n: number) => n.toLocaleString("es-AR");

export function DatosDuros() {
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
          {DATOS.map((d, i) => (
            <li
              key={d.label}
              className={`flex flex-col items-center px-2 text-center ${
                i > 0 ? "md:border-white/12 md:border-l" : ""
              }`}
            >
              <p
                className="font-display flex items-baseline font-bold tracking-[-0.02em] text-white tabular-nums"
                style={{ fontSize: "clamp(2.4rem, 4.4vw, 4rem)" }}
              >
                {d.prefix && (
                  <span className="text-verde-concepto">{d.prefix}</span>
                )}
                <span data-dato-num data-dato-value={d.value}>
                  {fmt(d.value)}
                </span>
                {d.suffix && (
                  <span className="text-verde-concepto">{d.suffix}</span>
                )}
              </p>
              <p className="mt-2 font-sans text-[0.82rem] font-semibold tracking-[0.16em] text-white uppercase">
                {d.label}
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
