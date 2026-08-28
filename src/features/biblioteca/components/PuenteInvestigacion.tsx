"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { RevealLines } from "@/components/ui/RevealLines";
import { ButtonPrimary } from "@/components/ui/ButtonPrimary";
import { ButtonSecondary } from "@/components/ui/ButtonSecondary";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * "Conexión con Investigación" (sitemap pág. 05, sección 7 · PUENTE) —
 * VERSIÓN B: pila de LOMOS. Escena sticky con el scroll como timeline: cada
 * tipo de recurso llega como un panel grande desde la derecha y se apila
 * sobre el anterior, dejando visible solo una franja vertical con su nombre
 * — el lomo del libro en el estante, que para una biblioteca es literal. Los
 * paneles que todavía no llegaron esperan asomando su lomo en el borde
 * derecho. Cada panel tiene aire para lo que en las flip-cards no entraba:
 * foto, qué es el recurso y de qué línea de investigación nace.
 *
 * Geometría: el panel i descansa con su borde izquierdo en i·PASO (los lomos
 * de los ya apilados) y ESPERA pegado al margen derecho con el lomo COMPLETO
 * a la vista, uno al lado del otro (como la referencia): borde izquierdo en
 * W−(N−i)·PASO. El corrimiento entre ambos estados es W−N·PASO, igual para
 * todos: un solo valor function-based recalculado en cada refresh. Para que
 * los lomos en espera no tapen texto, el cuerpo de cada panel se margina a
 * la derecha lo que ocupan los lomos que tiene delante. z ascendente: el que
 * llega tapa al anterior.
 *
 * Mapeo recurso→línea: inferido del modelo conceptual — VALIDAR con cliente.
 * Mobile / touch / prefers-reduced-motion: sin pin — los paneles se apilan
 * verticales con todo el contenido visible (`live` arranca false = SSR).
 */

const PASO = "clamp(52px, 5.5vw, 80px)"; // ancho del lomo

type Tema = {
  card: string;
  spine: string;
  eyebrow: string;
  titulo: string;
  desc: string;
  divisor: string;
  naceLabel: string;
  linea: string;
};

const TEMAS: Record<"navy" | "gris", Tema> = {
  navy: {
    card: "bg-azul-principal",
    spine: "text-white/85",
    eyebrow: "text-azul-claro/90",
    titulo: "text-white",
    desc: "text-white/75",
    divisor: "border-white/15",
    naceLabel: "text-white/45",
    linea: "text-verde-concepto",
  },
  // El "blanco" de las cards es gris-fondo (el blanco sucio del sitio): sobre
  // la sección blanca se recorta solo, sin depender del ring.
  gris: {
    card: "bg-gris-fondo ring-1 ring-azul-principal/10",
    spine: "text-azul-principal/75",
    eyebrow: "text-gris-texto",
    titulo: "text-azul-principal",
    desc: "text-gris-texto",
    divisor: "border-azul-principal/12",
    naceLabel: "text-gris-texto/80",
    linea: "text-verde-concepto-texto",
  },
};

const CARDS = [
  {
    tipo: "Publicaciones",
    desc: "La producción académica que sostiene todo lo demás: artículos, capítulos y libros con lo que investigamos junto a escuelas y equipos docentes.",
    linea: "Resignificación del conocimiento matemático escolar",
    imagen: "/hero/hero-2.webp",
    tema: TEMAS.navy,
  },
  {
    tipo: "Materiales",
    desc: "Secuencias y tareas probadas en aulas reales, listas para adaptar y llevar a la propia práctica.",
    linea: "Tareas disruptivas y matemática funcional",
    imagen: "/metodo/disenamos.webp",
    tema: TEMAS.gris,
  },
  {
    tipo: "Proyectos",
    desc: "El trabajo sostenido con escuelas y comunidades, documentado para que otros equipos puedan retomarlo.",
    linea: "Desarrollo profesional docente sostenido",
    imagen: "/metodo/acompanamos.webp",
    tema: TEMAS.navy,
  },
  {
    tipo: "Guías",
    desc: "Orientaciones paso a paso para llevar las ideas al aula sin perderse en el camino.",
    linea: "Desarrollo del pensamiento matemático",
    imagen: "/metodo/evaluamos.webp",
    tema: TEMAS.gris,
  },
] as const;

