"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MOVIMIENTO } from "../data";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * "ED en movimiento" — la escena de profundidad. Cada momento de ED emerge de
 * la luz del faro en el horizonte (un punto al centro) y se ACERCA hacia el
 * usuario a medida que scrollea: crece, deriva hacia su lado y pasa de largo,
 * mientras al centro aparecen frases que lo nombran. Referencia visual del
 * usuario (barcos saliendo de la niebla) traducida al mundo del faro/ED.
 *
 * Cero líneas/nodos: es puro scale + posición + opacidad, escena sticky con el
 * scroll como timeline (scrub). Lanes alternadas izq/der con stagger para que
 * haya ~2 momentos visibles a la vez.
 *
 * Sin motion / touch sin hover / pantallas chicas: NO se activa el dolly (que
 * necesita scroll fino y espacio). Cae a una grilla estática legible con las
 * fotos y sus etiquetas. `live` arranca en false (coincide con SSR) y se
 * enciende al montar solo si corresponde.
 */

// Lane de cada momento: lado (-1 izq / +1 der) y altura final (fracción del
// alto). Se recorren en orden, alternando lados.
const LANES = [
  { side: -1, y: -0.16 },
  { side: 1, y: 0.08 },
  { side: -1, y: 0.2 },
  { side: 1, y: -0.12 },
  { side: -1, y: 0.04 },
  { side: 1, y: 0.16 },
];

/**
 * Pinta en verde-concepto el tramo `acento` dentro de `frase` — la misma
 * convención que los heroes ("y recursos" en Biblioteca, "transformar." en
 * Investigación). Si el acento no aparece en la frase, devuelve la frase entera
 * en blanco: la copy manda, el color es un realce.
 */
function conAcento(frase: string, acento: string) {
  const i = acento ? frase.indexOf(acento) : -1;
  if (i === -1) return frase;
  return (
    <>
      {frase.slice(0, i)}
      <span className="text-verde-concepto">{acento}</span>
      {frase.slice(i + acento.length)}
    </>
  );
}

