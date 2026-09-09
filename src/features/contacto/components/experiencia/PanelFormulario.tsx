import type { FormEvent } from "react";
import { ArrowRight, ArrowUpRight } from "@/components/ui/icons";
import { MAILTO_CV, type Tema } from "./data";
import { RailTema } from "./RailTema";
import { CamposContacto } from "./CamposContacto";

type Props = {
  activo: boolean;
  temaActivo: Tema | undefined;
  temaIdx: number;
  onCambiar: () => void;
  onEnviar: (e: FormEvent<HTMLFormElement>) => void;
};

/**
 * 2 · FORMULARIO — breadcrumb de vuelta, el rail navy y el panel de campos
 * como UNA sola pieza, y la segunda puerta (sumarse al equipo) al pie.
 */
export function PanelFormulario({ activo, temaActivo, temaIdx, onCambiar, onEnviar }: Props) {
  return (
    <div
      data-panel="formulario"
      aria-hidden={!activo}
      inert={!activo}
      className="absolute inset-x-5 top-0 bottom-0 flex overflow-y-auto pt-24 pb-24 opacity-0 md:inset-x-10 md:pt-28 md:pb-28 [@media(max-height:860px)_and_(min-height:761px)]:md:pb-10 [@media(max-height:760px)]:md:pb-6"
    >
      {/* my-auto (y no justify-center en el padre): si el contenido no
          entra, se scrollea desde arriba sin que el tope quede recortado
          bajo el navbar */}
      <div className="mx-auto my-auto w-full max-w-5xl">
        {/* Breadcrumb de vuelta, FUERA del contenedor (sobre el borde
            superior): navegación clara para volver a elegir el tema, más
            identificable que el link que vivía dentro del rail. */}
        <button
          type="button"
          data-campo
          onClick={onCambiar}
          className="group text-gris-texto hover:text-verde-concepto mb-3 inline-flex items-center gap-1.5 font-mono text-[0.7rem] font-medium tracking-[0.14em] uppercase transition-colors"
        >
          <ArrowRight
            size={14}
            aria-hidden="true"
            className="rotate-180 transition-transform group-hover:-translate-x-0.5"
          />
          Volver a los temas
        </button>
        {/* UNA sola pieza: el rail navy y el panel claro de campos son el
            MISMO contenedor (sin gap). El panel claro "sale" del navy: no
            tiene borde a la izquierda (el navy es su borde) y sí en los
            otros tres lados. En mobile la fusión es vertical (navy arriba,
            panel abajo, sin borde superior). */}
        <form
          onSubmit={onEnviar}
          className="w-full lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-stretch"
        >
          <RailTema temaActivo={temaActivo} temaIdx={temaIdx} />
          <CamposContacto />
        </form>

        {/* Segunda puerta (sumarse al equipo): FUERA del contenedor,
            debajo y CENTRADA bajo la columna de campos — alineada justo
            debajo del botón "Enviar consulta". Reusa la misma grilla
            2fr/3fr del form para caer en el centro de la columna derecha. */}
        <div className="mt-4 lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <div data-campo className="flex justify-center lg:col-start-2">
            <a
              href={MAILTO_CV}
              className="group text-gris-texto hover:text-azul-principal inline-flex items-center gap-1.5 font-sans text-[0.85rem] transition-colors"
            >
              ¿Querés estar de este lado?{" "}
              <span className="text-azul-principal group-hover:text-verde-concepto font-medium transition-colors">
                Sumate al equipo
              </span>
              <ArrowUpRight
                size={13}
                className="text-verde-concepto transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
