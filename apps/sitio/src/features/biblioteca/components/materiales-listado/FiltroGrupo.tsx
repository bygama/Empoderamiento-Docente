import { useId, type ReactNode } from "react";
import { ChevronDown } from "@/components/ui/icons";
import type { EstiloDeTipo } from "@/features/biblioteca/components/portada/estilo-de-tipo";

type Props = {
  label: string;
  opciones: readonly string[];
  valor: string | null;
  onChange: (valor: string | null) => void;
  abierto: boolean;
  onAlternar: () => void;
  /**
   * El color y el ícono de cada opción, si los tiene: el grupo de tipos lleva
   * los mismos que la portada y el chip de cada fila (`portada/estilo-de-tipo.ts`).
   */
  estilos?: Readonly<Record<string, EstiloDeTipo>>;
};

/** El borde de un fondo claro, que sobre el blanco se perdería. */
const BORDE_CLARO = "ring-azul-principal/15 ring-1 ring-inset";

/**
 * Un grupo de filtros del catálogo, desplegable: la cabecera nombra el grupo
 * y, cerrado, muestra lo elegido; abierto, deja ver sus píldoras. Quien lo
 * usa (`FiltrosCatalogo` en escritorio, `HojaFiltros` en celular y tablet)
 * decide cuál está abierto: uno a la vez, así nunca se estira más que la
 * pantalla y se lee de un vistazo qué filtros hay puestos sin abrir ninguno.
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
  estilos,
}: Props) {
  const id = useId();
  return (
    <div className="border-azul-principal/10 border-b">
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
          {valor !== null && !abierto && <Elegido valor={valor} estilo={estilos?.[valor]} />}
          <ChevronDown
            size={16}
            className={`text-azul-principal/60 shrink-0 transition-transform duration-300 ${abierto ? "rotate-180" : ""}`}
          />
        </span>
      </button>
      <div
        id={`${id}-opciones`}
        role="group"
        aria-labelledby={`${id}-cabecera`}
        hidden={!abierto}
        className="flex flex-wrap gap-2 pb-5 motion-safe:animate-[filtros-abre_0.28s_ease-out]"
      >
        <Pildora activa={valor === null} onClick={() => onChange(null)}>
          Todos
        </Pildora>
        {opciones.map((opcion) => (
          <Pildora
            key={opcion}
            activa={valor === opcion}
            estilo={estilos?.[opcion]}
            onClick={() => onChange(valor === opcion ? null : opcion)}
          >
            {opcion}
          </Pildora>
        ))}
      </div>
    </div>
  );
}

/** Lo elegido, en la cabecera del grupo cerrado: con el color de su tipo, si lo tiene. */
function Elegido({ valor, estilo }: { valor: string; estilo?: EstiloDeTipo }) {
  const color = estilo ? `${estilo.fondo} ${estilo.borde ? BORDE_CLARO : ""}` : "bg-azul-principal text-white";
  return (
    <span className={`relative truncate overflow-hidden rounded-md px-2 py-0.5 font-sans text-[0.72rem] font-medium ${color}`}>
      {estilo?.velo ? <span aria-hidden="true" className={`absolute inset-0 ${estilo.velo}`} /> : null}
      <span className="relative">{valor}</span>
    </span>
  );
}

const PILDORA = "rounded-lg border px-3 py-1.5 font-sans text-[0.82rem] font-medium transition-colors max-lg:min-h-11 max-lg:px-4";
const SIN_ELEGIR = "border-azul-principal/15 text-azul-principal hover:bg-azul-claro/30 bg-white";

type PildoraProps = {
  activa: boolean;
  onClick: () => void;
  children: ReactNode;
};

function Pildora({ activa, estilo, onClick, children }: PildoraProps & { estilo?: EstiloDeTipo }) {
  if (estilo) {
    return (
      <PildoraDeTipo activa={activa} estilo={estilo} onClick={onClick}>
        {children}
      </PildoraDeTipo>
    );
  }
  return (
    <button
      type="button"
      aria-pressed={activa}
      onClick={onClick}
      className={`${PILDORA} ${activa ? "border-azul-principal bg-azul-principal text-white" : SIN_ELEGIR}`}
    >
      {children}
    </button>
  );
}

/**
 * La píldora de un tipo de material: sin elegir, blanca con una muestra de su
 * color y su ícono; elegida, toda de su color. El color nunca va solo: lo
 * acompañan el ícono y el nombre.
 */
function PildoraDeTipo({ activa, estilo, onClick, children }: PildoraProps & { estilo: EstiloDeTipo }) {
  const { Icon, fondo, velo, acento, borde } = estilo;
  const color = `${fondo} ${borde ? BORDE_CLARO : ""}`;
  return (
    <button
      type="button"
      aria-pressed={activa}
      onClick={onClick}
      className={`${PILDORA} relative inline-flex items-center gap-2 overflow-hidden pl-2 max-lg:pl-2.5 ${activa ? `border-transparent ${color}` : SIN_ELEGIR}`}
    >
      {activa && velo ? <span aria-hidden="true" className={`absolute inset-0 ${velo}`} /> : null}
      <span className={`relative flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-md ${activa ? "" : color}`}>
        {!activa && velo ? <span aria-hidden="true" className={`absolute inset-0 ${velo}`} /> : null}
        <Icon size={14} className={`relative ${acento}`} />
      </span>
      <span className="relative">{children}</span>
    </button>
  );
}
