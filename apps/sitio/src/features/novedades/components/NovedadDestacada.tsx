"use client";

import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, type ReactNode } from "react";
import { RevealLines } from "@/components/ui/RevealLines";
import { PuntosFaro } from "@/components/ui/PuntosFaro";
import { ArrowUpRight } from "@/components/ui/icons";
import { ScrambleText } from "./ScrambleText";
import { RevealFoco } from "./RevealFoco";
import { useTransicionFaro } from "./TransicionFaro";
import { NOVEDADES, CATEGORIA_LABEL, fechaCorta, type Novedad } from "../data";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * «Leer la nota» de la tapa: abre la ficha con la misma transición del faro
 * que las cards del listado (y calienta la ruta al primer hover, por el
 * compile en dev). Sin cuerpo, baja al listado. Nueva pestaña (ctrl, cmd,
 * shift, rueda): navegación normal, sin telón.
 */
function LinkNota({
  n,
  className,
  children,
}: {
  n: Novedad;
  className: string;
  children: ReactNode;
}) {
  const abrir = useTransicionFaro();
  const calentado = useRef(false);
  const href = n.cuerpo ? `/novedades/${n.id}` : "#ultimas";
  const calentar = () => {
    if (calentado.current || !n.cuerpo) return;
    calentado.current = true;
    fetch(href).catch(() => {});
  };
  return (
    <Link
      href={href}
      className={className}
      onMouseEnter={calentar}
      onFocus={calentar}
      onClick={(e) => {
        if (!n.cuerpo || !abrir || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0)
          return;
        e.preventDefault();
        abrir(href);
      }}
    >
      {children}
    </Link>
  );
}

/**
 * "Novedades destacadas" — la tapa editorial de la página.
 *
 * Composición (referencia: lessestudio.com, traducida al manual ED): un PANEL
 * azul-principal redondeado sobre el gris hace de escenario propio, y adentro
 * viven DOS piezas asimétricas que se SOLAPAN en desktop:
 *
 *  - Card 1 (la `destacada: true`): grande, texto izquierda / foto derecha a
 *    sangre. Es la protagonista; su titular es el único elemento con jerarquía
 *    de H2 en la sección.
 *  - Card 2 (la más reciente no destacada): más chica, corrida abajo-derecha
 *    con margen negativo, montada SOBRE la esquina inferior de la primera.
 *    Composición invertida (foto izquierda / texto derecha) y titular con
 *    line-clamp-2: es "la que sigue", deliberadamente no compite.
 *
 * El solapamiento solo existe con ancho (md+); en mobile quedan apiladas y la
 * segunda se compacta a media-card horizontal.
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
 */
// Verde legible sobre azul: verde-concepto puro queda en ~3.9:1 sobre
// azul-principal (falla AA en texto chico); aclarado al 62% con blanco pasa.
const VERDE_SOBRE_AZUL = {
  color: "color-mix(in srgb, var(--color-verde-concepto) 62%, white)",
};

