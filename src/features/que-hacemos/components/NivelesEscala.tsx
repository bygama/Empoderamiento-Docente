"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { NIVELES } from "../data";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * "Niveles en los que intervenimos" — scroll-story CLAVADO, mismo lenguaje
 * que el ciclo de /investigacion (el patrón que quedó aprobado): los 5
 * niveles son cards que LLEGAN subiendo desde abajo, se PLANTAN abiertas y
 * SE CIERRAN (colapsan a solo el título) recién cuando la siguiente aterriza,
 * repartidas en zig-zag por todo el ancho — de lo micro a lo macro. Llegar y
 * cerrar van separados a propósito: antes la card empezaba a cerrarse a tres
 * cuartos de la subida y la descripción nunca estaba quieta para leerse.
 * Siempre hay UNA card abierta y quieta.
 *
 * El titular "Del aula," abre la sección con la coma en suspenso y se va
 * antes de la primera card. Lo que sigue son las cards: la última llegada
 * (con el cierre de la anterior) es lo último que se ve antes de que el
 * sticky se suelte. Había un remate en que las cards cedían y volvía el
 * titular completo ("Del aula, / al sistema educativo.") en una pantalla
 * propia; se sacó (Facundo, 2026-09-03): era una pantalla más que
 * scrollear después de la coreografía, y la animación tiene que ser lo
 * último.
 *
 * Sin motion / touch / pantalla chica: no clava; grilla legible + titular.
 * `live` arranca en false (coincide con SSR).
 */

// Zig-zag a lo ancho del escenario, esquivando la esquina superior izquierda
// (ahí vive el encabezado de la sección): % del escenario.
const POS = [
  { left: "7%", top: "40%" },
  { left: "44%", top: "14%" },
  { left: "20%", top: "60%" },
  { left: "66%", top: "34%" },
  { left: "50%", top: "64%" },
];

// Ritmo de la escalada (unidades de la timeline; la zona mide ALTO_SVH).
const PASO = 2.0; // separación entre llegadas
const SUBIDA = 1.4; // lo que tarda una card en aterrizar
const CIERRE_TRAS = 1.0; // la card i se cierra este rato después de que aterriza la i+1
// Fin de la coreografía: la última card ya aterrizó y la anterior terminó
// de cerrarse ((n-1)·PASO + SUBIDA·0.7 + CIERRE_TRAS + 0.8). De ahí al final
// de la zona queda un respiro corto y el sticky se suelta.
const FIN = 10.8;
// Antes 640 con el remate del titular (13,3 unidades de timeline); mismo
// ritmo de scroll por unidad (~40svh) para las 11,3 que quedan.
const ALTO_SVH = 560;

// Recorrido del lazo viajero (viewBox 1600x900): entra por arriba, serpentea
// entre las cards y sale por abajo. No se dibuja y queda — VIAJA: la cabeza
// avanza mientras la cola se borra, y al final sale de escena (referencia
// Assistantly). Lo persigue una cápsula corta por detrás. El primer tramo
// entra a la derecha del título (que ocupa hasta ~35% del ancho): antes
// le pasaba por detrás y lo ensuciaba.
const LAZO =
  "M 820 -80 C 780 150 500 260 380 430 C 330 560 420 640 620 560 C 800 490 700 220 860 140 C 1020 60 1200 140 1240 300 C 1280 470 1140 560 980 640 C 820 720 640 780 560 950";
const LAZO_SEG = 0.3; // largo de la serpiente (fracción del recorrido)
const PUNTO_SEG = 0.035; // largo de la cápsula perseguidora
const PUNTO_GAP = 0.05; // aire entre la cola del lazo y la cápsula

