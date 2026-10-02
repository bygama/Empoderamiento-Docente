import { useEffect, useRef, useState } from "react";
import { Search } from "@/components/ui/icons";
import { PUBLICOS, TIPOS } from "@/features/biblioteca/contenido/modelo";
import { vigilarDesborde } from "./columna-desborda";
import { ESTILO_DE_TIPO } from "@/features/biblioteca/components/portada/estilo-de-tipo";
import { FiltroGrupo } from "./FiltroGrupo";
import type { Filtros } from "./filtros";

// Los tres grupos, en orden. Arranca abierto el de tipo, que es el que trae
// el submenú del navbar (`?tipo=`).
const GRUPO_TIPO = "Tipo de material";
const GRUPO_PUBLICO = "Público";
const GRUPO_ANIO = "Año";

/**
 * La columna de filtros del catálogo: buscador arriba y los grupos de
 * píldoras (tipo, público, año), sticky en desktop. Los grupos son
 * desplegables, uno abierto a la vez, y cerrados muestran lo elegido
 * (`FiltroGrupo.tsx`, pedido de Gastón). El tema NO tiene grupo
 * propio: el sidebar tiene que entrar completo en un viewport de laptop
 * (~800px) y era el grupo más alto; sigue como chip en cada fila y la
 * búsqueda lo matchea. El estado vive en el listado, y los años salen de los
 * materiales que tiene.
 */
export function FiltrosCatalogo({
  anios,
  busqueda,
  filtros,
  hayFiltros,
  onBuscar,
  onCambiar,
  onLimpiar,
}: {
  anios: readonly number[];
  busqueda: string;
  filtros: Filtros;
  hayFiltros: boolean;
  onBuscar: (valor: string) => void;
  onCambiar: (parcial: Partial<Filtros>) => void;
  onLimpiar: () => void;
}) {
  const columnaRef = useRef<HTMLElement | null>(null);
  const [grupoAbierto, setGrupoAbierto] = useState<string | null>(GRUPO_TIPO);
  const alternar = (grupo: string) => () =>
    setGrupoAbierto((abierto) => (abierto === grupo ? null : grupo));
  // La columna toma la rueda solo cuando no entra en la pantalla.
  useEffect(() => {
    const columna = columnaRef.current;
    if (!columna) return;
    return vigilarDesborde(columna);
  }, []);

  return (
    // Mide unos 712px: fijo a 7rem del borde, en cualquier notebook el grupo
    // «Año» quedaba debajo de la pantalla y, por ser sticky, no había forma de
    // llegar. Ahora nunca pasa del alto disponible y, si no entra, se recorre
    // adentro suyo (la rueda scrollea la columna y no la página, solo cuando
    // desborda: columna-desborda.ts). El fundido de abajo avisa que sigue; cae
    // sobre el `pb-6`, así que cuando todo entra no tapa nada. El margen
    // negativo es para que el recorte no se coma los anillos de foco.
    <aside
      ref={columnaRef}
      aria-label="Buscador y filtros del catálogo"
      className="max-lg:hidden lg:sticky lg:top-28 lg:-mx-2 lg:-mt-1 lg:max-h-[calc(100svh-8.5rem)] lg:self-start lg:overflow-y-auto lg:px-2 lg:data-[desborda]:overscroll-contain lg:pt-1 lg:pb-6 lg:[mask-image:linear-gradient(to_bottom,black_calc(100%-1.5rem),transparent)] lg:[scrollbar-width:thin]"
    >
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-display text-h3 text-azul-principal font-bold tracking-[-0.01em]">
          Filtros
        </h2>
        {hayFiltros && (
          <button
            type="button"
            onClick={onLimpiar}
            className="text-gris-texto hover:text-azul-principal font-sans text-[0.83rem] underline underline-offset-4 transition-colors"
          >
            Limpiar todo
          </button>
        )}
      </div>

      <div className="border-azul-principal/15 focus-within:border-azul-medio focus-within:ring-azul-claro/60 mt-5 flex items-center gap-2.5 rounded-lg border bg-white px-3.5 transition-colors focus-within:ring-2">
        <span className="text-gris-texto shrink-0">
          <Search size={18} />
        </span>
        <label htmlFor="materiales-buscar" className="sr-only">
          Buscar en el catálogo
        </label>
        <input
          id="materiales-buscar"
          type="search"
          value={busqueda}
          onChange={(e) => onBuscar(e.target.value)}
          placeholder="Buscá por título, tema o autora…"
          className="text-azul-principal placeholder:text-gris-texto h-11 min-w-0 flex-1 bg-transparent font-sans text-[0.95rem] outline-none"
        />
      </div>

      <div className="border-azul-principal/10 mt-6 border-t">
        <FiltroGrupo
          label={GRUPO_TIPO}
          opciones={TIPOS}
          valor={filtros.tipo}
          onChange={(tipo) => onCambiar({ tipo })} estilos={ESTILO_DE_TIPO}
          abierto={grupoAbierto === GRUPO_TIPO}
          onAlternar={alternar(GRUPO_TIPO)}
        />
        <FiltroGrupo
          label={GRUPO_PUBLICO}
          opciones={PUBLICOS}
          valor={filtros.publico}
          onChange={(publico) => onCambiar({ publico })}
          abierto={grupoAbierto === GRUPO_PUBLICO}
          onAlternar={alternar(GRUPO_PUBLICO)}
        />
        <FiltroGrupo
          label={GRUPO_ANIO}
          opciones={anios.map(String)}
          valor={filtros.anio === null ? null : String(filtros.anio)}
          onChange={(anio) =>
            onCambiar({ anio: anio === null ? null : Number(anio) })
          }
          abierto={grupoAbierto === GRUPO_ANIO}
          onAlternar={alternar(GRUPO_ANIO)}
        />
      </div>
    </aside>
  );
}
