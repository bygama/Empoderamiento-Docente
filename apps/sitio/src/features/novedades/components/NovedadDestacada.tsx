"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import { PuntosFaro } from "@/components/ui/PuntosFaro";
import type { NovedadDelSitio } from "@/features/novedades/contenido/novedad";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { SegundaDestacada } from "./destacada/SegundaDestacada";
import { TapaDestacada } from "./destacada/TapaDestacada";
import { ScrambleText } from "./ScrambleText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * "Novedades destacadas" — la tapa editorial de la página.
 *
 * Composición (referencia: lessestudio.com, traducida al manual ED): un PANEL
 * azul-principal redondeado sobre el gris hace de escenario propio, y adentro
 * viven DOS piezas asimétricas que se SOLAPAN en desktop: la tapa (la
 * destacada, o la más nueva si no hay) y la que sigue (la más nueva que no es
 * la tapa), montada sobre su esquina (`destacada/`). El solapamiento solo
 * existe con ancho (md+); en mobile quedan apiladas y la segunda se compacta
 * a media-card horizontal.
 *
 * Atmósfera del panel: glow de faro arriba-derecha (eco del hero) + los PUNTOS
 * VIVOS del hero (<PuntosFaro />): capa base tenue y haz que sigue al cursor
 * encendiéndolos. El barrido de entrada del componente corre al montar (con la
 * página recién cargada el panel está bajo el fold y no se ve) — no molesta:
 * termina entregando el haz al cursor, que es lo que importa acá. Sin "bola
 * naranja": el manual prohíbe naranja decorativo.
 *
 * El naranja SÍ aparece, pero ganado por interacción: al hover de cada card el
 * chip de la flecha "Leer la nota" se enciende en naranja-accion (naranja =
 * acción, y el hover es exactamente el momento en que la card se vuelve
 * acción). En reposo no hay naranja, así el verde de las categorías nunca
 * convive con él en primer plano (DESIGN §1 regla 4).
 *
 * Entrada tipo "cartas repartidas": las dos suben escalonadas y la montada
 * llega después con una rotación mínima que se asienta al apilarse. El eyebrow
 * se decodifica (ScrambleText) y las fotos SE ENFOCAN (<RevealFoco />) — todo
 * el mismo gesto: señales del faro que se aclaran.
 *
 * Marca: el label de sección es un eyebrow chico en mono (no un H2 — el titular
 * de la nota ES el título acá). Verde solo para conceptos, aclarado con
 * color-mix sobre el azul para pasar AA en texto chico. Profundidad con borde
 * azul-claro sutil + una sola sombra para el lift de la card montada.
 *
 * Sin novedades (sin base), no se dibuja.
 */
export function NovedadDestacada({ novedades }: { novedades: readonly NovedadDelSitio[] }) {
  const rootRef = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();

  const principal = novedades.find((x) => x.destacada) ?? novedades[0];
  // La lista viene ordenada por fecha desc → la primera que no es la de tapa
  // es "la que sigue".
  const segunda = novedades.find((x) => x !== principal);

  // Entrada: la tapa sube derecha; la montada sube más, después, y con un giro
  // de 2.4° que se asienta a 0 — el gesto de apoyar una carta sobre otra. Los
  // enfoques de foto (RevealFoco) corren por su cuenta.
  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return;
    const ctx = gsap.context(() => {
      gsap.from("[data-nd-card]", {
        autoAlpha: 0,
        y: (i) => 44 + i * 20,
        rotation: (i) => (i === 1 ? 2.4 : 0),
        transformOrigin: "50% 100%",
        duration: 1,
        ease: "power3.out",
        stagger: 0.22,
        scrollTrigger: { trigger: root, start: "top 72%" },
      });
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  if (!principal) return null;

  return (
    <section ref={rootRef} id="destacado" data-indice="Destacado" className="bg-gris-fondo" aria-label="Novedades destacadas">
      <div className="mx-auto w-full max-w-screen-xl px-5 py-20 md:px-10 md:py-28">
        <div className="bg-azul-principal relative isolate overflow-hidden rounded-[2rem] px-5 py-10 md:rounded-[2.75rem] md:px-12 md:py-14">
          {/* Atmósfera: glow de faro arriba-derecha (eco del hero) + puntos
              vivos del manual §6 que el cursor enciende a su paso. */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
            <span
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(48% 55% at 85% 0%, color-mix(in srgb, var(--color-azul-claro) 18%, transparent), transparent 70%)",
              }}
            />
            {/* Atenuados al 40%: el protagonista del efecto es el hero de
                arriba; acá es un eco, no una competencia. */}
            <div className="absolute inset-0 opacity-40">
              <PuntosFaro />
            </div>
          </div>

          {/* Label de sección: eyebrow chico, no H2 — el titular de la nota es
              el protagonista acá. Punto verde latiendo + decodificado, como la
              señal del faro del hero. */}
          <div className="text-azul-claro/90 mb-8 flex items-center gap-3 font-mono text-[0.74rem] tracking-[0.2em] uppercase md:mb-10">
            <span className="bg-verde-concepto h-2 w-2 animate-pulse rounded-full" />
            <ScrambleText text="Novedades destacadas" duration={1000} />
          </div>

          <TapaDestacada n={principal} />
          {segunda && <SegundaDestacada n={segunda} />}
        </div>
      </div>
    </section>
  );
}