export function NovedadDestacada() {
  const rootRef = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();

  const principal = NOVEDADES.find((x) => x.destacada) ?? NOVEDADES[0];
  // La lista viene ordenada por fecha desc → la primera que no es la de tapa
  // es "la que sigue".
  const segunda = NOVEDADES.find((x) => x !== principal);

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

  return (
    <section
      ref={rootRef}
      id="destacado"
      data-indice="Destacado"
      className="bg-gris-fondo"
      aria-label="Novedades destacadas"
    >
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

          {/* ── Card 1: la nota de tapa ─────────────────────────────────── */}
          <article
            data-nd-card
            className="group border-azul-claro/20 hover:border-azul-claro/45 relative grid overflow-hidden rounded-2xl border transition-colors duration-300 md:w-[78%] md:grid-cols-[1.05fr_1fr]"
            style={{
              background:
                "color-mix(in srgb, var(--color-azul-medio) 12%, var(--color-azul-principal))",
            }}
          >
            <div className="order-2 flex flex-col justify-center p-6 md:order-1 md:p-10">
              <div className="flex items-center gap-3 font-mono text-[0.72rem] tracking-[0.16em] uppercase">
                <ScrambleText
                  text={CATEGORIA_LABEL[principal.categoria]}
                  style={VERDE_SOBRE_AZUL}
                />
                <span className="bg-azul-claro/40 h-1 w-1 rounded-full" />
                <span className="text-azul-claro/80">{fechaCorta(principal.fecha)}</span>
              </div>

              <RevealLines
                as="h2"
                className="font-display mt-4 font-bold tracking-[-0.02em] text-white"
                style={{ fontSize: "clamp(1.6rem, 1rem + 1.7vw, 2.4rem)", lineHeight: 1.12 }}
              >
                {principal.titulo}
              </RevealLines>

              <p className="mt-4 max-w-[48ch] font-sans text-[1rem] leading-relaxed text-white/75">
                {principal.bajada}
              </p>

              {/* El chip de la flecha se enciende naranja con el hover de TODA
                  la card (group): naranja = acción, ganado por interacción.
                  «Leer la nota» abre la ficha; si la nota no tiene cuerpo, baja
                  al listado (Gastón, 2026-09-11). */}
              <LinkNota
                n={principal}
                className="mt-7 inline-flex w-fit items-center gap-3 font-sans text-[0.95rem] font-medium text-white"
              >
                Leer la nota
                <span className="group-hover:border-naranja-accion group-hover:bg-naranja-accion flex h-8 w-8 items-center justify-center rounded-full border border-white/25 transition-colors duration-300">
                  <ArrowUpRight
                    size={15}
                    className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </span>
              </LinkNota>
            </div>

            {/* Foto a sangre contra el borde derecho; llega desenfocada y se
                enfoca, y al hover respira (zoom lento, como en el listado). */}
            <RevealFoco className="order-1 aspect-[4/3] w-full md:order-2 md:aspect-auto md:h-full">
              <div className="relative h-full w-full overflow-hidden">
                <Image
                  src={principal.imagen}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 480px"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
              </div>
            </RevealFoco>
          </article>

          {/* ── Card 2: la que sigue, montada sobre la esquina de la tapa ── */}
          {segunda && (
            <article
              data-nd-card
              className="group border-azul-claro/25 hover:border-azul-claro/50 relative z-10 mt-5 ml-auto flex overflow-hidden rounded-2xl border shadow-[0_30px_60px_-30px_rgb(0_0_0/0.55)] transition-colors duration-300 md:-mt-24 md:w-[56%]"
              style={{
                background:
                  "color-mix(in srgb, var(--color-azul-medio) 24%, var(--color-azul-principal))",
              }}
            >
              {/* Composición invertida respecto de la tapa: foto izquierda. */}
              <RevealFoco
                delay={0.25}
                className="w-[36%] shrink-0 self-stretch md:w-[40%]"
              >
                <div className="relative h-full min-h-[8.5rem] w-full overflow-hidden">
                  <Image
                    src={segunda.imagen}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 40vw, 280px"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                </div>
              </RevealFoco>

              <div className="flex min-w-0 flex-col justify-center p-5 md:p-7">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[0.68rem] tracking-[0.14em] uppercase">
                  <span style={VERDE_SOBRE_AZUL}>
                    {CATEGORIA_LABEL[segunda.categoria]}
                  </span>
                  <span className="bg-azul-claro/40 hidden h-1 w-1 rounded-full sm:block" />
                  <span className="text-azul-claro/80">{fechaCorta(segunda.fecha)}</span>
                </div>

                <h3 className="font-display mt-2.5 line-clamp-2 text-[1.1rem] leading-snug font-bold text-white md:text-[1.35rem]">
                  {segunda.titulo}
                </h3>

                <LinkNota
                  n={segunda}
                  className="text-azul-claro mt-4 inline-flex w-fit items-center gap-2.5 font-sans text-[0.88rem] font-medium"
                >
                  Leer la nota
                  <span className="group-hover:border-naranja-accion group-hover:bg-naranja-accion group-hover:text-white flex h-7 w-7 items-center justify-center rounded-full border border-white/25 transition-colors duration-300">
                    <ArrowUpRight
                      size={13}
                      className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </span>
                </LinkNota>
              </div>
            </article>
          )}
        </div>
      </div>
    </section>
  );
}
