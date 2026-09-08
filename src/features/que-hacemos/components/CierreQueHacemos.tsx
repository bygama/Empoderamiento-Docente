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
 * Cierre de Qué hacemos. Tarjeta navy contenida que flota sobre el gris-fondo
 * con el que viene la página (mismo patrón que los cierres de Biblioteca y
 * Novedades: es una PIEZA, no una lámina). CTA naranja → Contacto, remitiendo
 * al diferencial de la página: cada contexto merece su propia solución.
 * Marca la página con data-footer-dock-tint="gris" para que la muesca del
 * footer tome el gris y el encuentro no muestre triángulos blancos.
 */
export function CierreQueHacemos() {
  const rootRef = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return;
    const ctx = gsap.context(() => {
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
      gsap.fromTo(
        "[data-qhc-bola]",
        { x: -170, y: 170 },
        {
          x: 0,
          y: 0,
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: { trigger: root, start: "top 75%" },
        },
      );
      gsap.fromTo(
        "[data-qhc-foot]",
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
    <div
      data-footer-dock-tint="gris"
      className="bg-gris-fondo px-5 pb-14 md:px-10 md:pb-20"
    >
      <section
        ref={rootRef}
        id="hablemos"
        data-indice="Hablemos"
        className="bg-azul-principal relative isolate mx-auto w-full max-w-screen-xl overflow-hidden rounded-[1.5rem] text-white shadow-[0_32px_80px_-42px_rgb(15_23_42/0.5)] md:rounded-[2.5rem]"
        aria-label="Cierre"
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <span
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(55% 42% at 50% 0%, color-mix(in srgb, var(--color-azul-claro) 24%, transparent), transparent 70%)",
            }}
          />
          <span
            data-qhc-bola
            className="bg-azul-medio/25 absolute -bottom-44 -left-36 h-[26rem] w-[26rem] rounded-full"
          />
          <PuntosFaro />
        </div>

        <div className="relative z-10 flex min-h-[58svh] flex-col items-center justify-center px-5 py-24 text-center md:px-10 md:py-28">
          <RevealLines
            as="h2"
            className="font-display max-w-[18ch] font-extrabold tracking-[-0.025em]"
            style={{ fontSize: "clamp(2.4rem, 1rem + 4.6vw, 5rem)", lineHeight: 1.02 }}
          >
            Cada contexto merece su propia solución.
          </RevealLines>

          <p
            data-qhc-foot
            className="text-azul-claro mt-7 max-w-[52ch] font-sans text-[1.05rem] leading-relaxed md:text-[1.2rem]"
          >
            Contanos dónde estás y qué necesitás: pensamos juntas el camino.
            Nada de lo que hacemos viene enlatado.
          </p>

          <div
            data-qhc-foot
            className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4"
          >
            <ButtonPrimary href="/contacto?tema=formacion">Hablemos de tu contexto</ButtonPrimary>
            <Link
              href="/investigacion"
              className="group text-azul-claro hover:text-white inline-flex items-center gap-2 font-sans text-[0.95rem] font-medium transition-colors"
            >
              Conocé la investigación detrás
              <ArrowUpRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
