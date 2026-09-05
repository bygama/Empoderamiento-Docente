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
 * Siempre hay UNA card abierta y quieta. Y cada cierre pasa SOLO, en el
 * hueco entre dos llegadas: si se superpone con la card que entra, el ojo
 * se va con la que entra y el cierre no se ve (ver CIERRE_INICIO).
 *
 * En vivo la sección es encabezado + cards y nada más: el cierre de la
 * quinta es lo último que se ve, y el sticky se suelta con los cinco
 * títulos en escena. Hubo dos piezas de titular que ya no están. El remate
 * ("Del aula, / al sistema educativo." en pantalla propia, con las cards
 * cediendo) se sacó (Facundo, 2026-09-03): era una pantalla más que
 * scrollear después de la coreografía, y la animación tiene que ser lo
 * último. La apertura ("Del aula," solo, con la coma en suspenso) se sacó
 * (Mateo, 2026-09-05): sin el remate que la completaba quedaba media frase
 * colgada. La frase entera sigue viva en el fallback sin motion.
 *
 * La timeline arranca ENTRADA_SVH de scroll ANTES de que el escenario se
 * clave, así el lazo ya viene entrando cuando la sección se traba (Mateo,
 * 2026-09-05). Las cards NO se corrieron: siguen arrancando con el
 * escenario ya clavado — por eso todo lo que no es el lazo va desplazado
 * ENTRADA unidades.
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
const CIERRE_TRAS = 0.45; // la card i se cierra este rato después de que aterriza la i+1
const CIERRE = 0.45; // lo que tarda el cierre (el ícono va un toque más rápido)
// CADA CIERRE TIENE QUE PASAR SOLO, ENTRE DOS LLEGADAS. Medido con
// CIERRE_TRAS 1.0 y cierres de 0.8, la card i se cerraba en
// (i+1)·PASO + 1.98 → +2.78 y la i+2 arrancaba a subir en (i+1)·PASO + 2.0:
// el cierre transcurría casi entero por debajo de la llegada siguiente y no
// se veía cuál card se había cerrado (Mateo, 2026-09-05: «el 3 no se cierra
// en orden» — el orden estaba bien, lo que faltaba era poder verlo). Ahora
// el cierre va de +1.43 a +1.88, o sea después de que la i+1 aterriza
// (+SUBIDA = 1.4) y antes de que la i+2 arranque (+PASO = 2.0).
// Al tocar PASO, SUBIDA, CIERRE_TRAS o CIERRE hay que rehacer esta cuenta.
const CIERRE_INICIO = SUBIDA * 0.7 + CIERRE_TRAS;
// Fin de la coreografía: se cerró la última card, que es la quinta y no
// tiene ninguna atrás esperando (n·PASO + CIERRE_INICIO + CIERRE = 11,88).
// De ahí al final de la zona queda un respiro corto y el sticky se suelta.
const FIN = 11.9;
// Antes 640 con el remate del titular (13,3 unidades de timeline), 560 con
// cierres largos (11,3) y 520 sin el cierre de la quinta (10,4). Se sostiene
// el mismo ritmo de scroll por unidad (~40svh) para las 12,4 que quedan.
const ALTO_SVH = 600;

