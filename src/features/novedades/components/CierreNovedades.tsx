"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { RevealLines } from "@/components/ui/RevealLines";
import { ButtonPrimary } from "@/components/ui/ButtonPrimary";
import { Instagram, Linkedin, Facebook } from "@/components/ui/icons";
import { siteConfig } from "@/config/site";
import { PuntosFaro } from "@/components/ui/PuntosFaro";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const REDES = [
  { key: "instagram", label: "Instagram", Icon: Instagram },
  { key: "linkedin", label: "LinkedIn", Icon: Linkedin },
  { key: "facebook", label: "Facebook", Icon: Facebook },
] as const;

/**
 * Cierre de Novedades. Tarjeta navy contenida (max-w-screen-xl, esquinas
 * redondeadas) que flota sobre el gris-fondo con el que viene la página, igual
 * que el cierre de Biblioteca: es una PIEZA, no una lámina, y no se funde con
 * el footer. Comparte el fondo COMPLETO del hero de Novedades (glow + bola
 * espejada + PuntosFaro con el haz al cursor), así el remate cierra con la
 * misma firma con la que abre la página. CTA naranja → Contacto + redes.
 *
 * Como acá el envoltorio es gris-fondo y no blanco, marca la página con
 * data-footer-dock-tint="gris" para que la muesca del footer tome ese mismo
 * gris (regla en globals.css) y el encuentro no muestre triángulos blancos.
 */
export function CierreNovedades() {
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
      // La bola entra al entrar la tarjeta, mismo gesto que en el hero.
      gsap.fromTo(
        "[data-cierre-bola]",
        { x: 170, y: 170 },
        {
          x: 0,
          y: 0,
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: { trigger: root, start: "top 75%" },
        },
      );
      gsap.fromTo(
        "[data-cierre-foot]",
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
    // Envoltorio: da el ancho máximo, el padding lateral y el aire que separa la
    // tarjeta del footer. La <section> sigue siendo la tarjeta porque PuntosFaro
    // engancha sus listeners al closest("section").
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
        {/* Fondo: la MISMA receta que el hero de Novedades —glow de faro
            contenido arriba, bola azul-medio entrando por abajo-DERECHA y los
            puntos vivos con el haz al cursor, que también barre desde la
            derecha—. Espejo del cierre de Biblioteca, igual que los heros. */}
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
            className="bg-azul-medio/25 absolute -right-36 -bottom-44 h-[26rem] w-[26rem] rounded-full"
          />
          <PuntosFaro desde="derecha" />
        </div>

        <div className="relative z-10 flex min-h-[58svh] flex-col items-center justify-center px-5 py-24 text-center md:px-10 md:py-28">
          <RevealLines
            as="h2"
            className="font-display max-w-[16ch] font-extrabold tracking-[-0.025em]"
            style={{ fontSize: "clamp(2.4rem, 1rem + 4.6vw, 5rem)", lineHeight: 1.02 }}
          >
            No te pierdas nada.
          </RevealLines>

          <p
            data-cierre-foot
            className="text-azul-claro mt-7 max-w-[52ch] font-sans text-[1.05rem] leading-relaxed md:text-[1.2rem]"
          >
            Escribinos y contamos lo que estamos haciendo, o seguinos en redes para
            enterarte de cada novedad apenas sale.
          </p>

          <div
            data-cierre-foot
            className="mt-10 flex flex-col items-center gap-7"
          >
            <ButtonPrimary href="/contacto">Hablemos</ButtonPrimary>
            <ul className="flex items-center gap-5">
              {REDES.map(({ key, label, Icon }) => {
                const url = siteConfig.redes[key];
                return (
                  <li key={key}>
                    <a
                      href={url ?? "#"}
                      {...(url
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                      aria-label={`Empoderamiento Docente en ${label}`}
                      className="text-azul-claro/70 hover:text-white inline-flex transition-colors"
                    >
                      <Icon size={22} aria-hidden="true" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
