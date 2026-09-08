"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { RevealLines } from "@/components/ui/RevealLines";
import { ButtonPrimary } from "@/components/ui/ButtonPrimary";
import { ArrowUpRight } from "@/components/ui/icons";
import { PuntosFaro } from "@/components/ui/PuntosFaro";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Cierre de Biblioteca (sitemap pág. 05, sección 8 · CIERRE). Tarjeta navy
 * contenida (max-w-screen-xl, esquinas redondeadas) que remata la página con
 * el haz del faro de marca (PuntosFaro, la misma firma del hero) barriendo y
 * siguiendo al cursor: el faro que ilumina el aula. El titular sube por líneas
 * y el CTA cierra en naranja → Contacto.
 *
 * Es una PIEZA, no una lámina: no se funde con el footer. El aire blanco de
 * abajo separa el remate del pie y le devuelve al footer su borde superior
 * redondeado, que con la muesca en navy quedaba invisible. Mismo criterio que
 * el cierre de Novedades, que flota sobre gris-fondo en vez de blanco.
 *
 * Sin JS / prefers-reduced-motion: titular y CTA visibles, faro estático.
 */
export function CierreBiblioteca() {
  const rootRef = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return;

    const ctx = gsap.context(() => {
      // La tarjeta entra en cuadro: sube y se asienta a tamaño real. Origen
      // centrado (es una pieza suelta, no una lámina que se acopla desde arriba).
      gsap.set(root, { transformOrigin: "50% 50%" });
      gsap.fromTo(
        root,
        { scale: 0.965, y: 40 },
        {
          scale: 1,
          y: 0,
          ease: "none",
          scrollTrigger: { trigger: root, start: "top 92%", end: "top 45%", scrub: true },
        },
      );

      // La bola entra al entrar la tarjeta, mismo gesto que en el hero (allá la
      // trae el barrido del faro; acá, el scroll).
      gsap.fromTo(
        "[data-cierre-bola]",
        { x: -170, y: 170 },
        {
          x: 0,
          y: 0,
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: { trigger: root, start: "top 75%" },
        },
      );

      const foot = gsap.utils.toArray<HTMLElement>("[data-cierre-foot]");
      gsap.fromTo(
        foot,
        { autoAlpha: 0, y: 22 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: { trigger: root, start: "top 60%" },
        },
      );
    }, root);

    return () => ctx.revert();
  }, [reduced]);

  return (
    // Envoltorio claro: da el ancho máximo, el padding lateral y el aire que
    // separa la tarjeta del footer. La <section> sigue siendo la tarjeta porque
    // PuntosFaro engancha sus listeners al closest("section").
    <div className="bg-white px-5 pb-14 md:px-10 md:pb-20">
      <section
        ref={rootRef}
        id="hablemos"
        className="bg-azul-principal relative isolate mx-auto w-full max-w-screen-xl overflow-hidden rounded-[1.5rem] text-white shadow-[0_32px_80px_-42px_rgb(15_23_42/0.5)] md:rounded-[2.5rem]"
        aria-label="Cierre"
      >
        {/* Fondo: la MISMA receta que el hero de Biblioteca —glow de faro
            contenido arriba, bola azul-medio entrando por abajo-izquierda y los
            puntos vivos con el haz al cursor—, para que el cierre no se lea
            como otra página. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <span
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(55% 42% at 50% 0%, color-mix(in srgb, var(--color-azul-claro) 24%, transparent), transparent 70%)",
            }}
          />
          <span
            data-cierre-bola
            className="bg-azul-medio/25 absolute -bottom-44 -left-36 h-[26rem] w-[26rem] rounded-full"
          />
          <PuntosFaro />
        </div>

        <div className="relative z-10 flex min-h-[58svh] flex-col items-center justify-center px-5 py-24 text-center md:px-10 md:py-28">
          <RevealLines
            as="h2"
            className="font-display max-w-[16ch] font-extrabold tracking-[-0.025em]"
            style={{ fontSize: "clamp(2.4rem, 1rem + 4.6vw, 5rem)", lineHeight: 1.02 }}
          >
            Un faro para cada aula.
          </RevealLines>

          <p
            data-cierre-foot
            className="text-azul-claro mt-7 max-w-[52ch] font-sans text-[1.05rem] leading-relaxed md:text-[1.2rem]"
          >
            Todo lo que investigamos y diseñamos, abierto y listo para usar. La
            biblioteca sigue creciendo: volvé cuando quieras.
          </p>

          <div data-cierre-foot className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            <ButtonPrimary href="/contacto?tema=otra">¿Buscás un material puntual?</ButtonPrimary>
            <Link
              href="/novedades"
              className="group text-azul-claro hover:text-white inline-flex items-center gap-2 font-sans text-[0.95rem] font-medium transition-colors"
            >
              Ver novedades
              <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
