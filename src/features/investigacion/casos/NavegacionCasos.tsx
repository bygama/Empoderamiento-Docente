"use client";

import type { CasoInvestigacion } from "./data";
import { ROTULO_MICRO } from "./tintes";
import { ArrowRight } from "@/components/ui/icons";

type Props = {
  visible: boolean;
  casos: readonly CasoInvestigacion[];
  indiceActivo: number;
  /** false durante transiciones. */
  interactiva: boolean;
  onVolver: () => void;
  onIr: (indice: number) => void;
};

/**
 * Navegación persistente del LUGAR (el expediente a pantalla completa):
 * UNA fila — salida a la izquierda, posición en el medio, avance a la
 * derecha — con la forma de píldora que ya usa el overlay del equipo
 * (`TeamProfileOverlay`), porque el problema es el mismo: una capa a
 * pantalla completa necesita su escape siempre a la vista sin comerse la
 * lectura. La anticipación del próximo caso NO se imprime: ya vive en la
 * banda del final del expediente, acá viaja en el `title`. El selector
 * numérico solo existe por debajo de `lg`, donde no hay pestañas
 * laterales. Oculto, el módulo queda `inert` + aria-hidden: sin tab-stops
 * ni anuncios fantasma. En el último caso «Siguiente» desaparece y la
 * píldora se encoge hasta la salida sola: la cápsula ya la dibuja como
 * botón, no hace falta que se ponga un borde propio.
 */
export function NavegacionCasos({
  visible,
  casos,
  indiceActivo,
  interactiva,
  onVolver,
  onIr,
}: Props) {
  const siguiente =
    indiceActivo < casos.length - 1 ? casos[indiceActivo + 1] : null;

  return (
    <div
      inert={!visible}
      aria-hidden={!visible}
      className={`fixed right-0 bottom-0 left-0 z-[60] transition-all duration-300 md:right-8 md:bottom-8 md:left-auto ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      {/* El resguardo de safe-area vive DENTRO del fondo blanco: si algún
          día se habilita viewport-fit=cover no queda franja transparente. */}
      <div className="border-azul-principal/15 border-t bg-white/95 px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_-18px_rgb(31_45_77/0.35)] backdrop-blur-sm md:rounded-full md:border md:bg-white/80 md:p-1.5 md:shadow-[0_18px_44px_-20px_rgb(31_45_77/0.4)]">
        <div className="flex items-center justify-between gap-1 sm:gap-1.5 md:gap-2">
          <button
            type="button"
            onClick={() => interactiva && onVolver()}
            aria-label="Volver al archivo"
            title="Volver al archivo (Esc)"
            className={`text-azul-principal hover:bg-gris-fondo hover:text-verde-concepto focus-visible:outline-verde-concepto inline-flex min-h-11 items-center gap-1.5 rounded-full px-2.5 ${ROTULO_MICRO} font-semibold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 sm:px-3 md:px-4`}
          >
            <span aria-hidden="true">←</span> VOLVER
          </button>

          {/* Selector compacto: reemplaza a las pestañas laterales, que
              recién aparecen en lg. */}
          <ol
            className="flex items-center gap-0.5 lg:hidden"
            aria-label="Ir a un caso"
          >
            {casos.map((caso, i) => (
              <li key={caso.id}>
                <button
                  type="button"
                  aria-label={`Caso ${caso.numero}: ${caso.pregunta}`}
                  aria-current={i === indiceActivo ? "true" : undefined}
                  onClick={() => interactiva && i !== indiceActivo && onIr(i)}
                  className={`focus-visible:outline-verde-concepto min-h-11 min-w-9 rounded-full font-mono text-[0.75rem] transition-colors focus-visible:outline-2 sm:min-w-10 ${
                    i === indiceActivo
                      ? "bg-azul-principal text-white"
                      : "text-gris-texto hover:text-azul-principal"
                  }`}
                >
                  {caso.numero}
                </button>
              </li>
            ))}
          </ol>

          {siguiente && (
            <button
              type="button"
              onClick={() => interactiva && onIr(indiceActivo + 1)}
              aria-label={`Siguiente caso: ${siguiente.numero}`}
              title={`Sigue — caso ${siguiente.numero}: ${siguiente.pregunta}`}
              className="group bg-naranja-accion-texto hover:bg-naranja-accion-texto/90 focus-visible:outline-naranja-accion-texto inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full px-3 font-sans text-[0.95rem] font-semibold whitespace-nowrap text-white transition-all hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 sm:px-4"
            >
              {/* bg naranja-accion-texto (#b35a15): blanco sobre naranja-accion
                  da 3.0:1 y este cuerpo no califica como texto grande. */}
              <span className="hidden sm:inline">Siguiente caso</span>
              <ArrowRight
                size={17}
                className="transition-transform motion-safe:group-hover:translate-x-0.5"
              />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
