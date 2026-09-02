"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CINTA, PROYECTO_AREAS } from "../data";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * "Proyectos y aplicaciones" — chips que FLORECEN (referencia Assistantly,
 * espejo de Niveles: allá las cards se cierran, acá se abren). Las 5 áreas
 * arrancan como pastillas chicas ("Área — 01") desparramadas en la grilla;
 * con el scroll, cada una se EXPANDE en su lugar hasta ser la card completa
 * (el ancho crece del chip a la celda, el cuerpo se despliega) y al abrirse
 * le brota al costado una etiquetita rotada con ejemplos del área. Arriba,
 * la CINTA infinita navy con la producción real de ED (nada inventado).
 *
 * Mobile / touch / prefers-reduced-motion: cards completas en grilla
 * estática. PENDIENTE: cuando el cliente pase proyectos reales con nombre,
 * esta grilla pasa a ser una grilla de casos.
 */

// Desfases verticales para que la grilla se lea desparramada (como los chips
// de la referencia), no una fila prolija.
const DESFASES = ["md:mt-0", "md:mt-16", "md:mt-8", "md:mt-12", "md:mt-2"];

// Posición y rotación de la etiquetita de cada card (esquinas alternadas).
const ETIQ_POS = [
  "-left-5 -bottom-4 -rotate-6",
  "-right-6 -top-3 rotate-3",
  "-left-4 -top-4 -rotate-3",
  "-right-5 -bottom-3 rotate-6",
  "-left-6 -bottom-4 rotate-2",
];
const ETIQ_COLOR = [
  "bg-verde-concepto/15 text-verde-concepto-texto ring-verde-concepto/30",
  "bg-azul-claro/40 text-azul-principal ring-azul-medio/30",
  "bg-verde-concepto/15 text-verde-concepto-texto ring-verde-concepto/30",
  "bg-azul-claro/40 text-azul-principal ring-azul-medio/30",
  "bg-verde-concepto/15 text-verde-concepto-texto ring-verde-concepto/30",
];

