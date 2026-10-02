"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { MovimientoDeNovedades } from "@/features/novedades/contenido/movimiento";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { crearMovimiento } from "./coreografia-movimiento";
import { altoMovilLvh, crearMovimientoMovil } from "./ed-en-movimiento/coreografia-movil";
import { Momento } from "./ed-en-movimiento/Momento";

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
 * Bajo lg con alto suficiente, PROFUNDIDAD EN ETAPAS
 * (ed-en-movimiento/coreografia-movil.ts); sin motion o en pantallas bajas,
 * mosaico quieto con las frases listadas. El modo arranca en «quieto»
 * (coincide con SSR) y se decide entero al montar y en cada cambio de
 * pantalla. La coreografía vive en
 * coreografia-movimiento.ts; los momentos llegan por props (de
 * `features/novedades/contenido/movimiento.ts` o de la base).
 */

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

export function EdEnMovimiento({ contenido }: { contenido: MovimientoDeNovedades }) {
  const { momentos } = contenido;
  const zoneRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const counterRef = useRef<HTMLSpanElement | null>(null);
  const reduced = useReducedMotion();
  const [modo, setModo] = useState<"quieto" | "vivo" | "movil">("quieto");

  useIsomorphicLayoutEffect(() => {
    if (reduced) {
      setModo("quieto");
      return;
    }
    // Dolly solo con puntero fino y viewport con aire suficiente; la escena
    // de celular pide alto.
    const vivo = window.matchMedia("(hover: hover) and (min-width: 768px)");
    const movil = window.matchMedia("(max-width: 63.999rem) and (min-height: 38.75rem)");
    const decidir = () => {
      if (vivo.matches) setModo("vivo");
      else if (movil.matches) setModo("movil");
      else setModo("quieto");
    };
    decidir();
    vivo.addEventListener("change", decidir);
    movil.addEventListener("change", decidir);
    return () => {
      vivo.removeEventListener("change", decidir);
      movil.removeEventListener("change", decidir);
    };
  }, [reduced]);

  const live = modo === "vivo";
  const movil = modo === "movil";

  useIsomorphicLayoutEffect(() => {
    if (!live) return;
    const zone = zoneRef.current;
    const stage = stageRef.current;
    if (!zone || !stage) return;
    return crearMovimiento({ zone, stage, contador: () => counterRef.current, total: momentos.length });
  }, [live, momentos.length]);

  useIsomorphicLayoutEffect(() => {
    if (!movil) return;
    const zone = zoneRef.current;
    const stage = stageRef.current;
    if (!zone || !stage) return;
    return crearMovimientoMovil(zone, stage, counterRef.current);
  }, [movil]);

  return (
    <div
      ref={zoneRef}
      id="ed-en-movimiento"
      data-indice="ED en movimiento"
      data-modo={modo}
      className={"relative bg-azul-principal " + (live ? "h-[560svh]" : "")}
      style={movil ? { height: `${altoMovilLvh(momentos.length)}lvh` } : undefined}
      aria-label="ED en movimiento"
    >
      <div
        ref={stageRef}
        className={
          "bg-grain-dark relative isolate overflow-hidden text-white " +
          (live
            ? "sticky top-[var(--visor-arriba,0px)] flex h-[100svh] flex-col"
            : movil
              ? "sticky top-[var(--visor-arriba,0px)] flex h-lvh flex-col"
              : "flex min-h-[70svh] flex-col py-24")
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
            oculto a lectores de pantalla y solo en modo live o móvil. */}
        {(live || movil) && (
          <p
            aria-hidden="true"
            className="pointer-events-none absolute bottom-8 left-5 z-20 font-mono text-[0.68rem] tracking-[0.16em] text-azul-claro/80 md:left-10"
          >
            <span ref={counterRef}>01</span>
            <span className="text-white/35"> / {String(momentos.length).padStart(2, "0")}</span>
          </p>
        )}

        {/* Frases al centro: overlay que crossfadea en modo live. Se renderizan
            siempre (así el efecto las encuentra); en estático quedan invisibles
            —son un floreo, no contenido esencial—. */}
        <div className="pointer-events-none absolute inset-x-0 top-[38%] z-20 flex flex-col items-center gap-2 px-6 text-center [[data-modo=movil]_&]:top-[14%]">
          {momentos.map((m) => (
            <p
              key={m.etiqueta}
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
              : movil
                ? "mx-auto mt-auto grid w-full max-w-screen-xl grid-cols-2 gap-3 px-5 pb-16 md:grid-cols-3 md:px-10"
                : "mx-auto mt-10 grid w-full max-w-screen-xl grid-cols-2 gap-4 px-5 md:grid-cols-3 md:px-10"
          }
        >
          {momentos.map((m) => (
            <Momento key={m.etiqueta} m={m} live={live} />
          ))}
        </div>

        {/* Quieto (movimiento reducido o pantalla baja): las frases no se
            ven como floreo, así que van listadas debajo del mosaico. */}
        {!live && !movil && (
          <ul data-mov-lista className="mx-auto mt-8 w-full max-w-screen-xl px-5 lg:hidden">
            {momentos.map((m) => (
              <li key={m.etiqueta} className="font-display border-t border-white/10 py-3 text-[1.15rem] font-bold tracking-[-0.01em] text-white">
                {conAcento(m.frase, m.acento)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
