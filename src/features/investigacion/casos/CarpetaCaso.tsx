"use client";

import { useId, useState } from "react";
import Image from "next/image";
import type { CasoInvestigacion } from "./data";
import { OFFSET_PESTANA, ROTULO_MICRO, ROTULO_TAB, TINTES } from "./tintes";
import { Pestana } from "./Garabatos";

/**
 * Puntas de papel asomando de la boca de cada carpeta: la pista de que
 * adentro hay documentos. En hover se sueltan un poco más, junto con las
 * hojas de adentro. Composición irregular por carpeta — anchos, alturas y
 * rotaciones levemente distintos, como hojas mal guardadas. Todas
 * arrancan en left ≥62%; con las pestañas en desorden alguna cae ahí
 * abajo, pero la pestaña va en z-0 y el papel en z-[8]: el papel tapa la
 * base de la pestaña, que es justo donde se funde con la tapa. z-[8] es
 * sobre el lomo y los slivers, y bajo el clip de la hoja (z-10) y la
 * tapa (z-20) — la base del papel queda "adentro".
 */
const PAPELES: readonly (readonly string[])[] = [
  [
    "left-[63%] -top-[8px] h-4 w-20 rotate-[0.8deg] bg-white/95",
    "left-[71%] -top-[6px] h-3.5 w-12 -rotate-[1.2deg] bg-white/75",
    "left-[84%] -top-[9px] h-4 w-24 rotate-[0.3deg] bg-white/90",
  ],
  [
    "left-[66%] -top-[9px] h-4 w-24 -rotate-[0.6deg] bg-white/95",
    "left-[81%] -top-[6px] h-3.5 w-14 rotate-[1.1deg] bg-white/80",
  ],
  [
    "left-[62%] -top-[7px] h-3.5 w-14 rotate-[1deg] bg-white/85",
    "left-[70%] -top-[9px] h-4 w-24 -rotate-[0.8deg] bg-white/95",
    "left-[86%] -top-[6px] h-3.5 w-12 -rotate-[0.4deg] bg-white/75",
  ],
  [
    "left-[64%] -top-[9px] h-4 w-16 -rotate-[0.9deg] bg-white/90",
    "left-[75%] -top-[6px] h-3.5 w-24 rotate-[0.5deg] bg-white/95",
    "left-[88%] -top-[8px] h-4 w-10 rotate-[1.3deg] bg-white/80",
  ],
];

/**
 * Peso de cada carpeta en desktop: la pila es más gruesa hacia abajo (01
 * fina, 03 gruesa), como carpetas apiladas de verdad. Solo padding: la
 * banda visible de una carpeta cubierta es el alto total de su tapa, así
 * que el padding ES el grosor. La última no usa `pb`: conserva su base.
 */