export function ProyectosAplicaciones() {
  const rootRef = useRef<HTMLElement | null>(null);
  const zoneRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const cintaRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();
  const [live, setLive] = useState(false);

  useIsomorphicLayoutEffect(() => {
    if (reduced) return;
    if (!window.matchMedia("(hover: hover) and (min-width: 768px)").matches) return;
    setLive(true);
  }, [reduced]);

  // La cinta corre siempre que haya motion (también en fallback táctil no,
  // porque táctil no pasa el gate de live — la manejamos aparte del pin).
  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    const cinta = cintaRef.current;
    if (!root || !cinta || reduced) return;
    const loop = gsap.to(cinta, {
      xPercent: -50,
      duration: 26,
      ease: "none",
      repeat: -1,
      paused: true,
    });
    const st = ScrollTrigger.create({
      trigger: root,
      start: "top bottom",
      end: "bottom top",
      onToggle: (self) => (self.isActive ? loop.play() : loop.pause()),
    });
    return () => {
      st.kill();
      loop.kill();
    };
  }, [reduced]);

  // La escena: chips que se abren uno a uno con el scroll.
  useIsomorphicLayoutEffect(() => {
    if (!live) return;
    const zone = zoneRef.current;
    const stage = stageRef.current;
    if (!zone || !stage) return;

    const run = () => {
      const ctx = gsap.context(() => {
        const cards = gsap.utils.toArray<HTMLElement>("[data-proy-card]");
        const etiquetas = gsap.utils.toArray<HTMLElement>("[data-proy-etiqueta]");

        // Estado chip: cuerpo plegado, ancho al talle de la fila de arriba,
        // esquinas de pastilla. OJO: la altura final del cuerpo se mide ACÁ,
        // con la card todavía a ancho completo — si se deja height:"auto" en
        // el tween, gsap mide con la card angosta (texto envuelto en 120px =
        // un altazo) y esa altura queda clavada como colchón vacío.
        const alturas: number[] = [];
        cards.forEach((card, i) => {
          const fila = card.querySelector<HTMLElement>("[data-proy-fila]");
          const cuerpo = card.querySelector<HTMLElement>("[data-proy-cuerpo]");
          if (!fila || !cuerpo) return;
          alturas[i] = cuerpo.offsetHeight;
          gsap.set(cuerpo, { height: 0, autoAlpha: 0 });
          gsap.set(card, { width: fila.offsetWidth + 48, borderRadius: 999 });
        });
        gsap.set(cards, { autoAlpha: 0, y: 34 });
        gsap.set(etiquetas, { autoAlpha: 0, scale: 0.6 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: zone,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        });

        // 1 — los chips caen al escenario.
        tl.to(cards, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out", stagger: 0.1 }, 0);

        // 2 — cada chip FLORECE: el ancho crece a la celda, el cuerpo se
        // despliega y le brota la etiquetita.
        cards.forEach((card, i) => {
          const cuerpo = card.querySelector<HTMLElement>("[data-proy-cuerpo]");
          const t = 1 + i * 0.55;
          tl.to(
            card,
            {
              width: () => card.parentElement?.offsetWidth ?? 320,
              borderRadius: 16,
              duration: 0.5,
              ease: "power2.inOut",
            },
            t,
          );
          if (cuerpo) {
            tl.to(
              cuerpo,
              { height: alturas[i] ?? "auto", autoAlpha: 1, duration: 0.45, ease: "power2.out" },
              t + 0.2,
            );
          }
          if (etiquetas[i]) {
            tl.to(etiquetas[i], { autoAlpha: 1, scale: 1, duration: 0.35, ease: "back.out(2.2)" }, t + 0.5);
          }
        });

        tl.to({}, { duration: 0.4 });
      }, stage);

      return () => ctx.revert();
    };

    let cleanup: (() => void) | undefined;
    if (document.fonts?.ready) document.fonts.ready.then(() => (cleanup = run()));
    else cleanup = run();
    return () => cleanup?.();
  }, [live]);

  return (
    <section
      ref={rootRef}
      className="bg-gris-fondo relative overflow-clip"
      aria-label="Proyectos y aplicaciones"
    >
      {/* Contenido real para lectores de pantalla (los chips arrancan plegados). */}
      <ul className="sr-only">
        {PROYECTO_AREAS.map((area) => (
          <li key={area.titulo}>
            {area.titulo}: {area.d}
          </li>
        ))}
      </ul>

      {/* ── Cinta infinita: la producción real, corriendo ─────────────── */}
      <div className="bg-azul-principal py-3.5">
        <div ref={cintaRef} className="flex w-max gap-10 whitespace-nowrap will-change-transform">
          {[0, 1].map((copia) => (
            <div
              key={copia}
              aria-hidden={copia === 1 || undefined}
              className="flex gap-10"
            >
              {CINTA.map((item) => (
                <span
                  key={item}
                  className="text-azul-claro/90 flex items-center gap-10 font-mono text-[0.72rem] tracking-[0.16em] uppercase"
                >
                  {item}
                  <span className="bg-verde-concepto inline-block h-1.5 w-1.5 rounded-full" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div ref={zoneRef} className={"relative " + (live ? "h-[260svh]" : "")}>
        <div
          ref={stageRef}
          className={
            live ? "sticky top-0 flex h-[100svh] flex-col overflow-clip" : "flex flex-col"
          }
          aria-hidden={live || undefined}
        >
          <div className="mx-auto w-full max-w-screen-xl px-5 pt-16 md:px-10 md:pt-20">
            <div className="md:grid md:grid-cols-12 md:items-end md:gap-x-8">
              <div className="md:col-span-7">
                <p className="text-gris-texto font-mono text-[0.7rem] tracking-[0.14em] uppercase">
                  Proyectos y aplicaciones
                </p>
                <h2
                  className="font-display text-azul-principal mt-4 max-w-[18ch] font-bold tracking-[-0.02em]"
                  style={{ fontSize: "clamp(2rem, 1rem + 3vw, 3.6rem)", lineHeight: 1.06 }}
                >
                  Lo que investigamos, puesto a trabajar.
                </h2>
              </div>
              <p className="text-gris-texto mt-6 max-w-[42ch] font-sans text-[1.02rem] leading-relaxed md:col-span-4 md:col-start-9 md:mt-0">
                Cinco áreas donde las líneas de acción se vuelven proyectos
                concretos, junto a escuelas, redes y ministerios.
              </p>
            </div>
          </div>

          {/* ── Las 5 áreas: chips que florecen (live) / grilla (fallback) ── */}
          <div className="mx-auto flex w-full max-w-screen-xl flex-1 items-center px-5 pb-14 md:px-10">
            <div className="grid w-full gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {PROYECTO_AREAS.map((area, i) => (
                <div key={area.titulo} className={"relative " + (live ? DESFASES[i] : "")}>
                  <div
                    data-proy-card
                    className="ring-azul-principal/10 relative overflow-hidden rounded-2xl bg-white p-6 shadow-[0_18px_50px_-30px_rgb(15_23_42/0.35)] ring-1"
                  >
                    {/* w-fit: el ancho del chip plegado se mide de esta fila. */}
                    <p
                      data-proy-fila
                      className="text-gris-texto w-fit font-mono text-[0.68rem] tracking-[0.14em] whitespace-nowrap uppercase"
                    >
                      Área — {String(i + 1).padStart(2, "0")}
                    </p>
                    <div data-proy-cuerpo className="overflow-hidden">
                      <h3 className="font-display text-azul-principal mt-4 text-[1.15rem] leading-snug font-bold">
                        {area.titulo}
                      </h3>
                      <p className="text-gris-texto mt-2 font-sans text-[0.92rem] leading-relaxed">
                        {area.d}
                      </p>
                    </div>
                  </div>
                  {/* Etiquetita rotada que brota al abrirse la card. */}
                  {live && (
                    <span
                      data-proy-etiqueta
                      aria-hidden="true"
                      className={
                        "absolute z-10 rounded-md px-2.5 py-1 font-mono text-[0.62rem] tracking-[0.12em] whitespace-nowrap uppercase ring-1 " +
                        ETIQ_POS[i] +
                        " " +
                        ETIQ_COLOR[i]
                      }
                    >
                      {area.etiqueta}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