export function EdEnMovimiento() {
  const zoneRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const counterRef = useRef<HTMLSpanElement | null>(null);
  const reduced = useReducedMotion();
  const [live, setLive] = useState(false);

  useIsomorphicLayoutEffect(() => {
    if (reduced) return;
    // Dolly solo con puntero fino y viewport con aire suficiente.
    if (!window.matchMedia("(hover: hover) and (min-width: 768px)").matches) return;
    setLive(true);

    const zone = zoneRef.current;
    const stage = stageRef.current;
    if (!zone || !stage) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-mov-card]");
      // El hint viene con la coreografía (solo con `live`) y se va con ella.
      gsap.set(cards, { willChange: "transform" });
      const phrases = gsap.utils.toArray<HTMLElement>("[data-mov-phrase]");
      const luz = stage.querySelector<HTMLElement>("[data-mov-luz]");
      const W = window.innerWidth;
      const H = window.innerHeight;
      const vpY = -H * 0.06; // punto de fuga: la luz del horizonte, algo arriba del centro

      // Estado inicial: todos diminutos en el punto de fuga.
      cards.forEach((card) => {
        gsap.set(card, {
          xPercent: -50,
          yPercent: -50,
          x: 0,
          y: vpY,
          scale: 0.05,
          autoAlpha: 0,
          transformOrigin: "50% 50%",
        });
      });
      gsap.set(phrases, { autoAlpha: 0, y: 16 });

      // El faro se enciende MIENTRAS la sección entra en cuadro: la luz nace
      // chica y apagada y llega a plena justo cuando el navy terminó de ocupar
      // la pantalla. Ventana exacta: de "top bottom" a "top top".
      if (luz) {
        gsap.fromTo(
          luz,
          { autoAlpha: 0, scale: 0.45 },
          {
            autoAlpha: 1,
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: zone,
              start: "top bottom",
              end: "top top",
              scrub: true,
            },
          },
        );
      }

      const step = 1.7; // separación entre momentos en el timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: zone,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
          // Contador de progreso: qué momento está en escena. Se escribe
          // directo al DOM (sin estado React) para no re-renderizar por tick.
          onUpdate: (self) => {
            const el = counterRef.current;
            if (!el || !self.animation) return;
            const i = Math.min(
              MOVIMIENTO.length - 1,
              Math.max(0, Math.floor(self.animation.time() / step)),
            );
            const label = String(i + 1).padStart(2, "0");
            if (el.textContent !== label) el.textContent = label;
          },
        },
      });

      cards.forEach((card, i) => {
        const lane = LANES[i % LANES.length];
        const t = i * step;
        // Acercarse: del punto de fuga a su lane, creciendo y apareciendo.
        tl.to(
          card,
          {
            x: lane.side * W * 0.26,
            y: lane.y * H,
            scale: 1,
            autoAlpha: 1,
            ease: "none",
            duration: 2.2,
          },
          t,
        )
          // Pasar de largo: sigue derivando, crece y se desvanece.
          .to(
            card,
            {
              x: lane.side * W * 0.46,
              y: lane.y * H * 1.5,
              scale: 1.7,
              autoAlpha: 0,
              ease: "none",
              duration: 1.1,
            },
            t + 2.2,
          );
      });

      // Frases al centro, de a una: la salida de cada frase termina (t+2.45)
      // antes de que entre la siguiente (t+step+0.8 = t+2.5). Si se pisan,
      // se superponen legibles en el mismo punto y se lee sucio.
      phrases.forEach((ph, i) => {
        const t = i * step;
        tl.fromTo(
          ph,
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, ease: "none", duration: 0.6 },
          t + 0.8,
        ).to(ph, { autoAlpha: 0, y: -12, ease: "none", duration: 0.45 }, t + 2.0);
      });
    }, stage);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <div
      ref={zoneRef}
      id="ed-en-movimiento"
      data-indice="ED en movimiento"
      className={"relative bg-azul-principal " + (live ? "h-[560svh]" : "")}
      aria-label="ED en movimiento"
    >
      <div
        ref={stageRef}
        className={
          "bg-grain-dark relative isolate overflow-hidden text-white " +
          (live ? "sticky top-0 flex h-[100svh] flex-col" : "flex min-h-[70svh] flex-col py-24")
        }
      >
        {/* Luz del faro EN el horizonte: elipse angosta y baja sobre la línea de
            fuga (44% ≈ centro + vpY), no un globo centrado detrás del texto.
            Dos capas: núcleo fino + halo amplio y tenue. Solo se "enciende"
            mientras la sección entra en cuadro; después queda quieta. */}
        <span
          data-mov-luz
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            transformOrigin: "50% 44%",
            background:
              "radial-gradient(42% 6% at 50% 44%, color-mix(in srgb, var(--color-azul-claro) 17%, transparent), transparent 70%), radial-gradient(68% 18% at 50% 44%, color-mix(in srgb, var(--color-azul-claro) 8%, transparent), transparent 70%)",
          }}
        />

        {/* Progreso de la escena: momento activo / total. Mismo lenguaje que
            las etiquetas de las fotos (mono chico, azul-claro). Decorativo:
            oculto a lectores de pantalla y solo en modo live. */}
        {live && (
          <p
            aria-hidden="true"
            className="pointer-events-none absolute bottom-8 left-5 z-20 font-mono text-[0.68rem] tracking-[0.16em] text-azul-claro/80 md:left-10"
          >
            <span ref={counterRef}>01</span>
            <span className="text-white/35"> / {String(MOVIMIENTO.length).padStart(2, "0")}</span>
          </p>
        )}

        {/* Frases al centro: overlay que crossfadea en modo live. Se renderizan
            siempre (así el efecto las encuentra); en estático quedan invisibles
            —son un floreo, no contenido esencial—. */}
        <div className="pointer-events-none absolute inset-x-0 top-[38%] z-20 flex flex-col items-center gap-2 px-6 text-center">
          {MOVIMIENTO.map((m) => (
            <p
              key={m.id}
              data-mov-phrase
              className="font-display text-[clamp(1.6rem,1rem+2.4vw,3rem)] font-bold tracking-[-0.02em] text-white [text-shadow:0_2px_30px_rgb(15_21_40/0.6)]"
              style={{ position: "absolute", opacity: 0 }}
            >
              {conAcento(m.frase, m.acento)}
            </p>
          ))}
        </div>

        {/* Momentos: en live son cards absolutas que vuelan; en estático, grilla. */}
        <div
          className={
            live
              ? "relative flex-1"
              : "mx-auto mt-10 grid w-full max-w-screen-xl grid-cols-2 gap-4 px-5 md:grid-cols-3 md:px-10"
          }
        >
          {MOVIMIENTO.map((m) => (
            <figure
              key={m.id}
              data-mov-card
              className={
                live
                  ? "absolute top-1/2 left-1/2 w-[clamp(200px,22vw,340px)]"
                  : "relative"
              }
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl shadow-[0_30px_60px_-30px_rgb(0_0_0/0.7)] ring-1 ring-white/10">
                <Image
                  src={m.imagen}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 45vw, 340px"
                  className="object-cover"
                />
                <span className="absolute inset-0 bg-azul-principal/10" />
              </div>
              <figcaption className="mt-2 font-mono text-[0.68rem] tracking-[0.16em] text-azul-claro/90 uppercase">
                {m.etiqueta}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </div>
  );
}
