"use client";

import { useId, useState } from "react";
import type { CasoInvestigacion } from "./data";
import { OFFSET_PESTANA, ROTULO_TAB, TINTES } from "./tintes";
import { Pestana } from "./Garabatos";
import { PESO_TAPA } from "./carpeta/anatomia";
import { LomoCarpeta } from "./carpeta/LomoCarpeta";
import { DocumentosCarpeta } from "./carpeta/DocumentosCarpeta";
import { TapaCarpeta } from "./carpeta/TapaCarpeta";

type Props = {
  caso: CasoInvestigacion;
  indice: number;
  /** true en la carpeta del fondo: cuerpo completo, base y marca estampada. */
  esUltima: boolean;
  /** false durante transiciones: ignora clics sin deshabilitar el foco. */
  interactiva: boolean;
  onAbrir: (indice: number) => void;
  refItem: (el: HTMLLIElement | null) => void;
  refBoton: (el: HTMLButtonElement | null) => void;
};

/**
 * Carpeta del archivo — pila SIN aire: cada banda apoya directamente sobre
 * la anterior. Las bandas cubiertas pierden el redondeo inferior; solo la
 * última conserva su base, más alta y con el isotipo ED estampado.
 * Cerrada muestra lo mínimo (pestaña, número fantasma, eje + flecha).
 *
 * HOVER = LA CARPETA SE ABRE. Cae la TAPA, 12px, y descubre las hojas que
 * tenía tapadas; su sombra de arriba se marca sobre el papel que queda a
 * la vista y el canto se ilumina. El lomo se estira hacia abajo lo mismo
 * que cae la tapa, para que no le sobresalga por el pie.
 * La dirección es deliberada: todo lo demás —lomo, hojas, papeles,
 * pestaña— se queda en su lugar. Una primera versión abría la boca
 * levantando el lomo y las hojas, y con todo el movimiento yendo hacia
 * arriba se leía como algo desplegándose desde adentro y no como una
 * carpeta abriéndose. Lo que abre una carpeta es la tapa, y va hacia
 * abajo. Las hojas suben 4px, apenas, para acompañar sin protagonizar.
 * Este gesto ya había existido y se sacó porque daba jitter: la tapa era
 * la que recibía el cursor, al moverse se le escapaba, perdía el :hover y
 * entraba en loop. Ahora quien recibe el cursor es la capa de abrir, que
 * es `absolute inset-0` del cuerpo y NO se mueve — nada de lo que se
 * anima acá es hit-testable (todo va en pointer-events-none), así que el
 * :hover no puede perderse. Por eso mismo el cuerpo tampoco se traslada:
 * movería la capa. La pestaña tampoco — va en el lomo, no en la tapa, y
 * en una carpeta de verdad se queda quieta cuando la tapa se abre.
 *
 * DOS GESTOS, DOS BOTONES HERMANOS (no anidados: un botón dentro de otro
 * es HTML inválido):
 * - Tocar la carpeta en cualquier parte ABRE el expediente. Ese botón es
 *   una capa `absolute inset-0` y se lleva la pestaña adentro para que
 *   tocarla también abra, aunque caiga fuera de su caja.
 * - Tocar el rótulo del eje —el título chico de la derecha, con su
 *   flechita— DESPLIEGA la anticipación: el acordeón (grid-rows 0fr→1fr)
 *   con el indicio, la pregunta y el pie. Es un toggle con estado, no un
 *   hover: se queda abierto hasta que lo cierren.
 *
 * Para que el rótulo gane el clic estando la capa de abrir por encima en
 * el orden del DOM, toda la anatomía va en pointer-events-none y solo el
 * rótulo repone pointer-events-auto: los clics atraviesan la tapa hasta
 * la capa de abrir, salvo los suyos.
 *
 * REGLA DE MOTION: al desplegar no se traslada nada — el único movimiento
 * es el acordeón creciendo hacia abajo, que empuja la pila en bloque sin
 * abrirla. El color del texto sale del tinte (blanco
 * en carpetas oscuras, navy en la clara). GSAP anima el <li> y la
 * anatomía; la coreografía congela las transiciones al abrir.
 *
 * Piezas (`carpeta/`): el lomo en `LomoCarpeta`, lo que hay adentro
 * (slivers, papeles, hoja) en `DocumentosCarpeta`, la tapa con su rótulo y
 * la anticipación en `TapaCarpeta`; papeles y grosores en `anatomia.ts`. El
 * DOM es el mismo de siempre: la coreografía lo lee por selectores desde el
 * `<li>`.
 */
