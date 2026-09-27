"use client";

import { useRef } from "react";
import gsap from "gsap";
import type { AreasDeQueHacemos } from "@/features/que-hacemos/contenido/areas";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { useSeccionActiva } from "@/lib/hooks/useSeccionActiva";
import { ANCLAS_DE_AREAS, idDeArea } from "./areas/anclas";
import { ArticuloArea } from "./areas/ArticuloArea";
import { IndiceAreas } from "./areas/IndiceAreas";
import { crearAterrizaje } from "./areas/coreografia-titulo";
import { useDesplegableAreas } from "./areas/useDesplegableAreas";

/**
 * Las siete áreas de especialización de ED, en texto plano y legibles de una.
 *
 * Raquel y Daniela (2026-09-08): la web se veía espectacular pero no se
 * entendía qué hace ED. Esta sección es la respuesta y nada se esconde detrás
 * de una animación. A la izquierda (desktop) un índice que se LLENA a medida
 * que se lee y sirve para saltar. En celular y tablet, DESPLEGABLES, uno
 * abierto por vez (areas/ArticuloArea.tsx): la lista de las siete se ve de
 * una y cada una se abre entera (Gastón, 2026-09-26; antes eran siete
 * artículos seguidos, unas ocho pantallas). Sin JS, en celular se ve la
 * lista de nombres; en escritorio, todo. Los
 * textos y las fotos llegan por props (features/que-hacemos/contenido/areas.ts
 * o la base); las anclas son estructura (areas/anclas.ts).
 */
/** Los ids de las anclas, en el orden de la página. */
const IDS_AREAS = ANCLAS_DE_AREAS.map((_, i) => idDeArea(i));

export function AreasQueHacemos({ contenido }: { contenido: AreasDeQueHacemos }) {
  // Misma regla que el índice del borde derecho y que el navbar: la última
  // sección cuya cima ya pasó el 40% de la pantalla. Reusar el hook no es solo
  // ahorrar código —los tres índices marcan siempre lo mismo, que es para lo
  // que existe— y encima saca de acá un IntersectionObserver propio que fallaba
  // de dos maneras: se quedaba con la última entrada de la tanda (con el área 3
  // cruzando la franja marcaba la 2) y, si el scroll se frenaba sin que nada
  // entrara ni saliera de esa franja angosta, no volvía a disparar y el índice
  // quedaba atrasado (medido en la séptima área).
  //
  // Antes de la primera, el hook devuelve null: ahí el índice arranca marcando
  // la primera, que es lo que se ve sin JS.
  const activaId = useSeccionActiva(IDS_AREAS);
  const activa = Math.max(0, IDS_AREAS.indexOf(activaId ?? ""));

  const zonaRef = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();
  const { abierta, alternar } = useDesplegableAreas(IDS_AREAS);

  // El aterrizaje del título (areas/coreografia-titulo.ts): solo en desktop,
  // donde el índice va al costado; en celular y con reduced motion el título
  // está en su lugar desde el SSR y no hay nada que mover.
  useIsomorphicLayoutEffect(() => {
    if (reduced) return;
    if (!window.matchMedia("(hover: hover) and (min-width: 1024px)").matches) return;
    const zona = zonaRef.current;
    if (!zona) return;
    const q = <T extends HTMLElement>(sel: string) => Array.from(zona.querySelectorAll<T>(sel));
    const uno = <T extends HTMLElement>(sel: string) => zona.querySelector<T>(sel);
    const titulo = uno("[data-areas-titulo]");
    const celda = uno("[data-areas-celda]");
    const caja = uno("[data-areas-caja]");
    const articulos = uno("[data-areas-articulos]");
    const riel = uno("[data-areas-riel]");
    if (!titulo || !celda || !caja || !articulos || !riel) return;

    const ctx = gsap.context(() => {
      crearAterrizaje({
        titulo,
        celda,
        caja,
        articulos,
        piezas: q("[data-area]"),
        riel,
        items: q("[data-areas-item]"),
      });
    }, zona);
    return () => ctx.revert();
  }, [reduced]);

  return (
    // z-30: «Cómo trabajamos» (z-20, por su relevo con el faro) termina con
    // la pila de cards trabada mientras su banda de aliados sube por encima,
    // y esta sección viene pegada detrás de la banda: tiene que pintar por
    // encima de esa pila para taparla al subir, y para eso es `relative` y
    // le gana en z. El fondo blanco es el que tapa.
    <section
      ref={zonaRef}
      id="areas"
      data-indice="Áreas"
      // Desde el navbar se aterriza al final del pin, con el título ya en su
      // lugar (ver irASeccion): llegar al borde de arriba es caer en la puerta.
      data-aterrizaje="fin"
      className="text-azul-principal relative z-30 scroll-mt-28 bg-white"
    >
      <div className="mx-auto w-full max-w-[88rem] px-5 py-20 md:px-10 md:py-28">
        {/* 16rem alcanza porque el índice usa el rótulo corto de areas.ts:
            con el nombre completo el más largo pedía 241px y se partía. */}
        <div className="lg:grid lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-16">
          {/* Índice: al costado en desktop, chips deslizables en celular, y
              CENTRADO en el viewport, el mismo eje que el índice del borde
              derecho. El centrado va con una caja de alto de viewport que se
              pega arriba y lo centra con flex, NO con -translate-y-1/2: un
              translate se aplica después del layout, también mientras el
              sticky está en flujo normal, y llegó a pisar por 87px lo que
              había arriba. La caja no puede salirse de su celda. */}
          {/* La celda es estática y la caja de adentro es la sticky: la
              coreografía mide la posición natural del título con la celda
              (que no se mueve) y no con la caja (que sí). */}
          <div data-areas-celda>
            <div
              data-areas-caja
              className="lg:sticky lg:top-0 lg:flex lg:h-svh lg:flex-col lg:justify-center"
            >
              <IndiceAreas activa={activa} titulo={contenido.titulo} areas={contenido.areas} />
            </div>
          </div>

          {/* La columna que se pinnea durante el aterrizaje del título y sube
              entera cuando aterrizó (ver coreografia-titulo.ts: por qué esta
              y no la sección). El aire de arriba (desktop) es para que, al
              soltarse el pin, el Área 01 no quede pegada al borde de la
              pantalla, debajo del navbar (el usuario, 2026-09-16): la columna
              se clava al ras y el primer artículo aterriza esos 8rem más
              abajo. */}
          <div data-areas-articulos className="border-azul-principal/10 mt-10 max-lg:mt-7 max-lg:border-t lg:mt-0 lg:pt-32">
            {contenido.areas.map((a, i) => (
              <ArticuloArea
                key={IDS_AREAS[i]}
                id={IDS_AREAS[i]}
                area={a}
                rotulos={contenido.rotulos}
                i={i}
                abierta={abierta === i}
                alternar={alternar}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
