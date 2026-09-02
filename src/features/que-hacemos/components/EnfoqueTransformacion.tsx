"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DIFERENCIALES } from "../data";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * "Nuestro enfoque" (sitemap: por qué NO es una capacitación tradicional) —
 * el diferencial de Dani hecho escena: la palabra CAPACITACIÓN aparece en el
 * centro, una línea la tacha, y con el scroll ESTALLA — cada letra sale
 * despedida con su propia trayectoria y giro. De ese vacío se arma
 * TRANSFORMACIÓN (verde): las letras vuelven volando a su lugar. Rematan los
 * cuatro diferenciales, que aterrizan como afirmaciones.
 *
 * Las trayectorias del estallido son pseudo-aleatorias DETERMINÍSTICAS
 * (seno hasheado por índice): mismo resultado en cada render, nada de
 * Math.random que ensucie la hidratación.
 *
 * Mobile / prefers-reduced-motion: versión quieta ("No hacemos capacitación /
 * Hacemos transformación") con los diferenciales visibles.
 */

const PALABRA_VIEJA = "CAPACITACIÓN";
const PALABRA_NUEVA = "TRANSFORMACIÓN";

// Pseudo-random determinístico en [-1, 1] a partir del índice y una sal.
const rnd = (i: number, sal: number) => {
  const x = Math.sin(i * 127.1 + sal * 311.7) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
};

export function EnfoqueTransformacion() {
  const zoneRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();
  const [live, setLive] = useState(false);

  useIsomorphicLayoutEffect(() => {
    if (reduced) return;
    if (!window.matchMedia("(hover: hover) and (min-width: 768px)").matches) return;
    setLive(true);
  }, [reduced]);

  useIsomorphicLayoutEffect(() => {
    if (!live) return;
    const zone = zoneRef.current;
    const stage = stageRef.current;
    if (!zone || !stage) return;

    const ctx = gsap.context(() => {
      const viejas = gsap.utils.toArray<HTMLElement>("[data-enf-vieja]");
      const nuevas = gsap.utils.toArray<HTMLElement>("[data-enf-nueva]");

      // Estado inicial: la nueva palabra ya está "estallada" (invisible,
      // desparramada); vuelve a armarse cuando le toca.
      nuevas.forEach((ch, i) => {
        gsap.set(ch, {
          x: rnd(i, 1) * 420,
          y: rnd(i, 2) * 300 - 60,
          rotate: rnd(i, 3) * 120,
          autoAlpha: 0,
        });
      });
      gsap.set("[data-enf-tacha]", { scaleX: 0 });
      gsap.set("[data-enf-dif]", { autoAlpha: 0, y: 34 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: zone,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5,
          invalidateOnRefresh: true,
        },
      });

      // 1) La tacha cruza la palabra vieja.
      tl.to("[data-enf-tacha]", { scaleX: 1, duration: 0.35, ease: "power2.inOut" }, 0.1)
        // 2) Estallido: cada letra sale despedida con su trayectoria y giro.
        .to(
          viejas,
          {
            x: (i) => rnd(i, 4) * 520,
            y: (i) => 160 + Math.abs(rnd(i, 5)) * 420,
            rotate: (i) => rnd(i, 6) * 200,
            autoAlpha: 0,
            duration: 0.9,
            ease: "power2.in",
            stagger: { each: 0.03, from: "center" },
          },
          0.55,
        )
        .to("[data-enf-tacha]", { autoAlpha: 0, duration: 0.3 }, 0.75)
        // 3) La nueva palabra se arma: las letras vuelven a su lugar.
        .to(
          nuevas,
          {
            x: 0,
            y: 0,
            rotate: 0,
            autoAlpha: 1,
            duration: 1,
            ease: "power3.out",
            stagger: { each: 0.045, from: "random" },
          },
          1.35,
        )
        // 4) Aterrizan los diferenciales.
        .to(
          "[data-enf-dif]",
          { autoAlpha: 1, y: 0, duration: 0.55, ease: "power3.out", stagger: 0.14 },
          2.4,
        )
        .to({}, { duration: 0.4 });
    }, stage);

    return () => ctx.revert();
  }, [live]);

  return (
    <section className="relative bg-white" aria-label="Nuestro enfoque">
      {/* Contenido real para lectores de pantalla; la escena es decorativa. */}
      <p className="sr-only">
        No hacemos capacitación: hacemos transformación educativa.
      </p>

      <div ref={zoneRef} className={"relative " + (live ? "h-[300svh]" : "")}>
        <div
          ref={stageRef}
          className={
            live
              ? "sticky top-0 flex h-[100svh] flex-col overflow-clip"
              : "flex min-h-[80svh] flex-col"
          }
        >
          {/* Sin rótulo («Nuestro enfoque · Por qué no es una capacitación
              tradicional»): la escena se explica sola y el rótulo le quitaba
              aire a la palabra (pedido de Mateo, 2026-09-02). El sr-only de
              arriba sigue diciendo la idea para AT. */}

          {live ? (
            <>
              {/* ── Escenario de las dos palabras ─────────────────────── */}
              <div aria-hidden="true" className="relative min-h-0 flex-1">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <span className="relative block whitespace-nowrap">
                    {/* La tacha: cruza la palabra antes del estallido. Más
                        fina (0.06em, como en el fallback): a 0.09em sobre
                        una palabra de ~90px era una barra de 8px. */}
                    <span
                      data-enf-tacha
                      className="bg-azul-medio absolute top-1/2 left-[-2%] h-[0.06em] w-[104%] origin-left rounded-full"
                      style={{ fontSize: "clamp(2.4rem, 0.6rem + 6.4vw, 5.6rem)" }}
                    />
                    {Array.from(PALABRA_VIEJA).map((ch, i) => (
                      <span
                        key={i}
                        data-enf-vieja
                        className="font-display text-azul-principal/70 inline-block font-extrabold tracking-[-0.02em] will-change-transform"
                        style={{
                          fontSize: "clamp(2.4rem, 0.6rem + 6.4vw, 5.6rem)",
                          lineHeight: 1,
                        }}
                      >
                        {ch}
                      </span>
                    ))}
                  </span>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <span className="block whitespace-nowrap">
                    {Array.from(PALABRA_NUEVA).map((ch, i) => (
                      <span
                        key={i}
                        data-enf-nueva
                        className="font-display text-verde-concepto inline-block font-extrabold tracking-[-0.02em] will-change-transform"
                        style={{
                          fontSize: "clamp(2.4rem, 0.6rem + 6.4vw, 5.6rem)",
                          lineHeight: 1,
                        }}
                      >
                        {ch}
                      </span>
                    ))}
                  </span>
                </div>
              </div>

              {/* ── Diferenciales que aterrizan al final ──────────────── */}
              <div className="mx-auto grid w-full max-w-screen-xl gap-x-10 gap-y-5 px-5 pb-14 sm:grid-cols-2 md:px-10 lg:grid-cols-4">
                {DIFERENCIALES.map((dif) => (
                  <div key={dif.k} data-enf-dif>
                    <p className="text-azul-principal font-display text-[1.05rem] leading-snug font-bold">
                      {dif.k}
                    </p>
                    <p className="text-gris-texto mt-1.5 font-sans text-[0.92rem] leading-relaxed">
                      {dif.d}
                    </p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* ── Fallback quieto ─────────────────────────────────────── */
            <div className="mx-auto flex w-full max-w-screen-xl flex-1 flex-col justify-center px-5 py-16 md:px-10">
              <p
                className="font-display text-azul-principal/60 font-extrabold tracking-[-0.02em] line-through decoration-[0.06em]"
                style={{ fontSize: "clamp(2rem, 1rem + 5vw, 4rem)", lineHeight: 1.05 }}
              >
                Capacitación.
              </p>
              <p
                className="font-display text-verde-concepto mt-2 font-extrabold tracking-[-0.02em]"
                style={{ fontSize: "clamp(2.4rem, 1rem + 6vw, 5rem)", lineHeight: 1.05 }}
              >
                Transformación.
              </p>
              <div className="mt-12 grid gap-x-10 gap-y-6 sm:grid-cols-2">
                {DIFERENCIALES.map((dif) => (
                  <div key={dif.k}>
                    <p className="text-azul-principal font-display text-[1.05rem] leading-snug font-bold">
                      {dif.k}
                    </p>
                    <p className="text-gris-texto mt-1.5 font-sans text-[0.92rem] leading-relaxed">
                      {dif.d}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
