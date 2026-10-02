"use client";

import { useMemo, useState } from "react";
import type { ProyectosDeQueHacemos } from "@/features/que-hacemos/contenido/proyectos";
import { sinMarcas } from "@/lib/contenido/resaltado";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { EscenarioFichas } from "./proyectos-aplicaciones/EscenarioFichas";
import { PilaFichasMovil } from "./proyectos-aplicaciones/PilaFichasMovil";
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
 * cierre. Antes era una sola pila con todas: a la quinta ficha cansaba, y
 * la víbora dejaba huérfanas a las de la segunda mitad. Y antes de esto,
 * dos zonas clavadas con una costura donde la víbora nacía cortada.
 *
 * Tres modos: en escritorio con mouse, este archivo de dos lados; en
 * celular y tablet (< lg), la misma pila en vertical (PilaFichasMovil,
 * Gastón 2026-09-26); con movimiento reducido o sin JS, las fichas en
 * grilla. Piezas: los textos llegan por props (`contenido/proyectos.ts` o la
 * base) y se juntan con la estructura del archivo en
 * `proyectos-aplicaciones/fichas.ts`; el resto en `proyectos-aplicaciones/`
 * (escenarios, escena, coreografías, cinta, ficha, dibujos).
 */
export function ProyectosAplicaciones({ contenido }: { contenido: ProyectosDeQueHacemos }) {
  const reduced = useReducedMotion();
  const [modo, setModo] = useState<"grilla" | "vivo" | "movil">("grilla");
  const live = modo === "vivo";
  // Memorizado: el escenario rearma su coreografía cuando cambian sus lados.
  const { capitulos, lados, fichas } = useMemo(() => {
    const caps = armarCapitulos(contenido);
    return {
      capitulos: caps,
      // Los dos lados del archivo: el capítulo de desarrollo profesional, y
      // currículo con el remate. El doblez es el de los capítulos (4 + 2 + 1).
      lados: [caps.slice(0, 1), caps.slice(1)] as const,
      // Todas las fichas en orden, con el capítulo al que pertenecen.
      fichas: caps.flatMap((cap, c) => cap.fichas.map((f) => ({ ...f, cap: c }))),
    };
  }, [contenido]);

  // El modo se decide entero cada vez: la preferencia de movimiento reducido
  // llega después de hidratar, y si solo se salía temprano quedaba prendido
  // el modo animado que se había elegido antes.
  useIsomorphicLayoutEffect(() => {
    if (reduced) setModo("grilla");
    else if (window.matchMedia("(hover: hover) and (min-width: 1024px)").matches) setModo("vivo");
    // La pila en celular pide alto: con menos de 620px la ficha no entra
    // entera debajo del capítulo, y ahí quedan las fichas en columna.
    else if (window.matchMedia("(max-width: 63.999rem) and (min-height: 38.75rem)").matches) setModo("movil");
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
      {live && <EscenarioFichas intro={contenido} lados={lados} total={fichas.length} />}
      {modo === "movil" && <PilaFichasMovil intro={contenido} capitulos={capitulos} fichas={fichas} />}
      {modo === "grilla" && (
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
                {/* Una columna con mínimo cero, como las dos de sm: sin eso la
                    pista toma el ancho mínimo de la ficha, y la de siete
                    banderas corría la página de costado en un celular. */}
                <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
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
