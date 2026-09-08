import type { CasoInvestigacion } from "../data";
import { ROTULO_MICRO, ROTULO_TAB, TINTES } from "../tintes";
import { Pestana } from "../Garabatos";
import { ArrowRight } from "@/components/ui/icons";

type Props = {
  /** El caso que sigue en el archivo; nulo en el último. */
  siguiente: CasoInvestigacion | null;
  indice: number;
  /** Cantidad de expedientes del archivo (para el remate «FIN DEL ARCHIVO»). */
  total: number;
  interactiva: boolean;
  onIr: (indice: number, desdeBanda?: boolean) => void;
  onVolver: () => void;
};

/**
 * Remate del lugar: el siguiente expediente asoma como la MISMA banda-carpeta
 * del archivo (o el retorno, en el último caso).
 */
export function BandaSiguiente({ siguiente, indice, total, interactiva, onIr, onVolver }: Props) {
  return (
    <div data-exp-entrada data-exp-banda className="mt-20 lg:mt-24">
      {siguiente ? (
        <button
          type="button"
          onClick={() => interactiva && onIr(indice + 1, true)}
          className="group focus-visible:outline-verde-concepto relative block w-full pt-9 text-left focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          <span
            aria-hidden="true"
            className={`absolute top-0 left-[3%] block h-10 w-56 ${TINTES[siguiente.tinte].tinta}`}
          >
            <Pestana className="h-full w-full">
              <span className={`${ROTULO_TAB} ${TINTES[siguiente.tinte].texto}`}>
                CASO {siguiente.numero}
              </span>
            </Pestana>
          </span>
          <span
            data-exp-banda-obj
            className={`${TINTES[siguiente.tinte].carpeta} ${TINTES[siguiente.tinte].grano} ${TINTES[siguiente.tinte].texto} relative block rounded-2xl px-8 py-9 shadow-[0_30px_70px_-32px_rgb(31_45_77/0.55)] transition-[background-color] duration-500 lg:px-14 lg:py-12`}
          >
            <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-white/25" />
            <span className={ROTULO_MICRO}>SIGUIENTE EXPEDIENTE</span>
            <span className="font-display mt-4 block max-w-[26ch] text-[1.5rem] leading-[1.15] font-extrabold tracking-[-0.015em] lg:text-[1.9rem]">
              {siguiente.pregunta}
            </span>
            <span
              className={`mt-6 inline-flex items-center gap-2.5 ${ROTULO_TAB} underline-offset-4 group-hover:underline`}
            >
              ABRIR CASO {siguiente.numero}
              <ArrowRight
                size={16}
                className="transition-transform motion-safe:group-hover:translate-x-1"
              />
            </span>
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => interactiva && onVolver()}
          className="group focus-visible:outline-verde-concepto bg-azul-principal bg-grain-dark relative block w-full rounded-2xl px-8 py-9 text-left text-white shadow-[0_30px_70px_-32px_rgb(31_45_77/0.55)] focus-visible:outline-2 focus-visible:outline-offset-4 lg:px-14 lg:py-12"
        >
          <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-white/25" />
          <span className={`${ROTULO_MICRO} relative`}>
            FIN DEL ARCHIVO — {total.toString().padStart(2, "0")} EXPEDIENTES
          </span>
          <span className="font-display relative mt-4 block text-[1.5rem] leading-[1.15] font-extrabold tracking-[-0.015em] lg:text-[1.9rem]">
            La investigación sigue abierta.
          </span>
          <span
            className={`relative mt-6 inline-flex items-center gap-2.5 ${ROTULO_TAB} underline-offset-4 group-hover:underline`}
          >
            <span aria-hidden="true">←</span> VOLVER AL ARCHIVO
          </span>
        </button>
      )}
    </div>
  );
}
