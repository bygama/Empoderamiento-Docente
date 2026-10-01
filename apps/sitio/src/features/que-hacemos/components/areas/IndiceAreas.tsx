import { useEffect, useRef } from "react";
import type { AreaDeQueHacemos } from "@/features/que-hacemos/contenido/areas";
import { fragmentos } from "@/lib/contenido/resaltado";
import { idDeArea } from "./anclas";
import { alClicIrAlArea } from "./ir-al-area";

/**
 * Clases de un ítem del índice según por dónde va la lectura: el riel se
 * LLENA —verde lo recorrido, gris lo que falta—, así dice cuánto queda y no
 * sólo dónde estás. Va con el borde de CADA ítem y no con una barra de
 * altura en porcentaje: los rótulos no miden todos igual y un porcentaje
 * cortaría a mitad de uno. Fuera del componente para no anidar ternarios en
 * medio del markup. Bajo lg el mismo relleno va en el borde del chip.
 */
function clasesDelItem(recorrido: boolean, activo: boolean) {
  const riel = recorrido
    ? "max-lg:border-verde-concepto/60 lg:border-verde-concepto"
    : "border-azul-principal/15 lg:border-azul-principal/10";
  if (activo) {
    return "border-azul-principal bg-azul-principal text-white lg:border-verde-concepto lg:bg-transparent lg:font-semibold lg:text-azul-principal";
  }
  const base = "text-gris-texto hover:border-azul-principal/40 hover:text-azul-principal";
  return `${riel} ${base} ${recorrido ? "max-lg:text-azul-principal/80 lg:text-azul-principal/55" : ""}`;
}

/**
 * El título y el índice de las áreas: al costado en desktop. En celular y
 * tablet el índice es una FRANJA PEGADA arriba mientras dura la sección:
 * los siete chips en un riel, el abierto relleno de azul, los ya leídos con
 * el borde verde. La franja arranca en `top: 0` con el alto del header como
 * padding, así el logo y el menú flotan sobre blanco y no sobre la foto o
 * el texto que pasa por debajo (Gastón, 2026-09-29). Tocar un chip abre esa
 * área y la deja justo debajo de la franja (`onElegir`). Los `data-areas-*`
 * son los que mueve la coreografía del aterrizaje de escritorio
 * (coreografia-titulo.ts); sin ella todo se ve en su lugar.
 * El `nav` se nombra con el título (`aria-labelledby`): si alguien lo
 * edita, el nombre lo sigue.
 */