export function PuenteInvestigacion() {
  const zoneRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const pilaRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();
  const [live, setLive] = useState(false);

  // Gate primero, GSAP después (efecto aparte): así el layout live ya está
  // aplicado cuando medimos posiciones — con el layout estático los paneles
  // no tienen offset y el paso mediría 0.
  useIsomorphicLayoutEffect(() => {
    if (reduced) return;
    // 1024, no 768: cada lomo mide 52px mínimo, así que los 4 se comen 208px.
    // En tablet el panel abierto quedaba con ~180px por columna y el texto se
    // amontonaba contra la foto. Abajo de eso va la pila estática.
    if (!window.matchMedia("(hover: hover) and (min-width: 1024px)").matches) return;
    setLive(true);
  }, [reduced]);

  useIsomorphicLayoutEffect(() => {
    if (!live) return;
    const zone = zoneRef.current;
    const stage = stageRef.current;
    const pila = pilaRef.current;
    if (!zone || !stage || !pila) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-pila-card]", pila);

      // El paso se mide del layout (offsetLeft ignora transforms).
      const paso = () => (cards[1] ? cards[1].offsetLeft - cards[0].offsetLeft : 0);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: zone,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });

      // Corrimiento reposo→espera (W − N·PASO), igual para todos los paneles.
      const park = () => pila.clientWidth - paso() * cards.length;

      cards.forEach((card, i) => {
        // immediateRender: los lomos quedan pegados al margen derecho ya
        // desde el arranque, no recién cuando les toca viajar.
        tl.fromTo(
          card,
          { x: park },
          { x: 0, duration: 1, ease: "power1.inOut", immediateRender: true },
          i,
        );
      });

      // El contenido del panel tapado se atenúa mientras lo cubre el que
      // llega (el lomo queda pleno: vive fuera de [data-pila-body]).
      cards.slice(0, -1).forEach((card, i) => {
        const body = card.querySelector("[data-pila-body]");
        if (body) {
          tl.to(body, { autoAlpha: 0.3, duration: 0.4, ease: "none" }, i + 1.55);
        }
      });

      // Respiro con la pila completa antes del unpin.
      tl.to({}, { duration: 0.4 });
    }, stage);

    return () => ctx.revert();
  }, [live]);

  return (
    <section
      className="relative bg-white pb-16 md:pb-24"
      aria-label="Conexión con Investigación"
    >
      <div ref={zoneRef} className={live ? "h-[430svh]" : ""}>
        <div
          ref={stageRef}
          className={
            // Clip solo en X: frena a los paneles que asoman por la derecha
            // (sin scrollbar horizontal) pero deja respirar la sombra de las
            // cards hacia abajo — con clip total quedaba cortada en seco al
            // borde del escenario.
            live ? "sticky top-0 isolate flex h-[100svh] flex-col overflow-x-clip" : ""
          }
        >
          {/* Encabezado: queda a la vista durante toda la escena. */}
          <div className="mx-auto w-full max-w-screen-xl px-5 pt-20 pb-8 md:px-10 md:pt-24 md:pb-10">
            <div className="md:grid md:grid-cols-12 md:items-end md:gap-x-8">
              <RevealLines
                as="h2"
                className="font-display text-azul-principal max-w-[18ch] font-bold tracking-[-0.02em] md:col-span-7"
                style={{ fontSize: "clamp(2rem, 1rem + 3vw, 3.6rem)", lineHeight: 1.06 }}
              >
                Detrás de cada recurso, una investigación.
              </RevealLines>
              <div className="mt-8 flex flex-wrap items-center gap-4 md:col-span-4 md:col-start-9 md:mt-0">
                <ButtonPrimary href="/investigacion">Ir a Investigación</ButtonPrimary>
                <ButtonSecondary href="/novedades">Ver novedades</ButtonSecondary>
              </div>
            </div>
          </div>

          {/* La pila: en live los paneles son absolutos y viajan; en estático
              se apilan verticales. El wrapper con padding da el ancho; el div
              interno es el contexto de posicionamiento (los absolutos se
              posicionan contra el padding-box, así que el px no los correría). */}
          <div
            className={
              "mx-auto w-full max-w-screen-xl px-5 md:px-10 " +
              (live ? "min-h-0 flex-1 pb-[3.5svh]" : "pb-4")
            }
          >
            <div
              ref={pilaRef}
              className={live ? "relative h-full" : "flex flex-col gap-5"}
              style={{ "--pila-paso": PASO } as React.CSSProperties}
            >
              {CARDS.map((c, i) => (
                <article
                  key={c.tipo}
                  data-pila-card
                  className={
                    c.tema.card +
                    " overflow-hidden shadow-[0_28px_70px_-32px_rgb(15_23_42/0.45)] " +
                    (live
                      ? "absolute inset-y-0 rounded-[1.5rem] will-change-transform md:rounded-[2rem]"
                      : "relative rounded-2xl")
                  }
                  style={
                    live
                      ? {
                          left: `calc(var(--pila-paso) * ${i})`,
                          width: `calc(100% - var(--pila-paso) * ${i})`,
                          zIndex: 10 + i,
                        }
                      : undefined
                  }
                >
                  {/* Lomo: número arriba, título leyendo de abajo hacia
                      arriba. Es lo único que queda a la vista al taparse. */}
                  {live && (
                    <div
                      aria-hidden="true"
                      className={
                        "absolute inset-y-0 left-0 z-10 flex w-[var(--pila-paso)] flex-col items-center justify-between py-6 " +
                        c.tema.spine
                      }
                    >
                      <span className="font-mono text-[0.65rem] tracking-[0.14em]">
                        {`0${i + 1}`}
                      </span>
                      <span className="font-display rotate-180 text-[1.02rem] font-bold tracking-[-0.01em] whitespace-nowrap [writing-mode:vertical-rl]">
                        {c.tipo}
                      </span>
                    </div>
                  )}

                  <div
                    data-pila-body
                    className={
                      "grid h-full items-center gap-7 md:grid-cols-[1fr_1.05fr] md:gap-10 " +
                      (live
                        ? "p-7 pl-[calc(var(--pila-paso)+0.75rem)] md:p-12 md:pl-[calc(var(--pila-paso)+1.5rem)]"
                        : "p-6 md:p-10")
                    }
                    style={
                      live
                        ? {
                            // Deja libre lo que ocupan los lomos que esperan a
                            // la derecha (los paneles siguientes): el último no
                            // tiene ninguno delante y queda con el padding base.
                            paddingRight: `calc(3rem + var(--pila-paso) * ${CARDS.length - 1 - i})`,
                          }
                        : undefined
                    }
                  >
                    <figure className="relative aspect-[4/3] max-h-[50svh] w-full overflow-hidden rounded-xl md:rounded-2xl">
                      <Image
                        src={c.imagen}
                        alt=""
                        fill
                        sizes="(min-width: 768px) 42vw, 100vw"
                        className="object-cover"
                      />
                    </figure>

                    <div className="min-w-0">
                      <p
                        className={
                          "font-mono text-[0.7rem] tracking-[0.14em] uppercase " +
                          c.tema.eyebrow
                        }
                      >
                        {`Recurso 0${i + 1} / 04`}
                      </p>
                      <h3
                        className={
                          "font-display mt-3 font-extrabold tracking-[-0.02em] " +
                          c.tema.titulo
                        }
                        style={{
                          fontSize: "clamp(1.9rem, 1.2rem + 2.2vw, 3rem)",
                          lineHeight: 1.05,
                        }}
                      >
                        {c.tipo}
                      </h3>
                      <p
                        className={
                          "mt-4 max-w-[46ch] font-sans text-[1rem] leading-relaxed md:text-[1.08rem] " +
                          c.tema.desc
                        }
                      >
                        {c.desc}
                      </p>

                      <div className={"mt-7 border-t pt-5 " + c.tema.divisor}>
                        <p
                          className={
                            "font-mono text-[0.66rem] tracking-[0.16em] uppercase " +
                            c.tema.naceLabel
                          }
                        >
                          Nace de la línea
                        </p>
                        <p
                          className={
                            "font-display mt-2 max-w-[30ch] text-[1.12rem] leading-snug font-bold md:text-[1.3rem] " +
                            c.tema.linea
                          }
                        >
                          {c.linea}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
