import type { CasoInvestigacion } from "../data";
import { ROTULO_TAB, TINTES } from "../tintes";
import { Pestana } from "../Garabatos";

type Props = {
  caso: CasoInvestigacion;
  casos: readonly CasoInvestigacion[];
  interactiva: boolean;
  onIr: (indice: number) => void;
};

/**
 * Las pestañas de la carcasa: la del caso abierto (`data-exp-pestana`, el
 * destino que mide la coreografía al aterrizar la pestaña del índice) y las
 * de los OTROS casos, que asoman del canto derecho como separadores del
 * archivo. Fragment: ambas cuelgan directo de la carcasa.
 */
export function PestanasLaterales({ caso, casos, interactiva, onIr }: Props) {
  const tinte = TINTES[caso.tinte];
  return (
    <>
      {/* Pestaña de la carpeta, presente también en el lugar. Es el
          destino de la pestaña del índice al abrir: la coreografía
          la mide y aterriza la otra encima. */}
      <span
        aria-hidden="true"
        data-exp-pestana
        className={`${tinte.tinta} absolute -top-9 right-[4%] block h-10 w-56`}
      >
        <Pestana className="h-full w-full">
          <span className={`${ROTULO_TAB} whitespace-nowrap ${tinte.texto}`}>
            CASO {caso.numero}
          </span>
        </Pestana>
      </span>

      {/* Pestañas de los OTROS casos: parte del objeto — asoman del
          canto derecho de la carcasa, como separadores del archivo */}
      <nav
        aria-label="Otros casos"
        className="absolute top-28 -right-[2.15rem] z-[5] hidden w-10 flex-col gap-5 lg:flex"
      >
        {casos.map(
          (otro, i) =>
            otro.id !== caso.id && (
              <button
                key={otro.id}
                type="button"
                data-exp-tab-lateral
                onClick={() => interactiva && onIr(i)}
                title={otro.pregunta}
                className="group/tab focus-visible:outline-verde-concepto relative block h-44 w-10 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                {/* El hit-area (botón) NUNCA se mueve — solo el visual
                    se asoma e ilumina: feedback sin hover-jitter. El
                    corrimiento va dentro del calc para no pisar el
                    -translate-x-1/2 del centrado. */}
                <span
                  aria-hidden="true"
                  className={`${TINTES[otro.tinte].tinta} absolute top-1/2 left-1/2 block h-10 w-44 -translate-x-1/2 -translate-y-1/2 rotate-90 transition-[translate,filter] duration-300 ease-out group-hover/tab:brightness-110 group-focus-visible/tab:brightness-110 motion-safe:group-hover/tab:translate-x-[calc(-50%+0.3rem)] motion-safe:group-focus-visible/tab:translate-x-[calc(-50%+0.3rem)]`}
                >
                  <Pestana className="h-full w-full">
                    <span
                      className={`${ROTULO_TAB} whitespace-nowrap ${TINTES[otro.tinte].texto}`}
                    >
                      CASO {otro.numero}
                    </span>
                  </Pestana>
                </span>
                <span className="sr-only">Caso {otro.numero}</span>
              </button>
            ),
        )}
      </nav>
    </>
  );
}