export function NivelesEscala() {
  const zoneRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();
  const [live, setLive] = useState(false);

  useIsomorphicLayoutEffect(() => {
    if (reduced) return;
    if (!window.matchMedia("(hover: hover) and (min-width: 768px)").matches) return;
    setLive(true);

    const zone = zoneRef.current;
    const stage = stageRef.current;
    if (!zone || !stage) return;

    const run = () => {
      const limpiadores: Array<() => void> = [];
      const ctx = gsap.context(() => {
        const cards = gsap.utils.toArray<HTMLElement>("[data-nivel-card]");
        const headline = stage.querySelector<HTMLElement>("[data-nivel-headline]");
        const l1 = stage.querySelector<HTMLElement>("[data-nivel-l1]");
        if (cards.length !== NIVELES.length) return;

        // Medir las zonas colapsables y fijarles alto para poder animarlo a 0.
        const colapsables = gsap.utils.toArray<HTMLElement>("[data-collapse]");
        colapsables.forEach((c) => gsap.set(c, { height: c.scrollHeight }));
        gsap.set(cards, { y: 760, autoAlpha: 0 });
        // "Del aula," (con la coma: algo viene) está VISIBLE desde que la
        // sección entra y se va antes de que aterrice la primera card.
        // Estado inicial EXPLÍCITO en cada arranque.
        if (headline) gsap.set(headline, { autoAlpha: 1 });
        if (l1) gsap.set(l1, { autoAlpha: 1, y: 0 });

        const tl = gsap.timeline({
          scrollTrigger: { trigger: zone, start: "top top", end: "bottom bottom", scrub: 0.6 },
        });

        // El lazo viajero + su cápsula: ventana visible que se desliza a lo
        // largo del recorrido vía dashoffset — entra, serpentea entre las
        // cards y SALE (no queda estático de fondo). La cápsula corre con un
        // offset corrido detrás de la cola, siempre sobre el mismo path.
        const lazo = stage.querySelector<SVGPathElement>("[data-nivel-lazo]");
        const punto = stage.querySelector<SVGPathElement>("[data-nivel-punto]");
        const cinta = stage.querySelector<SVGSVGElement>("[data-nivel-cinta]");
        if (lazo && punto) {
          const L = lazo.getTotalLength();
          const seg = L * LAZO_SEG;
          const dot = L * PUNTO_SEG;
          const gap = L * PUNTO_GAP;
          const corrimiento = gap + dot;
          gsap.set(lazo, { strokeDasharray: `${seg} ${L * 2}`, strokeDashoffset: seg });
          gsap.set(punto, {
            strokeDasharray: `${dot} ${L * 2}`,
            strokeDashoffset: seg + corrimiento,
          });
          // Viaja hasta que la cápsula también salió del todo — y termina
          // ANTES del fin de la coreografía (FIN): que la última card no
          // conviva con restos del lazo en escena.
          const final = -(L + corrimiento + L * 0.02);
          const viaje = FIN - 0.2;
          tl.to(lazo, { strokeDashoffset: final, ease: "none", duration: viaje }, 0).to(
            punto,
            { strokeDashoffset: final + corrimiento, ease: "none", duration: viaje },
            0,
          );
          // Seguro definitivo: el tramo de salida por el borde de abajo es
          // largo y la cápsula ronda ahí un rato — el SVG entero se desvanece
          // antes del final, así después de este punto no queda tinta en
          // escena pase lo que pase con la geometría.
          if (cinta) tl.to(cinta, { autoAlpha: 0, ease: "none", duration: 0.6 }, FIN - 0.9);
        }

        // "Del aula," se va (hacia arriba) antes de que "Docentes" aterrice:
        // nunca comparten escena.
        if (l1) tl.to(l1, { autoAlpha: 0, y: -30, ease: "power2.in", duration: 0.4 }, 0.55);

        // Cada nivel LLEGA subiendo desde abajo, se PLANTA abierta y se
        // CIERRA recién cuando la siguiente aterrizó (la última no se cierra:
        // cede abierta con las demás). Al aterrizar suelta un ping.
        cards.forEach((card, i) => {
          const t = i * PASO;
          const icono = card.querySelector("[data-collapse-icon]");
          const cuerpo = card.querySelector("[data-collapse]");
          const ping = card.querySelector("[data-nivel-ping]");
          tl.to(card, { y: 0, autoAlpha: 1, ease: "power2.out", duration: SUBIDA }, t);
          if (i < cards.length - 1) {
            const tc = (i + 1) * PASO + SUBIDA * 0.7 + CIERRE_TRAS;
            if (icono) tl.to(icono, { height: 0, autoAlpha: 0, marginBottom: 0, ease: "power1.inOut", duration: 0.7 }, tc);
            if (cuerpo) tl.to(cuerpo, { height: 0, autoAlpha: 0, marginTop: 0, ease: "power1.inOut", duration: 0.8 }, tc);
          }
          if (ping) {
            tl.fromTo(
              ping,
              { scale: 0.3, autoAlpha: 0.7 },
              { scale: 2.1, autoAlpha: 0, ease: "power1.out", duration: 0.9 },
              t + SUBIDA * 0.7,
            );
          }
        });

        // Click en una card cerrada → se despliega para leerla; otro click la
        // vuelve a cerrar. El estado se infiere del alto real (quien haya
        // movido la card por scroll manda hasta el próximo click).
        cards.forEach((card) => {
          const cuerpo = card.querySelector<HTMLElement>("[data-collapse]");
          const icono = card.querySelector<HTMLElement>("[data-collapse-icon]");
          const mas = card.querySelector<HTMLElement>("[data-nivel-mas]");
          if (!cuerpo || !icono) return;
          const alternar = () => {
            const abierto = cuerpo.offsetHeight > 4;
            gsap.to([cuerpo, icono], {
              height: abierto ? 0 : "auto",
              autoAlpha: abierto ? 0 : 1,
              duration: 0.45,
              ease: "power2.inOut",
              // Un click arriba de otro mata el tween anterior: sin estados
              // colgados a mitad de apertura.
              overwrite: "auto",
            });
            card.setAttribute("aria-expanded", String(!abierto));
            if (mas) mas.style.transform = abierto ? "" : "rotate(45deg)";
          };
          const teclado = (e: KeyboardEvent) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              alternar();
            }
          };
          card.addEventListener("click", alternar);
          card.addEventListener("keydown", teclado);
          limpiadores.push(() => {
            card.removeEventListener("click", alternar);
            card.removeEventListener("keydown", teclado);
          });
        });

        // Respiro corto después de la última card (el scrub termina de
        // asentarse) y la zona se acaba: el sticky se suelta con las cinco
        // cards en escena.
        tl.to({}, { duration: 0.5 }, FIN);
      }, stage);

      return () => {
        limpiadores.forEach((fn) => fn());
        ctx.revert();
      };
    };

    // Los colapsables se miden con la tipografía definitiva.
    let cleanup: (() => void) | undefined;
    if (document.fonts?.ready) document.fonts.ready.then(() => (cleanup = run()));
    else cleanup = run();
    return () => cleanup?.();
  }, [reduced]);

  return (
    <div
      ref={zoneRef}
      // Mismo gris que trae la página desde la torre: con fondo blanco, la
      // cola de Qué hacemos alternaba gris / blanco / blanco / gris y cada
      // cambio era un corte seco (Facundo, 2026-09-03). Las cards son
      // blancas y sobre el gris se leen mejor como piezas.
      className={live ? "bg-gris-fondo relative" : "bg-gris-fondo"}
      style={live ? { height: `${ALTO_SVH}svh` } : undefined}
      aria-label="Niveles en los que intervenimos"
    >
      <div
        ref={stageRef}
        className={
          "overflow-clip " +
          (live ? "sticky top-0 h-[100svh]" : "relative flex min-h-[70svh] flex-col py-24")
        }
      >
        {/* Grilla de puntos §6: textura de base para que el escenario no
            quede pelado entre las cards. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:radial-gradient(circle,color-mix(in_srgb,var(--color-azul-principal)_22%,transparent)_1.1px,transparent_1.6px)] [background-size:22px_22px]"
        />

        {/* Lazo viajero + cápsula perseguidora (solo live, detrás de las cards). */}
        {live && (
          <svg
            data-nivel-cinta
            aria-hidden="true"
            viewBox="0 0 1600 900"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 z-0 h-full w-full"
          >
            <path
              data-nivel-lazo
              d={LAZO}
              fill="none"
              stroke="var(--color-azul-medio)"
              strokeWidth={54}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              style={{ filter: "drop-shadow(0 20px 30px rgb(74 111 165 / 0.25))" }}
            />
            <path
              data-nivel-punto
              d={LAZO}
              fill="none"
              stroke="var(--color-verde-concepto)"
              strokeWidth={54}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        )}

        {/* Encabezado (se queda a la vista toda la sección). */}
        <div
          className={
            live
              ? "absolute inset-x-0 top-0 z-20 mx-auto w-full max-w-screen-xl px-5 pt-24 md:px-10 md:pt-28"
              : "mx-auto w-full max-w-screen-xl px-5 md:px-10"
          }
        >
          {/* Título en display: antes era una etiqueta mono de 11px y la
              sección no tenía ancla hasta el remate (el lazo se llevaba el
              ojo). Lejos de los 5rem del titular final, que sigue ganando. */}
          <h2
            className="font-display text-azul-principal max-w-[16ch] font-extrabold tracking-[-0.02em]"
            style={{ fontSize: "clamp(1.6rem, 1rem + 1.6vw, 2.15rem)", lineHeight: 1.1 }}
          >
            Niveles en los que intervenimos
          </h2>
          <p className="text-gris-texto mt-3 max-w-[38ch] font-sans text-[1rem] leading-relaxed">
            De lo micro a lo macro: cinco niveles donde la transformación se
            sostiene.
          </p>
        </div>

        {/* Titular de apertura: "Del aula," abre la sección y se va antes de
            la primera card. Decorativo (aria-hidden): sin el remate que lo
            completaba es media frase, y la idea entera sigue en el título y
            la bajada de arriba. */}
        {live && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-10 flex items-center"
          >
            {/* <p>, no <h2>: el h2 de la sección es el título de arriba.
                Mismo contenedor y padding que el encabezado: "Del aula,"
                convive con el título al principio y tienen que alinear. */}
            <p
              data-nivel-headline
              className="font-display text-azul-principal mx-auto w-full max-w-screen-xl px-5 font-extrabold tracking-[-0.03em] md:px-10"
              style={{ fontSize: "clamp(2.4rem, 1rem + 5vw, 5rem)", lineHeight: 1.02 }}
            >
              <span data-nivel-l1 className="block">
                Del aula,
              </span>
            </p>
          </div>
        )}

        {/* Los 5 niveles como cards. */}
        <div
          className={
            live
              ? "absolute inset-0 z-10"
              : "mx-auto mt-12 grid w-full max-w-screen-xl grid-cols-1 gap-5 px-5 sm:grid-cols-2 md:px-10"
          }
        >
          {NIVELES.map((niv, i) => (
            <article
              key={niv.k}
              data-nivel-card
              className={
                live
                  ? "absolute w-[clamp(270px,27vw,25rem)] cursor-pointer select-none"
                  : "relative"
              }
              style={live ? POS[i] : undefined}
              {...(live
                ? {
                    role: "button",
                    tabIndex: 0,
                    "aria-expanded": true,
                    "aria-label": `${niv.k}: ver detalle`,
                  }
                : {})}
            >
              {/* Ping al aterrizar: una onda que se expande y se va. */}
              {live && (
                <span
                  data-nivel-ping
                  aria-hidden="true"
                  className="border-verde-concepto/50 pointer-events-none absolute top-1/2 left-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 opacity-0"
                />
              )}
              <div className="border-azul-principal/8 relative rounded-2xl border bg-white p-6 shadow-[0_1px_2px_rgb(31_45_77/0.04),0_24px_50px_-24px_rgb(31_45_77/0.18)]">
                {/* Pista de click: + que rota a × cuando la abrís a mano. */}
                {live && (
                  <span
                    data-nivel-mas
                    aria-hidden="true"
                    className="text-verde-concepto-texto absolute top-4 right-5 font-mono text-[1.15rem] leading-none transition-transform duration-300"
                  >
                    +
                  </span>
                )}
                <div data-collapse-icon className="overflow-hidden">
                  <span className="bg-verde-concepto/10 text-verde-concepto-texto mb-4 flex h-11 w-11 items-center justify-center rounded-xl font-mono text-[0.85rem] font-semibold">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="font-display text-azul-principal text-[1.35rem] leading-tight font-bold">
                  {niv.k}
                </h3>
                <div data-collapse className="overflow-hidden">
                  <p className="text-gris-texto mt-3 font-sans text-[1.05rem] leading-relaxed">
                    {niv.d}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* En fallback el titular va al pie, visible. */}
        {!live && (
          <div className="mx-auto mt-14 w-full max-w-screen-xl px-5 md:px-10">
            <p
              className="font-display text-azul-principal font-extrabold tracking-[-0.03em]"
              style={{ fontSize: "clamp(2rem, 1rem + 4vw, 3.6rem)", lineHeight: 1.05 }}
            >
              Del aula,{" "}
              <span className="text-verde-concepto-texto">al sistema educativo.</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
