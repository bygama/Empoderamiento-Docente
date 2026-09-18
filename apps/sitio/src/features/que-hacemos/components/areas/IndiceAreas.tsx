import { AREAS } from "@/features/que-hacemos/data/areas";

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

/**
 * El título y el índice de las áreas: al costado en desktop, chips
 * deslizables en celular. Los `data-areas-*` son los que mueve la
 * coreografía del aterrizaje (coreografia-titulo.ts); sin ella todo se ve
 * en su lugar.
 */
export function IndiceAreas({ activa }: { activa: number }) {
  return (
    <>
      {/* El titular volvió el 2026-09-11 (el usuario: «falta el título a
          la izquierda antes de las áreas»). El owner lo había sacado con
          la bajada el 2026-09-09 y quedaba un h2 invisible, que además
          seguía diciendo «seis» cuando ya son siete. Va en la columna
          del índice, trabado con él, como RÓTULO de la lista y no como
          título de sección: en la escala del índice y en el gris
          secundario, para no competir con los h3 de las áreas (a 2rem y
          trabado competía; en flujo arriba de la grilla, al usuario le
          quedaba mal). «especialización» en azul-medio (el usuario:
          celeste, no resaltada): azul-claro, el celeste del sistema,
          sobre blanco da 1,8:1 y no pasa; azul-medio sí (5,1:1). La
          bajada no vuelve. Desde el 2026-09-16 además ATERRIZA: entra
          grande en el centro y se encoge hasta acá (el mismo elemento). */}
      <h2
        data-areas-titulo
        className="text-gris-texto font-display text-[1.35rem] font-semibold tracking-[-0.01em] text-balance lg:text-[1.5rem]"
        style={{ lineHeight: 1.2 }}
      >
        Áreas de <span className="text-azul-medio">especialización</span>
      </h2>
      <nav aria-label="Áreas de especialización" className="mt-5 lg:mt-6 lg:w-full">
        <ol className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-3 lg:relative lg:mx-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:px-0 lg:pb-0">
          {/* El riel que se dibuja de un trazo mientras el título aterriza,
              debajo de los bordes de los ítems (que lo pintan de verde o
              gris al aparecer). Solo desktop, que es donde hay riel. */}
          <span
            aria-hidden="true"
            data-areas-riel
            className="bg-azul-principal/10 pointer-events-none absolute inset-y-0 left-0 hidden w-0.5 lg:block"
          />
          {AREAS.map((a, i) => {
            const activo = i === activa;
            const recorrido = i <= activa;
            return (
              <li key={a.id} data-areas-item className="shrink-0">
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
    </>
  );
}
