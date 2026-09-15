"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "@/components/ui/icons";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { CartaArea } from "./lineas-accion/CartaArea";
import { AREAS } from "./lineas-accion/data";
import { crearManoCartas } from "./lineas-accion/mano-cartas";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const CARD_W = 360; // px — fallback del ancho de carta (el real se mide en runtime)

/**
 * Líneas de acción — abanico de cartas.
 *
 * El título queda centrado detrás. A medida que se scrollea, las 7 cartas
 * suben desde abajo una a una y se asientan en un abanico que ocupa todo
 * el ancho máximo de la grilla, tapando el título.
 *
 * Desktop + motion → escenario sticky animado con GSAP (integrado con
 * Lenis vía el ticker global). Mobile / tablet / reduced-motion → grilla
 * estática legible (la clase .is-live se agrega pre-paint solo cuando hay
 * que animar, así no hay flash grilla→abanico).
 */
export function LineasAccion() {
  const rootRef = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // El abanico animado es solo para desktop con motion. En mobile y tablet
    // va la grilla estática: la pila superpuesta que había dejaba seis de las
    // siete cartas tapadas, el título asomando por los costados y el CTA
    // montado sobre la última carta. Reduced-motion también cae a la grilla.
    if (reduced) return;
    if (!window.matchMedia("(min-width: 1024px)").matches) return;

    const scroll = root.querySelector<HTMLElement>("[data-deck-scroll]");
    const stage = root.querySelector<HTMLElement>("[data-deck-stage]");
    const cta = root.querySelector<HTMLElement>("[data-deck-cta]");
    const cards = gsap.utils.toArray<HTMLElement>("[data-deck-card]", root);
    if (!scroll || !stage || cards.length !== AREAS.length) return;

    root.classList.add("is-live");

    // Limpiezas que no pasan por el revert del contexto (listeners, hover).
    const limpiezas: Array<() => void> = [];

    const ctx = gsap.context(() => {
      const total = cards.length;
      const center = (total - 1) / 2; // índice central

      // Posición de reposo de cada carta: ABANICO horizontal. El paso (spread)
      // se calcula EN VIVO desde el ancho del escenario y de la carta
      // (responsiva, ver globals.css). Así, al cambiar el ancho de la ventana se
      // recalcula (ver onResize) y el abanico NO se pasa de la pantalla. Margen
      // cómodo a los costados.
      const stepNow = () => {
        const cardW = cards[0].offsetWidth || CARD_W;
        const half = stage.clientWidth / 2;
        const maxCenter = Math.max(120, half - cardW / 2 - 58);
        return (2 * maxCenter) / (total - 1);
      };
      const restX = (i: number) => (i - center) * stepNow();
      const restRot = (i: number) => (i - center) * 1.6;
      // Arco leve: las cartas de los extremos quedan apenas más abajo.
      const restY = (i: number) => Math.pow(i - center, 2) * 4 - 8;

      // Estado inicial: cada carta en su columna, fuera de cuadro por abajo.
      cards.forEach((card, i) => {
        gsap.set(card, {
          x: restX(i),
          y: restY(i) + 640,
          rotation: restRot(i) - 3,
          scale: 0.94,
          opacity: 0,
          zIndex: 10 + i,
        });
      });
      // El CTA de cierre arranca oculto: se revela al final del reparto.
      if (cta) gsap.set(cta, { opacity: 0, y: 24 });

      const seg = 1 / total;
      // A cada paso del scroll la mano revisa si la carta elegida se volvió a
      // mover (ver mano-cartas.ts).
      let revisarMano = () => {};
      const tl = gsap.timeline({
        onUpdate: () => revisarMano(),
        scrollTrigger: {
          trigger: scroll,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
        },
      });
      // Cada carta sube desde abajo a su lugar (x ya fijo en su columna).
      cards.forEach((card, i) => {
        tl.to(
          card,
          {
            y: restY(i),
            rotation: restRot(i),
            scale: 1,
            opacity: 1,
            ease: "power3.out",
            duration: seg * 0.85,
          },
          i * seg,
        );
      });
      // CTA: entra cuando aterriza la última carta (tramo final del scroll).
      if (cta) {
        tl.to(
          cta,
          {
            opacity: 1,
            y: 0,
            ease: "power3.out",
            duration: seg * 0.85,
          },
          (total - 1) * seg,
        );
      }

      // --- Mano de cartas ---------------------------------------------------
      // Al recorrer el abanico con el mouse, la carta más cercana se saca del
      // mazo y pasa al frente; las vecinas le abren lugar. La coreografía
      // entera vive en lineas-accion/mano-cartas.ts.
      const mano = crearManoCartas({
        escenario: stage,
        cartas: cards,
        giroReposo: restRot,
        // La carta i termina de aterrizar en (i + 0.85) · seg del timeline.
        aterrizada: (i) => tl.progress() >= (i + 0.85) * seg - 0.005,
      });
      revisarMano = mano.revisar;
      limpiezas.push(mano.limpiar);

      // Recalcular el spread del abanico al cambiar el ancho de la ventana: el
      // restX depende del ancho del escenario; sin esto, al achicar la ventana
      // el abanico (calculado con el ancho anterior) se pasa de la pantalla.
      // Solo toca x (alto/rotación no dependen del ancho).
      let resizeRaf = 0;
      const onResize = () => {
        cancelAnimationFrame(resizeRaf);
        resizeRaf = requestAnimationFrame(() => {
          cards.forEach((card, i) => gsap.set(card, { x: restX(i) }));
        });
      };
      window.addEventListener("resize", onResize);
      limpiezas.push(() => {
        cancelAnimationFrame(resizeRaf);
        window.removeEventListener("resize", onResize);
      });
    }, root);

    return () => {
      limpiezas.forEach((fn) => fn());
      ctx.revert();
      root.classList.remove("is-live");
    };
  }, [reduced]);

  return (
    <section
      ref={rootRef}
      id="areas"
      data-indice="Áreas"
      data-section="lineas"
      className="deck from-white to-gris-fondo relative bg-gradient-to-b"
      aria-label="Áreas de desarrollo"
    >
      <div data-deck-scroll className="deck-scroll">
        <div
          data-deck-stage
          className="deck-stage relative mx-auto max-w-screen-xl px-5 py-24 md:px-10 md:py-28"
        >
          {/* Encabezado: en grilla va arriba centrado; en live el título se
              reubica al centro y la bajada abajo. */}
          <div className="deck-head text-center">
            <h2
              className="deck-title font-display text-azul-principal font-bold tracking-[-0.022em]"
              style={{
                fontSize: "clamp(2rem, 6vw, 4.75rem)",
                lineHeight: 1.03,
              }}
            >
              Áreas de desarrollo
            </h2>
            <p className="deck-caption text-gris-texto mx-auto mt-5 max-w-xl font-sans text-[0.97rem] leading-relaxed">
              Los ámbitos desde los cuales diseñamos soluciones educativas
              fundamentadas en la investigación y construidas para cada realidad.
            </p>
          </div>

          {/* Las cartas. */}
          <ul className="deck-cards mt-14 md:mt-16">
            {AREAS.map((area, i) => (
              <li key={area.n} data-deck-card className="deck-card">
                <CartaArea area={area} total={AREAS.length} azulBase={i % 2 === 1} />
              </li>
            ))}
          </ul>

          {/* Salida → Investigación, que es el archivo de casos: las áreas
              puestas en práctica. El copy lo dice, si no el salto no se
              entendía (Gastón, 2026-09-11). En live aparece abajo-centro
              cuando ya salieron todas las cartas. */}
          <div
            data-deck-cta
            className="deck-cta mt-12 flex justify-center md:justify-start"
          >
            <Link
              href="/investigacion"
              className="group inline-flex items-center gap-3"
            >
              <span className="border-azul-principal/15 group-hover:border-naranja-accion group-hover:bg-naranja-accion inline-flex h-11 w-11 items-center justify-center rounded-full border transition-colors duration-500 group-hover:text-white">
                <ArrowRight size={17} />
              </span>
              <span className="text-azul-principal group-hover:text-naranja-accion font-sans text-[0.93rem] font-medium tracking-wide transition-colors duration-500">
                Mirá los casos donde lo aplicamos
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