const PESO_TAPA: readonly { pt: string; pb: string }[] = [
  { pt: "lg:pt-8", pb: "lg:pb-8" },
  { pt: "lg:pt-10", pb: "lg:pb-10" },
  { pt: "lg:pt-12", pb: "lg:pb-12" },
];

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
        {/* Lomo trasero (apenas más oscuro: profundidad del objeto). Su
            borde de arriba NO se mueve nunca — es lo que fija el objeto en
            la pila; si se levantara, la carpeta parecería desplegar algo
            hacia arriba en vez de abrirse. Lo que hace en hover es
            estirarse hacia abajo lo mismo que cae la tapa, para que la
            tapa no le sobresalga por el pie: en las carpetas cubiertas no
            se notaría, pero en la última asomaría media luna de un tono
            más claro que el lomo. */}
        <span
          data-carpeta-back
          aria-hidden="true"
          className={`absolute inset-x-0 top-0 bottom-0 transition-[bottom] duration-[380ms] ease-out motion-safe:group-hover:-bottom-3 ${tinte.carpeta} ${
            esUltima ? "rounded-2xl" : "rounded-t-2xl"
          }`}
        >
          <span
            className={`absolute inset-0 bg-[rgb(10_16_30/0.22)] ${
              esUltima ? "rounded-2xl" : "rounded-t-2xl"
            }`}
          />
        </span>

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

        {/* Tapa frontal: cerrada muestra lo mínimo. ES la que se mueve en
            hover — CAE 12px y descubre el papel que tenía tapado. El
            gesto es suyo y va hacia abajo a propósito: el lomo, las hojas
            y los papeles se quedan donde están, así lo que se lee es una
            tapa abriéndose y no un contenido que emerge.
            Se desplaza con `translate` y no con `transform`: son
            propiedades distintas y se componen, así que el rotateY que le
            anima la coreografía al abrir el expediente no lo pisa.
            Va entera en pointer-events-none: los clics la atraviesan hasta
            la capa de abrir que está debajo. El único que los repone es el
            rótulo del eje, que al estar pintado acá (z-20) le gana. */}
        <span
          data-carpeta-front
          className={`${tinte.carpeta} ${tinte.carpetaHover} ${tinte.grano} ${tinte.texto} pointer-events-none relative z-20 mt-1 block overflow-hidden rounded-t-lg px-8 py-6 shadow-[0_30px_70px_-32px_rgb(31_45_77/0.55),0_-14px_30px_-20px_rgb(31_45_77/0.35)] transition-[background-color,box-shadow,translate] duration-[380ms] ease-out group-hover:shadow-[0_30px_70px_-32px_rgb(31_45_77/0.55),0_-17px_26px_-13px_rgb(31_45_77/0.6)] [backface-visibility:hidden] motion-safe:group-hover:translate-y-3 md:px-10 lg:px-12 ${peso.pt} ${
            esUltima ? "rounded-b-2xl pb-20 md:pb-24" : `rounded-b-none ${peso.pb}`
          }`}
        >
          {/* Anatomía de la tapa: luz del canto, lomo y pliegue inferior.
              El canto se enciende al abrirse: es el filo que queda
              expuesto cuando la tapa se separa. */}
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-px bg-white/25 transition-colors duration-[380ms] ease-out group-hover:bg-white/45"
          />
          <span aria-hidden="true" className="absolute top-0 bottom-0 left-0 w-2.5 bg-[rgb(10_16_30/0.16)]" />
          <span
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-9 bg-gradient-to-t from-[rgb(10_16_30/0.12)] to-transparent"
          />
          {/* Sombra de la tapa al pivotar (la anima coreografia.ts) */}
          <span
            data-carpeta-front-sombra
            aria-hidden="true"
            className="absolute inset-0 bg-[rgb(10_16_30)] opacity-0"
          />

          {/* Marca seca ED en la base del archivo (solo carpeta completa).
              Logo ACTUAL de la marca (logotipo-principal-ed), versión
              negativa — el mismo que usan navbar y footer. */}
          {esUltima && (
            <Image
              src="/brand/logotipo-principal-ed-negativo.png"
              alt=""
              aria-hidden="true"
              data-carpeta-rotulos
              width={395}
              height={433}
              className="pointer-events-none absolute right-8 bottom-6 h-16 w-auto opacity-[0.14] select-none lg:right-12 lg:bottom-7 lg:h-20"
            />
          )}

          <span data-carpeta-rotulos className="relative block">
            <span className="flex items-start justify-between gap-10">
              {/* Número fantasma: rotulación de archivo, no dato */}
              <span
                aria-hidden="true"
                className={`font-display text-[2.6rem] leading-[0.9] font-extrabold tracking-tight select-none lg:text-[3.8rem] ${tinte.marcaAgua}`}
              >
                {caso.numero}
              </span>

              {/* Bloque de anticipación (derecha): el rótulo del eje ES el
                  disparador. Los márgenes negativos anulan su padding en
                  los cuatro lados — el área de toque crece sin ocupar más
                  lugar del que ocupaba el texto solo. Importa: en pantallas
                  angostas la columna ya no entra en la tapa (a 324px se
                  sale 30px, el ancho mínimo de «EMPODERAMIENTO» con su
                  tracking), y sin compensar el padding se saldría 16px
                  más. inline-block y no block: como block se quedaba con
                  el ancho entero de la columna y le robaba clics a la capa
                  de abrir. */}
              <span className="pt-1 text-right">
                <button
                  type="button"
                  data-carpeta-toggle
                  aria-expanded={desplegada}
                  aria-controls={idPanel}
                  onClick={() => interactiva && setDesplegada((v) => !v)}
                  className={`-mx-2 -my-1 inline-block cursor-pointer rounded-sm px-2 py-1 text-right focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current ${ROTULO_MICRO} ${
                    interactiva ? "pointer-events-auto" : "pointer-events-none"
                  }`}
                >
                  <span className="sr-only">
                    {desplegada ? "Ocultar" : "Ver"} de qué trata el caso{" "}
                    {caso.numero}:{" "}
                  </span>
                  {caso.eje.toUpperCase()}
                  <span
                    aria-hidden="true"
                    className={`ml-3 inline-block transition-transform duration-300 ${
                      desplegada ? "-rotate-90" : ""
                    }`}
                  >
                    ‹
                  </span>
                </button>
                <span
                  aria-hidden={!desplegada}
                  className={`mt-2 block h-5 font-sans text-[0.88rem] transition-all duration-300 ${
                    desplegada
                      ? "opacity-100 motion-safe:translate-y-0"
                      : "opacity-0 motion-safe:translate-y-1"
                  }`}
                >
                  {caso.indicio}
                </span>
              </span>
            </span>

            {/* Anticipación desplegable: la abre y la cierra el rótulo de
                arriba, y se queda como la dejaron. El contenido acompaña
                con delay al abrir (espera a que el acordeón crezca) y sin
                delay al cerrar: si no, el texto queda flotando sobre una
                caja que ya se cerró. */}
            <span
              data-carpeta-expansion
              id={idPanel}
              className={`grid transition-[grid-template-rows] duration-[550ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                desplegada ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <span aria-hidden={!desplegada} className="block overflow-hidden">
                {/* pb-14: el texto termina ARRIBA de la zona donde muerde
                    la pestaña de la carpeta siguiente (~52px) — la
                    pestaña muerde color, nunca texto. */}
                <span className="block pt-5 pb-14">
                  {/* 50ch: las preguntas caben en DOS renglones con
                      Manrope 800 (el umbral real es 48ch; +2 de colchón
                      para retoques de copy). */}
                  <span
                    className={`font-display block max-w-[50ch] text-[1.55rem] leading-[1.15] font-extrabold tracking-[-0.015em] transition-all duration-[400ms] lg:text-[1.9rem] ${
                      desplegada
                        ? "opacity-100 delay-[250ms] motion-safe:translate-y-0"
                        : "opacity-0 motion-safe:translate-y-2"
                    }`}
                  >
                    {caso.pregunta}
                  </span>
                  <span
                    className={`mt-5 flex flex-wrap items-center gap-x-8 gap-y-2 transition-opacity duration-[400ms] ${
                      desplegada ? "opacity-100 delay-[250ms]" : "opacity-0"
                    }`}
                  >
                    <span className={`inline-flex items-center gap-2 ${ROTULO_MICRO} underline-offset-4 group-hover:underline`}>
                      ABRIR EXPEDIENTE ↗
                    </span>
                    {caso.esDemo && (
                      <span className={ROTULO_MICRO}>DEMO · PROVISIONAL</span>
                    )}
                  </span>
                </span>
              </span>
            </span>
          </span>
        </span>
      </div>
    </li>
  );
}
