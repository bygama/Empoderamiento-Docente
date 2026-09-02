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
 * pila vertical fija abajo a la derecha — anticipación del próximo caso en
 * rótulo mono, CTA naranja grande para avanzar y «← VOLVER AL ARCHIVO»
 * debajo. La anticipación vive FUERA del botón naranja (blanco sobre
 * naranja no alcanza AA en texto chico). Oculto, el módulo queda `inert` +
 * aria-hidden: sin tab-stops ni anuncios fantasma. En pantallas chicas se
 * conserva la barra inferior con selector compacto (fase mobile diferida).
 * En el último caso, «Volver» gana jerarquía y «Siguiente» desaparece.
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
      <div className="border-azul-principal/10 border-t bg-white/95 px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_-18px_rgb(31_45_77/0.35)] backdrop-blur-sm md:rounded-2xl md:border md:px-4 md:py-4 md:pb-4 md:shadow-[0_18px_44px_-20px_rgb(31_45_77/0.4)]">
        {siguiente && (
          <p className={`text-gris-texto mb-3 hidden px-1 md:block ${ROTULO_MICRO}`}>
            SIGUE — CASO {siguiente.numero} · {siguiente.eje.toUpperCase()}
          </p>
        )}
        <div className="flex items-center justify-between gap-2 md:flex-col md:items-stretch md:gap-2.5">
          {siguiente && (
            <button
              type="button"
              onClick={() => interactiva && onIr(indiceActivo + 1)}
              className="group bg-naranja-accion-texto hover:bg-naranja-accion-texto/90 focus-visible:outline-naranja-accion-texto order-2 inline-flex min-h-11 items-center gap-2 rounded-xl px-3.5 py-2.5 font-sans text-[1rem] font-semibold whitespace-nowrap text-white transition-all hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 sm:px-5 md:order-1 md:min-h-13 md:justify-between md:px-6 md:text-[1.05rem]"
            >
              {/* bg naranja-accion-texto (#b35a15): blanco sobre naranja-accion
                  da 3.0:1 y 16px semibold no califica como texto grande. */}
              Siguiente<span className="hidden sm:inline"> caso</span>
              <ArrowRight
                size={17}
                className="transition-transform motion-safe:group-hover:translate-x-0.5"
              />
            </button>
          )}

          <button
            type="button"
            onClick={() => interactiva && onVolver()}
            title="Volver al archivo (Esc)"
            className={`text-azul-principal hover:bg-gris-fondo focus-visible:outline-verde-concepto order-1 inline-flex min-h-11 items-center gap-2 rounded-xl ${ROTULO_MICRO} font-semibold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 md:order-2 md:min-h-12 md:justify-center ${
              siguiente ? "px-3" : "border-azul-principal/60 border px-5"
            }`}
          >
            <span aria-hidden="true">←</span> VOLVER AL ARCHIVO
          </button>

          {/* Selector compacto (reemplaza pestañas laterales en pantallas chicas) */}
          <ol
            className="order-3 flex items-center gap-1 lg:hidden"
            aria-label="Ir a un caso"
          >
            {casos.map((caso, i) => (
              <li key={caso.id}>
                <button
                  type="button"
                  aria-label={`Caso ${caso.numero}: ${caso.pregunta}`}
                  aria-current={i === indiceActivo ? "true" : undefined}
                  onClick={() => interactiva && i !== indiceActivo && onIr(i)}
                  className={`focus-visible:outline-verde-concepto min-h-11 min-w-10 rounded-lg font-mono text-[0.78rem] transition-colors focus-visible:outline-2 sm:min-w-11 ${
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
        </div>
      </div>
    </div>
  );
}
