"use client";

import Image from "next/image";
import { AREAS } from "@/features/que-hacemos/areas";
import { useSeccionActiva } from "@/lib/hooks/useSeccionActiva";

/**
 * Las siete áreas de especialización de ED, en texto plano y legibles de una.
 *
 * Raquel y Daniela (2026-09-08): la web se veía espectacular pero no se
 * entendía qué hace ED. Esta sección es la respuesta y nada se esconde detrás
 * de una animación. A la izquierda (desktop) un índice que se LLENA a medida
 * que se lee y sirve para saltar; en celular, chips deslizables. El único JS
 * es ese avance: sin él todo se lee igual, marcando la primera área.
 */
/**
 * Clases de un ítem del índice según por dónde va la lectura: el riel se
 * LLENA —verde lo recorrido, gris lo que falta—, así dice cuánto queda y no
 * sólo dónde estás. Va con el borde de CADA ítem y no con una barra de
 * altura en porcentaje: los rótulos no miden todos igual y un porcentaje
 * cortaría a mitad de uno. Fuera del componente para no anidar ternarios en
 * medio del markup.
 */
function clasesDelItem(recorrido: boolean, activo: boolean) {
  const riel = recorrido
    ? "lg:border-verde-concepto"
    : "lg:border-azul-principal/10";
  if (activo) {
    return `${riel} border-azul-principal bg-azul-principal text-white lg:bg-transparent lg:font-semibold lg:text-azul-principal`;
  }
  const base =
    "border-azul-principal/15 text-gris-texto hover:border-azul-principal/40 hover:text-azul-principal";
  return `${riel} ${base} ${recorrido ? "lg:text-azul-principal/55" : ""}`;
}

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

  const rotulo =
    "font-sans text-[0.78rem] font-medium tracking-[0.22em] text-gris-texto uppercase";

  return (
    <section
      id="areas"
      data-indice="Áreas"
      className="text-azul-principal scroll-mt-28 bg-white"
    >
      <div className="mx-auto w-full max-w-[88rem] px-5 py-20 md:px-10 md:py-28">
        {/* El titular y la bajada salieron a pedido del owner (2026-09-09): la
            seccion arranca directo en la primera area. El h2 se queda pero
            invisible, no se borra: es el unico nombre accesible que tiene la
            seccion —el indice de la pagina la lista como «Areas» leyendo su
            data-indice, que no es un encabezado— y sin el, quien navega por
            encabezados pierde el bloque entero. Cuesta cero pixeles. */}
        <h2 className="sr-only">Seis áreas de trabajo</h2>

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
          <div className="lg:sticky lg:top-0 lg:flex lg:h-svh lg:items-center lg:self-start">
            <nav aria-label="Áreas de trabajo" className="lg:w-full">
              <ol className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-3 lg:mx-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:px-0 lg:pb-0">
                {AREAS.map((a, i) => {
                  const activo = i === activa;
                  const recorrido = i <= activa;
                  return (
                    <li key={a.id} className="shrink-0">
                      <a
                        href={`#area-${a.id}`}
                        aria-current={activo ? "true" : undefined}
                        className={`focus-visible:outline-verde-concepto flex items-center gap-3 rounded-full border px-3.5 py-1.5 font-sans text-[0.85rem] transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none lg:rounded-none lg:border-0 lg:border-l-2 lg:px-4 lg:py-2.5 lg:text-[0.95rem] ${clasesDelItem(recorrido, activo)}`}
                      >
                        <span
                          className={`font-mono text-[0.72rem] tabular-nums transition-opacity duration-300 motion-reduce:transition-none ${recorrido ? "opacity-90" : "opacity-50"}`}
                        >
                          0{i + 1}
                        </span>
                        {/* El indice usa el rotulo corto cuando existe; el
                            articulo sigue con el nombre completo del cartel. */}
                        <span>{a.nombreCorto ?? a.nombre}</span>
                      </a>
                    </li>
                  );
                })}
              </ol>
            </nav>
          </div>

          <div className="mt-10 lg:mt-0">
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
                      así se lee primero qué es el área. El min-h es una red y
                      no un relleno: con los bullets en un renglón las siete
                      dan el mismo alto natural, y el piso sólo evita la
                      escalera si mañana un copy crece. */}
                  <div className="bg-gris-fondo mt-8 rounded-[1.25rem] p-6 md:mt-9 md:p-7 lg:min-h-[10.5rem]">
                    <div className="grid gap-8 sm:grid-cols-2">
                      <div>
                        <p className={rotulo}>Qué te llevás</p>
                        <ul className="mt-3 space-y-2">
                          {a.teLlevas.map((t) => (
                            <li
                              key={t}
                              className="flex gap-3 font-sans text-[0.98rem] leading-snug"
                            >
                              <span
                                aria-hidden="true"
                                className="bg-verde-concepto mt-[0.55em] block h-1.5 w-1.5 shrink-0 rounded-full"
                              />
                              <span>{t}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className={rotulo}>Para quién</p>
                        <p className="mt-3 font-sans text-[0.98rem] leading-snug">
                          {a.paraQuien}
                        </p>
                      </div>
                    </div>
                  </div>
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