export function CarpetaCaso({
  caso,
  indice,
  esUltima,
  interactiva,
  onAbrir,
  refItem,
  refBoton,
}: Props) {
  const tinte = TINTES[caso.tinte];
  const peso = PESO_TAPA[indice] ?? PESO_TAPA[PESO_TAPA.length - 1];
  const [desplegada, setDesplegada] = useState(false);
  const idPanel = useId();

  // Redondeo de la base. Abajo de md la pila no existe —las carpetas van
  // sueltas, separadas— así que TODAS cierran redondeadas; con la base
  // recta se veían dos puntas contra el fondo. De md para arriba las
  // cubiertas la pierden: ahí sí las tapa la carpeta siguiente.
  const baseRedondeada = esUltima ? "rounded-b-2xl" : "rounded-b-2xl md:rounded-b-none";

  // pt − mt = −4px en todos los breakpoints: la carpeta siguiente apoya 4px
  // por encima del fin de la anterior (pila sin aire).
  return (
    <li
      ref={refItem}
      data-carpeta-item
      className="pointer-events-none relative list-none pt-11 md:-mt-12 md:first:mt-0 lg:-mt-13 lg:pt-12 lg:first:mt-0"
      style={{ zIndex: 10 + indice }}
    >
      {/* pointer-events: el padding del solape (li) no captura taps de la
          carpeta anterior; los botones solo reciben eventos cuando el
          archivo está interactivo (así no pelean con las timelines).
          `group` vive acá y no en un botón: el tinte de hover tiene que
          responder desde cualquier parte de la carpeta. */}
      <div data-carpeta-cuerpo className="group relative">
        <LomoCarpeta tinte={tinte} esUltima={esUltima} baseRedondeada={baseRedondeada} />

        {/* ABRIR: capa que cubre la carpeta entera. Va sin z-index propio
            (no crea contexto de apilamiento) para que la pestaña que lleva
            adentro siga pintándose en z-0, debajo de papeles y tapa, como
            cuando colgaba del cuerpo. Queda después del lomo en el DOM —
            así lo tapa— y antes de la tapa, que la cubre pero le deja pasar
            los clics. */}
        <button
          ref={refBoton}
          type="button"
          onClick={() => interactiva && onAbrir(indice)}
          aria-label={`Abrir expediente del caso ${caso.numero}: ${caso.pregunta}`}
          className={`focus-visible:outline-verde-concepto absolute inset-0 block text-left focus-visible:outline-2 focus-visible:outline-offset-4 ${
            interactiva ? "pointer-events-auto" : "pointer-events-none"
          }`}
        >
          {/* Pestaña troquelada orgánica: NUNCA se mueve sola (es parte de
              la tapa — despegarla rompe la metáfora). Cuelga fuera de la
              caja del botón, pero como es hija suya tocarla también abre. */}
          <span
            data-carpeta-tab
            aria-hidden="true"
            className={`absolute -top-10 ${OFFSET_PESTANA[indice] ?? "left-[2%]"} ${tinte.tinta} z-0 block h-10 w-48 md:w-56 lg:-top-11 lg:h-11`}
          >
            <Pestana className="h-full w-full">
              <span className={`${ROTULO_TAB} whitespace-nowrap ${tinte.texto}`}>
                CASO {caso.numero}
              </span>
            </Pestana>
          </span>
        </button>

        <DocumentosCarpeta caso={caso} tinte={tinte} indice={indice} />

        <TapaCarpeta
          caso={caso}
          tinte={tinte}
          peso={peso}
          esUltima={esUltima}
          interactiva={interactiva}
          desplegada={desplegada}
          onToggle={() => setDesplegada((v) => !v)}
          idPanel={idPanel}
          baseRedondeada={baseRedondeada}
        />
      </div>
    </li>
  );
}
