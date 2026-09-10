"use client";

import { useState } from "react";
import {
  CAPITULOS,
  FICHAS,
  PROYECTOS_INTRO,
} from "@/features/que-hacemos/proyectos";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { EscenarioFichas } from "./proyectos-aplicaciones/EscenarioFichas";
import { FichaProyecto } from "./proyectos-aplicaciones/FichaProyecto";
import { TituloPractica } from "./proyectos-aplicaciones/TituloPractica";

// Los dos lados del archivo: el capítulo de desarrollo profesional, y
// currículo con el remate. El doblez es el de los capítulos (4 + 3 + 1).
const LADOS = [CAPITULOS.slice(0, 1), CAPITULOS.slice(1)] as const;

/**
 * «Así se ve en la práctica»: la prueba de Qué hacemos, como un ARCHIVO DE
 * FICHAS (sitemap §6; Gastón, 2026-09-09, sobre la referencia de
 * assistantly.com), en un solo escenario clavado con DOS LADOS espejados
 * (2026-09-10): de un lado queda fijo el título del capítulo; del otro las
 * fichas caen una por una sobre una pila y las anteriores se hunden atrás,
 * como hojas apoyadas. A mitad del archivo, el giro: el lado se da vuelta.
 * Cada ficha dice UNA cosa —el número, el nombre, una frase— para que se
 * lea entera. Es el mismo lenguaje de los expedientes de Investigación:
 * allá casos, acá proyectos. Detrás, la víbora de Niveles sigue por un
 * único trazo: cruza en solitario con la cámara siguiéndola, repta bajo
 * las fichas, sube y vuelve a bajar en el giro, y se va por abajo hacia el
 * cierre. Antes era una sola pila de ocho: a la quinta ficha cansaba, y la
 * víbora dejaba cuatro huérfanas. Y antes de esto, dos zonas clavadas con
 * una costura donde la víbora nacía cortada.
 *
 * Solo desktop con mouse y con motion (celular: fallback estático, sin
 * más trabajo por ahora). Piezas: datos en `proyectos.ts`; el resto en
 * `proyectos-aplicaciones/` (escenario, escena, coreografías, cinta,
 * ficha, dibujos).
 */
export function ProyectosAplicaciones() {
  const reduced = useReducedMotion();
  const [live, setLive] = useState(false);

  useIsomorphicLayoutEffect(() => {
    if (reduced) return;
    if (!window.matchMedia("(hover: hover) and (min-width: 1024px)").matches)
      return;
    setLive(true);
  }, [reduced]);

  return (
    <section
      id="proyectos"
      data-indice="Proyectos"
      className={
        "bg-gris-fondo text-azul-principal " +
        (live ? "relative" : "scroll-mt-28")
      }
      aria-label="Proyectos y aplicaciones"
    >
      {live ? (
        <EscenarioFichas lados={LADOS} total={FICHAS.length} />
      ) : (
        <div className="relative mx-auto w-full max-w-[88rem] px-5 py-20 md:px-10 md:py-28">
          <header className="max-w-[62ch]">
            <p className="text-gris-texto font-sans text-[0.78rem] font-medium tracking-[0.22em] uppercase">
              {PROYECTOS_INTRO.volanta}
            </p>
            <h2
              className="font-display mt-3 font-bold tracking-[-0.02em] text-balance"
              style={{ fontSize: "2.75rem", lineHeight: 1.1 }}
            >
              <TituloPractica />
            </h2>
          </header>

          <div className="mt-12 space-y-16 md:mt-16">
            {CAPITULOS.map((cap, c) => (
              <div key={cap.id}>
                <h3 className="font-display text-[1.75rem] leading-tight font-extrabold tracking-[-0.02em]">
                  {cap.titulo}
                </h3>
                <p className="text-gris-texto mt-3 max-w-[48ch] font-sans text-[1.05rem] leading-relaxed">
                  {cap.bajada}
                </p>
                <div className="mt-8 grid gap-5 sm:grid-cols-2">
                  {FICHAS.map((f, i) =>
                    f.cap === c ? (
                      <FichaProyecto
                        key={f.id}
                        ficha={f}
                        n={i + 1}
                        live={false}
                      />
                    ) : null,
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