// Cuánto scroll corre la timeline ANTES de que el escenario se clave. El
// sticky se traba cuando el tope de la zona toca el tope del viewport, así
// que basta con arrancar el ScrollTrigger a `top ENTRADA_SVH%`.
// Apenas un anticipo: con 30 el lazo entraba de más y se comía el arranque
// (Mateo, 2026-09-05).
const ENTRADA_SVH = 10;
// Unidades de timeline que se consumen con el escenario ya clavado: la zona
// clava durante (ALTO_SVH - 100)svh, que es exactamente el tramo del
// ScrollTrigger sin la entrada.
const CUERPO = FIN + 0.5;
// La entrada vale lo mismo por unidad de scroll que el resto: así el ritmo
// no cambia al cruzar el momento en que se clava.
const ENTRADA = (CUERPO * ENTRADA_SVH) / (ALTO_SVH - 100);

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
        if (cards.length !== NIVELES.length) return;

        // Medir las zonas colapsables y fijarles alto para poder animarlo a 0.
        const colapsables = gsap.utils.toArray<HTMLElement>("[data-collapse]");
        colapsables.forEach((c) => gsap.set(c, { height: c.scrollHeight }));
        gsap.set(cards, { y: 760, autoAlpha: 0 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: zone,
            // Empieza ENTRADA_SVH antes de que el sticky se trabe.
            start: `top ${ENTRADA_SVH}%`,
            end: "bottom bottom",
            scrub: 0.6,
          },
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
          // conviva con restos del lazo en escena. Arranca en 0, o sea
          // ANTES de que el escenario se clave: es lo único que se mueve
          // durante la entrada.
          const final = -(L + corrimiento + L * 0.02);
          const viaje = ENTRADA + FIN - 0.2;
          tl.to(lazo, { strokeDashoffset: final, ease: "none", duration: viaje }, 0).to(
            punto,
            { strokeDashoffset: final + corrimiento, ease: "none", duration: viaje },
            0,
          );
          // Seguro definitivo: el tramo de salida por el borde de abajo es
          // largo y la cápsula ronda ahí un rato — el SVG entero se desvanece
          // antes del final, así después de este punto no queda tinta en
          // escena pase lo que pase con la geometría. Termina justo cuando
          // arranca el último cierre (FIN es el fin de ese cierre, de ahí el
          // -CIERRE): el remate de la sección se ve sin lazo encima.
          if (cinta)
            tl.to(
              cinta,
              { autoAlpha: 0, ease: "none", duration: 0.6 },
              ENTRADA + FIN - CIERRE - 0.6,
            );
        }

        // Cada nivel LLEGA subiendo desde abajo, se PLANTA abierta y se
        // CIERRA recién cuando la siguiente aterrizó. Al aterrizar suelta un
        // ping. LAS CINCO se cierran, la última incluida (Mateo, 2026-09-05):
        // antes cedía abierta y el patrón quedaba cortado a medias. Como no
        // tiene una card que la siga, la fórmula le da el turno que le
        // tocaría a la sexta, así conserva exactamente el mismo rato abierta
        // y sola que tuvieron las otras cuatro.
        cards.forEach((card, i) => {
          const t = ENTRADA + i * PASO;
          const icono = card.querySelector("[data-collapse-icon]");
          const cuerpo = card.querySelector("[data-collapse]");
          const ping = card.querySelector("[data-nivel-ping]");
          tl.to(card, { y: 0, autoAlpha: 1, ease: "power2.out", duration: SUBIDA }, t);
          {
            const tc = ENTRADA + (i + 1) * PASO + CIERRE_INICIO;
            if (icono)
              tl.to(
                icono,
                { height: 0, autoAlpha: 0, marginBottom: 0, ease: "power1.inOut", duration: CIERRE * 0.9 },
                tc,
              );
            if (cuerpo)
              tl.to(
                cuerpo,
                { height: 0, autoAlpha: 0, marginTop: 0, ease: "power1.inOut", duration: CIERRE },
                tc,
              );
          }
          if (ping) {
            tl.fromTo(
              ping,
              { scale: 0.3, autoAlpha: 0.7 },
              // Dura exactamente hasta que arranca el cierre de la card
              // anterior (por eso CIERRE_TRAS y no un número suelto): la
              // onda es el remate de ESTA llegada y se apaga antes de que
              // el ojo tenga que irse al cierre de la otra.
              { scale: 2.1, autoAlpha: 0, ease: "power1.out", duration: CIERRE_TRAS },
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
        tl.to({}, { duration: 0.5 }, ENTRADA + FIN);
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
