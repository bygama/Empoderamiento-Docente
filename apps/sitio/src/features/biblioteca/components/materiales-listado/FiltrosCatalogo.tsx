import type { ReactNode } from "react";
import { Search } from "@/components/ui/icons";
import { ANIOS, PUBLICOS, TIPOS } from "@/features/biblioteca/data/materiales";
import type { Filtros } from "./filtros";

function Pildora({
  activa,
  onClick,
  children,
}: {
  activa: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={activa}
      onClick={onClick}
      className={`rounded-lg border px-3 py-1.5 font-sans text-[0.82rem] font-medium transition-colors ${
        activa
          ? "border-azul-principal bg-azul-principal text-white"
          : "border-azul-principal/15 text-azul-principal hover:bg-azul-claro/30 bg-white"
      }`}
    >
      {children}
    </button>
  );
}

/**
 * Grupo de filtros de un solo valor: "Todos" + una píldora por opción.
 * Tocar la opción activa la destilda (vuelve a "Todos").
 */
function FiltroGrupo({
  label,
  opciones,
  valor,
  onChange,
}: {
  label: string;
  opciones: readonly string[];
  valor: string | null;
  onChange: (valor: string | null) => void;
}) {
  return (
    <fieldset className="mt-8">
      <legend className="text-gris-texto font-mono text-[0.7rem] tracking-[0.12em] uppercase">
        {label}
      </legend>
      <div className="mt-3 flex flex-wrap gap-2">
        <Pildora activa={valor === null} onClick={() => onChange(null)}>
          Todos
        </Pildora>
        {opciones.map((opcion) => (
          <Pildora
            key={opcion}
            activa={valor === opcion}
            onClick={() => onChange(valor === opcion ? null : opcion)}
          >
            {opcion}
          </Pildora>
        ))}
      </div>
    </fieldset>
  );
}

/**
 * La columna de filtros del catálogo: buscador arriba y los grupos de
 * píldoras (tipo, público, año), sticky en desktop. El tema NO tiene grupo
 * propio: el sidebar tiene que entrar completo en un viewport de laptop
 * (~800px) y era el grupo más alto; sigue como chip en cada fila y la
 * búsqueda lo matchea. El estado vive en el listado.
 */
export function FiltrosCatalogo({
  busqueda,
  filtros,
  hayFiltros,
  onBuscar,
  onCambiar,
  onLimpiar,
}: {
  busqueda: string;
  filtros: Filtros;
  hayFiltros: boolean;
  onBuscar: (valor: string) => void;
  onCambiar: (parcial: Partial<Filtros>) => void;
  onLimpiar: () => void;
}) {
  return (
    <aside
      aria-label="Buscador y filtros del catálogo"
      className="lg:sticky lg:top-28 lg:self-start"
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

      <FiltroGrupo
        label="Tipo de material"
        opciones={TIPOS}
        valor={filtros.tipo}
        onChange={(tipo) => onCambiar({ tipo })}
      />
      <FiltroGrupo
        label="Público"
        opciones={PUBLICOS}
        valor={filtros.publico}
        onChange={(publico) => onCambiar({ publico })}
      />
      <FiltroGrupo
        label="Año"
        opciones={ANIOS.map(String)}
        valor={filtros.anio === null ? null : String(filtros.anio)}
        onChange={(anio) =>
          onCambiar({ anio: anio === null ? null : Number(anio) })
        }
      />
    </aside>
  );
}
