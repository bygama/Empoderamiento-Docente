import { useId, type ReactNode } from "react";
import { ChevronDown } from "@/components/ui/icons";

type Props = {
  label: string;
  opciones: readonly string[];
  valor: string | null;
  onChange: (valor: string | null) => void;
} & (
  | { fijo?: false; abierto: boolean; onAlternar: () => void }
  | { fijo: true; abierto?: undefined; onAlternar?: undefined }
);

/**
 * Un grupo de filtros del catálogo. Por defecto (`fijo` sin pasar, o
 * `false`) es un desplegable: la cabecera nombra el grupo y, cerrado,
 * muestra lo elegido; abierto, deja ver sus píldoras. La columna
 * (`FiltrosCatalogo`) decide cuál está abierto: uno a la vez, así la
 * columna nunca se estira más que la pantalla y se lee de un vistazo qué
 * filtros hay puestos sin abrir ninguno.
 *
 * Con `fijo`, el grupo va siempre expandido y su cabecera es un `<p>` (no
 * un botón): lo usa `HojaFiltros` en el catálogo móvil, donde los tres
 * grupos se muestran de una en un modal con scroll propio y no hay nada que
 * alternar — un botón con `aria-expanded` fijo y sin acción real sería un
 * control muerto.
 *
 * El contenido no anima su alto (regla del proyecto: solo transform y
 * opacity): aparece con un fundido corto que baja 4px (`filtros-abre` en
 * globals.css), que con reduced-motion no corre.
 */
export function FiltroGrupo({
  label,
  opciones,
  valor,
  onChange,
  abierto,
  onAlternar,
  fijo = false,
}: Props) {
  const id = useId();
  return (
    <div className="border-azul-principal/10 border-b">
      {fijo ? (
        <p
          id={`${id}-cabecera`}
          className="text-gris-texto flex min-h-12 w-full items-center py-3 font-mono text-[0.7rem] tracking-[0.12em] uppercase"
        >
          {label}
        </p>
      ) : (
        <button
          type="button"
          id={`${id}-cabecera`}
          aria-expanded={abierto}
          aria-controls={`${id}-opciones`}
          onClick={onAlternar}
          className="group flex min-h-12 w-full items-center justify-between gap-3 py-3 text-left"
        >
          <span className="text-gris-texto group-hover:text-azul-principal font-mono text-[0.7rem] tracking-[0.12em] uppercase transition-colors">
            {label}
          </span>
          <span className="flex min-w-0 items-center gap-2">
            {/* Cerrado, lo elegido queda a la vista: no hace falta abrir el
                grupo para saber qué filtro está puesto. */}
            {valor !== null && !abierto && (
              <span className="bg-azul-principal truncate rounded-md px-2 py-0.5 font-sans text-[0.72rem] font-medium text-white">
                {valor}
              </span>
            )}
            <ChevronDown
              size={16}
              className={`text-azul-principal/60 shrink-0 transition-transform duration-300 ${abierto ? "rotate-180" : ""}`}
            />
          </span>
        </button>
      )}
      <div
        id={`${id}-opciones`}
        role="group"
        aria-labelledby={`${id}-cabecera`}
        hidden={!fijo && !abierto}
        className="flex flex-wrap gap-2 pb-5 motion-safe:animate-[filtros-abre_0.28s_ease-out]"
      >
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
    </div>
  );
}

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
      className={`rounded-lg border px-3 py-1.5 font-sans text-[0.82rem] font-medium transition-colors max-lg:min-h-11 max-lg:px-4 ${
        activa
          ? "border-azul-principal bg-azul-principal text-white"
          : "border-azul-principal/15 text-azul-principal hover:bg-azul-claro/30 bg-white"
      }`}
    >
      {children}
    </button>
  );
}
