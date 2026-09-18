import type { CasoInvestigacion } from "../data";
import { ROTULO_MICRO } from "../tintes";
import { PAPELES, type Tinte } from "./anatomia";

type Props = {
  caso: CasoInvestigacion;
  tinte: Tinte;
  indice: number;
};

/**
 * Lo que hay ADENTRO de la carpeta: los slivers de hojas que la tapa cubre
 * en reposo, los papeles mal guardados que asoman por la boca y la hoja
 * real que emerge durante la apertura del expediente. Todo en
 * pointer-events-none: nada de esto es hit-testable (ver CarpetaCaso).
 */
export function DocumentosCarpeta({ caso, tinte, indice }: Props) {
  return (
    <>
      {/* Slivers de documentos: ADENTRO hay hojas. En reposo la tapa las
          cubre enteras; quedan a la vista porque la tapa CAE, no porque
          ellas suban. Se les deja apenas 4px de subida —contra los 12
          que baja la tapa— para que el papel acompañe el gesto sin
          protagonizarlo: si suben más, lo que se lee es algo saliendo de
          la carpeta y no la carpeta abriéndose. */}
      <span
        data-carpeta-sliver
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-[3.5%] top-[7px] z-[6] h-3 rounded-t-[5px] bg-white/95 transition-[translate] duration-[380ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover:-translate-y-1"
      />
      <span
        data-carpeta-sliver2
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-[5%] top-[11px] z-[5] h-2 rounded-t-[4px] bg-white/70 transition-[translate] duration-[380ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover:-translate-y-1"
      />

      {/* Papeles mal guardados: asoman por la boca y ahí se quedan,
          también en hover. Son el punto fijo del gesto — la tapa cae
          contra ellos, y eso es lo que se lee como abrirse. */}
      {PAPELES[indice]?.map((clases) => (
        <span
          key={clases}
          data-carpeta-papel
          aria-hidden="true"
          className={`pointer-events-none absolute z-[8] block rounded-t-[3px] shadow-[0_-2px_5px_-2px_rgb(31_45_77/0.4)] ${clases}`}
        />
      ))}

      {/* Hoja real: emerge durante la apertura (clip abierto arriba,
          cerrado abajo para que nunca asome bajo la carpeta) */}
      <span
        data-carpeta-clip
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-[1400px] bottom-1 z-10 overflow-hidden"
      >
        <span
          data-carpeta-sheet
          /* rounded-t-[1.2rem] y no rounded-t-2xl: es el radio de la
             hoja del expediente ([data-exp-hoja]). Esta hoja aterriza
             encima de aquella y las dos conviven ~400ms; con radios
             distintos quedaba un sobrante de 3px en cada esquina de
             arriba durante el relevo. */
          className="bg-grain-light renglones-papel absolute top-[1414px] left-[4%] block h-[560px] w-[92%] rounded-t-[1.2rem] bg-white p-10 opacity-0 shadow-[0_-18px_60px_-30px_rgb(31_45_77/0.45)] lg:p-14"
        >
          <span className={`text-gris-texto block ${ROTULO_MICRO}`}>
            EXPEDIENTE
          </span>
          <span
            className={`font-display mt-5 block text-[2.4rem] leading-none font-extrabold tracking-[-0.02em] ${tinte.acentoTexto}`}
          >
            CASO {caso.numero}
          </span>
          <span className="text-azul-principal/70 mt-4 block font-sans text-[0.95rem]">
            {caso.eje}
          </span>
          <span className={`mt-8 block h-1 w-24 rounded-full ${tinte.suave}`} />
        </span>
      </span>
    </>
  );
}
