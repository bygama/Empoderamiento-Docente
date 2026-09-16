"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { AREAS } from "@/features/que-hacemos/areas";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { useSeccionActiva } from "@/lib/hooks/useSeccionActiva";
import { IndiceAreas } from "./areas/IndiceAreas";
import { PanelArea } from "./areas/PanelArea";
import { crearAterrizaje } from "./areas/coreografia-titulo";

/**
 * Las siete áreas de especialización de ED, en texto plano y legibles de una.
 *
 * Raquel y Daniela (2026-09-08): la web se veía espectacular pero no se
 * entendía qué hace ED. Esta sección es la respuesta y nada se esconde detrás
 * de una animación. A la izquierda (desktop) un índice que se LLENA a medida
 * que se lee y sirve para saltar; en celular, chips deslizables. El único JS
 * es ese avance: sin él todo se lee igual, marcando la primera área.
 */
/** Los ids de las anclas, en el orden de la página. */
const IDS_AREAS = AREAS.map((a) => `area-${a.id}`);

export function AreasQueHacemos() {
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
              <IndiceAreas activa={activa} />
            </div>
          </div>

          {/* La columna que se pinnea durante el aterrizaje del título y sube
              entera cuando aterrizó (ver coreografia-titulo.ts: por qué esta
              y no la sección). El aire de arriba (desktop) es para que, al
              soltarse el pin, el Área 01 no quede pegada al borde de la
              pantalla, debajo del navbar (el usuario, 2026-09-16): la columna
              se clava al ras y el primer artículo aterriza esos 8rem más
              abajo. */}
          <div data-areas-articulos className="mt-10 lg:mt-0 lg:pt-32">
            {AREAS.map((a, i) => (
              <article
                key={a.id}
                id={`area-${a.id}`}
                data-area={i}
                // Dos columnas recién desde XL, y en PROPORCIONES.
                //
                // No desde lg: a 1024px el índice ya se lleva 19rem, así que
                // al artículo le quedan 592. Partirlos ahí dejaba el texto en
                // 177px con la foto en un ancho fijo de 22rem, o en 313 con la
                // foto convertida en una tira de 216x743 —la imagen destrozada
                // por el recorte—. Entre 1024 y 1279 el artículo va en una
                // columna: texto ancho y la foto abajo, en 16/9.
                //
                // Y en proporciones, no con la foto en un ancho fijo: así las
                // dos ceden a la vez cuando la ventana se angosta.
                className="border-azul-principal/10 scroll-mt-28 border-t py-12 first:border-t-0 first:pt-0 md:py-16 xl:grid xl:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] xl:gap-12"
              >
                <div>
                  <p className="font-mono text-[0.78rem] tracking-[0.18em] text-gris-texto uppercase">
                    Área 0{i + 1}
                  </p>
                  <h3
                    className="font-display mt-3 text-[1.7rem] font-bold tracking-[-0.02em] md:text-[2.2rem]"
                    style={{ lineHeight: 1.12 }}
                  >
                    {a.nombre}
                  </h3>
                  <p className="text-verde-concepto-texto font-display mt-3 text-[1.1rem] font-semibold md:text-[1.25rem]">
                    {a.idea}
                  </p>
                  <p className="text-azul-principal/85 mt-5 max-w-[62ch] font-sans text-[1.02rem] leading-relaxed md:text-[1.1rem]">
                    {a.queEs}
                  </p>

                  {/* TERCER NIVEL DE LECTURA: el panel separa el detalle sin
                      esconder nada —la sección existe para que no se esconda—,
                      así se lee primero qué es el área. */}
                  <PanelArea area={a} />
                </div>

                <div className="mt-8 xl:mt-0 xl:h-full">
                  <div className="relative aspect-[16/9] overflow-hidden rounded-[1.5rem] xl:aspect-auto xl:h-full">
                    <Image
                      src={a.foto}
                      alt={a.alt}
                      fill
                      sizes="(min-width: 1280px) 30vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
