"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AREAS } from "@/features/que-hacemos/areas";

/**
 * Las seis áreas de trabajo de ED, en texto plano y legibles de una.
 *
 * Raquel y Daniela (2026-09-08): la web se veía espectacular pero no se
 * entendía qué hace ED. Esta sección es la respuesta: nada se esconde
 * detrás de una animación. Cada área dice qué es, qué te llevás y para quién
 * es. A la izquierda (en desktop) un índice pegado que se LLENA a medida que
 * se lee —el riel verde cubre lo recorrido, gris lo que falta— y sirve para
 * saltar; en celular es una fila de chips deslizable. El único JS es ese
 * avance, y sin JS todo se lee igual: el índice arranca en la primera área.
 */
/**
 * Clases de un ítem del índice según por dónde va la lectura. El riel se
 * LLENA: el borde izquierdo va verde en todo lo recorrido y gris en lo que
 * falta, así el índice deja de decir solo dónde estás y dice cuánto queda.
 *
 * Va con el borde de cada ítem y no con una barra de altura en porcentaje
 * porque los rótulos no miden todos igual —«Diseño de materiales didácticos»
 * ocupa dos renglones— y un porcentaje sobre el alto total cortaría a mitad
 * de un ítem. Así el llenado cae siempre en el límite exacto.
 *
 * Vive fuera del componente: son tres casos excluyentes y adentro quedaba un
 * ternario anidado en medio del markup.
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

export function AreasQueHacemos() {
  const rootRef = useRef<HTMLElement | null>(null);
  const [activa, setActiva] = useState(0);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !("IntersectionObserver" in window)) return;
    const bloques = Array.from(
      root.querySelectorAll<HTMLElement>("[data-area]"),
    );
    if (!bloques.length) return;
    // El bloque que cruza la franja del medio de la pantalla es el activo.
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const i = Number((e.target as HTMLElement).dataset.area);
          if (!Number.isNaN(i)) setActiva(i);
        }
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 },
    );
    bloques.forEach((b) => io.observe(b));
    return () => io.disconnect();
  }, []);

  const rotulo =
    "font-sans text-[0.78rem] font-medium tracking-[0.22em] text-gris-texto uppercase";

  return (
    <section
      ref={rootRef}
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

        {/* La columna del índice pasó de 16rem a 19rem y el gap de 16 a 12
            (2026-09-09): «Diseño de materiales didácticos» y «Desarrollo
            profesional docente» se partían en dos renglones y estiraban el
            índice a 302px de alto. El rótulo más largo necesita 241px en una
            línea y con 16rem quedaban ~198 útiles. El ancho se saca de los dos
            lados —columna más ancha Y gap más corto— para no comerle 48px de
            una al bloque de texto. */}
        <div className="lg:grid lg:grid-cols-[19rem_minmax(0,1fr)] lg:gap-12">
          {/* Índice: pegado al costado en desktop, chips deslizables en celular.
              CENTRADO EN EL VIEWPORT, no pegado arriba: el mismo eje que el
              índice decorativo del borde derecho (IndicePagina, que es
              fixed top-1/2 -translate-y-1/2), así los dos costados se leen
              simétricos.

              El centrado NO va con -translate-y-1/2 sobre el nav. Un translate
              se aplica después del layout y también mientras el sticky está en
              flujo normal, así que dibujaba el índice 151px más arriba de donde
              ocupa: mientras la sección entraba en pantalla, le pisaba por 87px
              el titular que había arriba (que después salió). En su lugar va
              alto de viewport que se pega arriba y lo centra con flex: la caja
              no puede subir por encima de su celda, así que no hay forma de que
              se escape hacia el header. */}
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
                        className={`focus-visible:outline-verde-concepto flex items-center gap-3 rounded-full border px-3.5 py-1.5 font-sans text-[0.85rem] transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none lg:rounded-none lg:border-0 lg:border-l-2 lg:px-4 lg:py-2.5 lg:text-[0.9rem] ${clasesDelItem(recorrido, activo)}`}
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

                  {/* TERCER NIVEL DE LECTURA. Antes esto venía suelto abajo
                      de la descripción y con el mismo peso, así que el área
                      entera se leía como un solo chorro de texto: titular,
                      idea, párrafo, bullets y otro párrafo, todo parejo. El
                      panel lo separa del bloque de arriba sin esconder nada
                      —la sección existe justamente para que no se esconda—:
                      primero se lee QUÉ es el área, después el detalle.

                      El min-h los empareja: medidos iban de 211 a 254px según
                      cuánto ocupaba cada lista, y seis cajas del mismo color a
                      seis alturas distintas se leen como un error de armado,
                      no como una variación. El piso es el más alto de los
                      seis; a los cortos les sobra aire adentro, que es
                      preferible a la escalera. */}
                  <div className="bg-gris-fondo mt-8 rounded-[1.25rem] p-6 md:mt-9 md:p-7 lg:min-h-[16rem]">
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
