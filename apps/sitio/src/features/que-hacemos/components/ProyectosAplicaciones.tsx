"use client";

import { useMemo, useState } from "react";
import type { ProyectosDeQueHacemos } from "@/features/que-hacemos/contenido/proyectos";
import { sinMarcas } from "@/lib/contenido/resaltado";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { EscenarioFichas } from "./proyectos-aplicaciones/EscenarioFichas";
import { FichaProyecto } from "./proyectos-aplicaciones/FichaProyecto";
import { TituloPractica } from "./proyectos-aplicaciones/TituloPractica";
import { Bajada } from "./proyectos-aplicaciones/Bajada";
import { armarCapitulos } from "./proyectos-aplicaciones/fichas";

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
 * más trabajo por ahora). Piezas: los textos llegan por props
 * (`contenido/proyectos.ts` o la base) y se juntan con la estructura del
 * archivo en `proyectos-aplicaciones/fichas.ts`; el resto en
 * `proyectos-aplicaciones/` (escenario, escena, coreografías, cinta,
 * ficha, dibujos).
 */
export function ProyectosAplicaciones({ contenido }: { contenido: ProyectosDeQueHacemos }) {
  const reduced = useReducedMotion();
  const [live, setLive] = useState(false);
  // Memorizado: el escenario rearma su coreografía cuando cambian sus lados.
  const { capitulos, lados, fichas } = useMemo(() => {
    const caps = armarCapitulos(contenido);
    return {
      capitulos: caps,
      // Los dos lados del archivo: el capítulo de desarrollo profesional, y
      // currículo con el remate. El doblez es el de los capítulos (4 + 3 + 1).
      lados: [caps.slice(0, 1), caps.slice(1)] as const,
      // Todas las fichas en orden, con el capítulo al que pertenecen.
      fichas: caps.flatMap((cap, c) => cap.fichas.map((f) => ({ ...f, cap: c }))),
    };
  }, [contenido]);

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
        // En vivo va transparente: el gris lo pone el body y la víbora, en
        // una capa fija por debajo, tiene que verse.
        "text-azul-principal " +
        (live ? "relative" : "bg-gris-fondo scroll-mt-28")
      }
      aria-labelledby="proyectos-titulo"
    >
      {live ? (
        <EscenarioFichas intro={contenido} lados={lados} total={fichas.length} />
      ) : (
        <div className="relative mx-auto w-full max-w-[88rem] px-5 py-20 md:px-10 md:py-28">
          <header className="max-w-[62ch]">
            <p id="proyectos-titulo" className="text-gris-texto font-sans text-[0.78rem] font-medium tracking-[0.22em] uppercase">
              {sinMarcas(contenido.volanta)}
            </p>
            <h2
              className="font-display mt-3 font-bold tracking-[-0.02em] text-balance"
              style={{ fontSize: "2.75rem", lineHeight: 1.1 }}
            >
              <TituloPractica titulo={contenido.titulo} />
            </h2>
          </header>

          <div className="mt-12 space-y-16 md:mt-16">
            {capitulos.map((cap, c) => (
              <div key={cap.id}>
                <h3 className="font-display text-[1.75rem] leading-tight font-extrabold tracking-[-0.02em]">
                  {cap.titulo}
                </h3>
                <Bajada
                  cap={cap}
                  className="text-gris-texto mt-3 max-w-[48ch] font-sans text-[1.05rem] leading-relaxed"
                />
                <div className="mt-8 grid gap-5 sm:grid-cols-2">
                  {fichas.map((f, i) =>
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
