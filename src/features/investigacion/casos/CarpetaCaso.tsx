"use client";

import Image from "next/image";
import type { CasoInvestigacion } from "./data";
import { OFFSET_PESTANA, ROTULO_MICRO, ROTULO_TAB, TINTES } from "./tintes";
import { Pestana } from "./Garabatos";

/**
 * Puntas de papel ESTÁTICAS asomando de la boca de cada carpeta: la pista
 * de que adentro hay documentos, sin reabrir la boca en hover (regla de
 * motion: nada se mueve). Composición irregular por carpeta — anchos,
 * alturas y rotaciones levemente distintos, como hojas mal guardadas.
 * Todas arrancan en left ≥62%: las pestañas ocupan hasta ~59% y no se
 * superponen. z-[8]: sobre el lomo y los slivers, bajo el clip de la hoja
 * (z-10) y la tapa (z-20) — la base del papel queda "adentro".
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
 * Cerrada muestra lo mínimo (pestaña, número fantasma, eje + chevron);
 * hover = PREAPERTURA acordeón (grid-rows 0fr→1fr) que revela la pregunta.
 * REGLA DE MOTION: en hover NADA se traslada (ni pestaña ni tapa) — un
 * elemento que se aleja del cursor que lo activó pierde el :hover y entra
 * en loop (jitter); el único movimiento es el acordeón creciendo hacia
 * abajo, que empuja la pila en bloque sin abrirla. El color del texto sale
 * del tinte (blanco en carpetas oscuras, navy en la clara). GSAP anima el
 * <li> y la anatomía; la coreografía congela las transiciones al abrir.
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
          carpeta anterior; el botón solo recibe eventos cuando el archivo
          está interactivo (así el hover no pelea con las timelines). */}
      <button
        ref={refBoton}
        type="button"
        onClick={() => interactiva && onAbrir(indice)}
        aria-label={`Abrir expediente del caso ${caso.numero}: ${caso.pregunta}`}
        className={`group focus-visible:outline-verde-concepto block w-full text-left focus-visible:outline-2 focus-visible:outline-offset-4 ${
          interactiva ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        {/* La pila nunca se despega: el hover no traslada el cuerpo ni corre
            a las hermanas (la respuesta física es boca + acordeón + pestaña). */}
        <div data-carpeta-cuerpo className="relative">
          {/* Pestaña troquelada orgánica: NUNCA se mueve sola (es parte de la
              tapa — despegarla rompe la metáfora y genera hover-jitter en el
              borde). El feedback de hover es el tinte de toda la carpeta. */}
          <span
            data-carpeta-tab
            aria-hidden="true"
            className={`absolute -top-10 ${OFFSET_PESTANA[indice] ?? "left-[2%]"} ${tinte.tinta} z-0 block h-10 w-56 lg:-top-11 lg:h-11`}
          >
            <Pestana className="h-full w-full">
              <span className={`${ROTULO_TAB} whitespace-nowrap ${tinte.texto}`}>
                CASO {caso.numero}
              </span>
            </Pestana>
          </span>

          {/* Lomo trasero (apenas más oscuro: profundidad del objeto) */}
          <span
            data-carpeta-back
            aria-hidden="true"
            className={`absolute inset-x-0 top-0 bottom-0 ${tinte.carpeta} ${
              esUltima ? "rounded-2xl" : "rounded-t-2xl"
            }`}
          >
            <span
              className={`absolute inset-0 bg-[rgb(10_16_30/0.22)] ${
                esUltima ? "rounded-2xl" : "rounded-t-2xl"
              }`}
            />
          </span>

          {/* Slivers de documentos: ADENTRO hay hojas (solo se ven cuando
              la boca se entreabre) */}
          <span
            data-carpeta-sliver
            aria-hidden="true"
            className="absolute inset-x-[3.5%] top-[7px] z-[6] h-3 rounded-t-[5px] bg-white/95"
          />
          <span
            data-carpeta-sliver2
            aria-hidden="true"
            className="absolute inset-x-[5%] top-[11px] z-[5] h-2 rounded-t-[4px] bg-white/70"
          />

          {/* Papeles mal guardados: asoman por la boca, quietos siempre */}
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
              className="bg-grain-light renglones-papel absolute top-[1414px] left-[4%] block h-[560px] w-[92%] rounded-t-2xl bg-white p-10 opacity-0 shadow-[0_-18px_60px_-30px_rgb(31_45_77/0.45)] lg:p-14"
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

          {/* Tapa frontal: cerrada muestra lo mínimo. La carpeta NUNCA se
              traslada en hover (la boca entreabierta recreaba el gap de la
              pila y causaba hover-jitter en los bordes): el único movimiento
              de la preapertura es el acordeón hacia abajo — se dispara con
              :hover de ESTA tapa; la pestaña mantiene lo abierto pero no lo
              inicia (ver la expansión). Teclado: foco = preapertura. */}
          <span
            data-carpeta-front
            className={`${tinte.carpeta} ${tinte.carpetaHover} ${tinte.grano} ${tinte.texto} relative z-20 mt-1 block overflow-hidden rounded-t-lg px-8 py-6 shadow-[0_30px_70px_-32px_rgb(31_45_77/0.55),0_-14px_30px_-20px_rgb(31_45_77/0.35)] transition-[background-color] duration-500 ease-out [backface-visibility:hidden] md:px-10 lg:px-12 ${peso.pt} ${
              esUltima ? "rounded-b-2xl pb-20 md:pb-24" : `rounded-b-none ${peso.pb}`
            }`}
          >
            {/* Anatomía de la tapa: luz del canto, lomo y pliegue inferior */}
            <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-white/25" />
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

                {/* Bloque de anticipación (derecha) */}
                <span className="pt-1 text-right">
                  <span className={`block ${ROTULO_MICRO}`}>
                    {caso.eje.toUpperCase()}
                    <span
                      aria-hidden="true"
                      className="ml-3 inline-block transition-transform duration-300 group-hover:-rotate-90 group-focus-visible:-rotate-90"
                    >
                      ‹
                    </span>
                  </span>
                  <span className="mt-2 block h-5 font-sans text-[0.88rem] opacity-0 transition-all duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 motion-safe:translate-y-1 motion-safe:group-hover:translate-y-0 motion-safe:group-focus-visible:translate-y-0">
                    {caso.indicio}
                  </span>
                </span>
              </span>

              {/* Preapertura acordeón con tres reglas de transición:
                  1) ABRE solo desde la tapa (front:hover → delay 0; su
                     selector gana por especificidad).
                  2) La pestaña MANTIENE pero no inicia: .group:hover apunta
                     a 1fr con delay enorme — si ya está abierta no hay nada
                     que transicionar (se sostiene); desde reposo nunca
                     llega a arrancar.
                  3) CIERRA con 150ms de gracia (absorbe cruces rápidos
                     pestaña↔tapa sin parpadeo). */}
              <span
                data-carpeta-expansion
                className="grid grid-rows-[0fr] transition-[grid-template-rows] delay-150 duration-[550ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-focus-visible:grid-rows-[1fr] group-focus-visible:delay-0 motion-reduce:transition-none [.group:hover_&]:grid-rows-[1fr] [.group:hover_&]:delay-[999s] [span[data-carpeta-front]:hover_&]:grid-rows-[1fr] [span[data-carpeta-front]:hover_&]:delay-0"
              >
                <span className="block overflow-hidden">
                  {/* pb-14: el texto termina ARRIBA de la zona donde muerde
                      la pestaña de la carpeta siguiente (~52px) — la
                      pestaña muerde color, nunca texto. */}
                  <span className="block pt-5 pb-14">
                    {/* 50ch: las tres preguntas demo caben en DOS renglones
                        con Manrope 800 (el umbral real es 48ch; +2 de
                        colchón para retoques de copy). */}
                    <span className="block max-w-[50ch] font-display text-[1.55rem] leading-[1.15] font-extrabold tracking-[-0.015em] opacity-0 transition-all delay-[250ms] duration-[400ms] group-hover:opacity-100 group-focus-visible:opacity-100 lg:text-[1.9rem] motion-safe:translate-y-2 motion-safe:group-hover:translate-y-0 motion-safe:group-focus-visible:translate-y-0">
                      {caso.pregunta}
                    </span>
                    <span className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-2 opacity-0 transition-opacity delay-[250ms] duration-[400ms] group-hover:opacity-100 group-focus-visible:opacity-100">
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
      </button>
    </li>
  );
}