export function IndiceAreas({
  activa,
  titulo,
  areas,
  onElegir,
}: {
  activa: number;
  titulo: string;
  areas: readonly AreaDeQueHacemos[];
  onElegir?: (i: number) => void;
}) {
  const rielRef = useRef<HTMLOListElement | null>(null);

  // El riel se corre solo para acercar el chip activo al centro, moviendo
  // SOLO el riel (nunca la página); el snap por proximidad lo acomoda al
  // borde de un chip. En escritorio el índice es una columna sin scroll y
  // esto no hace nada. Se mide por rectángulos y no por offsetLeft: el
  // offsetParent del chip depende de qué ancestro esté posicionado.
  useEffect(() => {
    const riel = rielRef.current;
    if (!riel || riel.scrollWidth <= riel.clientWidth) return;
    const chip = riel.querySelector<HTMLElement>("[aria-current]");
    if (!chip) return;
    const suave = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const r = riel.getBoundingClientRect();
    const c = chip.getBoundingClientRect();
    const izquierda = c.left - r.left + riel.scrollLeft - (r.width - c.width) / 2;
    riel.scrollTo({ left: Math.max(0, izquierda), behavior: suave ? "smooth" : "auto" });
  }, [activa]);

  return (
    // La FRANJA: bajo lg el título y el índice van juntos, pegados en top 0
    // con el alto del header de padding (el piso del logo y el menú); a lo
    // ancho sale de los márgenes del contenedor (-mx) y los repone adentro
    // (px). En escritorio no existe (`contents`): título e índice quedan en
    // la columna del costado como siempre.
    <div
      data-areas-banda
      className="max-lg:sticky max-lg:top-0 max-lg:z-20 max-lg:-mx-5 max-lg:border-b max-lg:border-azul-principal/10 max-lg:bg-white/95 max-lg:px-5 max-lg:pt-[4.75rem] max-lg:pb-2 max-lg:backdrop-blur-md md:max-lg:-mx-10 md:max-lg:px-10 lg:contents"
    >
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
          grande en el centro y se encoge hasta acá (el mismo elemento).
          Bajo lg vive en la franja pegada, en un renglón (si alguien lo
          alarga desde el admin, se corta con puntos suspensivos en vez de
          correr la página de costado); en las pantallas
          más angostas baja un punto para no invadir el margen, y en un
          celular apaisado (alto ≤ 480px) se esconde: ahí la franja con el
          título dejaba menos de la mitad de la pantalla para leer. */}
      <h2
        id="areas-titulo"
        data-areas-titulo
        className="text-gris-texto font-display text-[1.35rem] font-semibold tracking-[-0.01em] text-balance max-lg:text-azul-principal max-lg:text-[1.6rem] max-lg:font-extrabold max-lg:tracking-[-0.025em] max-lg:truncate max-[340px]:text-[1.4rem]! [@media(max-height:480px)_and_(max-width:63.999rem)]:sr-only! lg:text-[1.5rem]"
        style={{ lineHeight: 1.2 }}
      >
        {fragmentos(titulo).map((f) =>
          f.resaltado ? (
            <span key={f.texto} className="text-azul-medio">
              {f.texto}
            </span>
          ) : (
            f.texto
          ),
        )}
      </h2>
      <nav aria-labelledby="areas-titulo" className="mt-5 max-lg:mt-3 lg:mt-6 lg:w-full">
        <ol
          ref={rielRef}
          className="scrollbar-none -mx-5 flex gap-2 overflow-x-auto px-5 pb-3 max-lg:snap-x max-lg:snap-proximity max-lg:scroll-px-5 max-lg:pb-2 md:max-lg:-mx-10 md:max-lg:scroll-px-10 md:max-lg:px-10 lg:relative lg:mx-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:px-0 lg:pb-0"
        >
          {/* El riel que se dibuja de un trazo mientras el título aterriza,
              debajo de los bordes de los ítems (que lo pintan de verde o
              gris al aparecer). Solo desktop, que es donde hay riel. */}
          <span
            aria-hidden="true"
            data-areas-riel
            className="bg-azul-principal/10 pointer-events-none absolute inset-y-0 left-0 hidden w-0.5 lg:block"
          />
          {areas.map((a, i) => {
            const activo = i === activa;
            const recorrido = i <= activa;
            return (
              <li key={idDeArea(i)} data-areas-item className="shrink-0 max-lg:snap-start">
                <a
                  href={`#${idDeArea(i)}`}
                  aria-current={activo ? "true" : undefined}
                  // Bajo lg el chip abre el área y la acomoda bajo la
                  // franja; en escritorio corta hasta ella. El ancla del
                  // href queda para sin JS y para otra pestaña.
                  onClick={alClicIrAlArea(i, onElegir)}
                  className={`focus-visible:outline-verde-concepto flex items-center gap-3 rounded-full border px-3.5 py-1.5 font-sans text-[0.85rem] transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none max-lg:min-h-11 max-lg:px-4 lg:rounded-none lg:border-0 lg:border-l-2 lg:px-4 lg:py-2.5 lg:text-[0.95rem] ${clasesDelItem(recorrido, activo)}`}
                >
                  <span
                    className={`font-mono text-[0.72rem] tabular-nums transition-opacity duration-300 motion-reduce:transition-none ${recorrido ? "opacity-90" : "opacity-50"}`}
                  >
                    0{i + 1}
                  </span>
                  {/* El índice usa el nombre corto; el artículo sigue con
                      el nombre completo del cartel. */}
                  <span>{a.nombreCorto}</span>
                </a>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
