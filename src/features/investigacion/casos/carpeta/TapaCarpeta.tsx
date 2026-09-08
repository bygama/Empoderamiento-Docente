import Image from "next/image";
import type { CasoInvestigacion } from "../data";
import { ROTULO_MICRO } from "../tintes";
import type { Peso, Tinte } from "./anatomia";

type Props = {
  caso: CasoInvestigacion;
  tinte: Tinte;
  peso: Peso;
  esUltima: boolean;
  interactiva: boolean;
  desplegada: boolean;
  onToggle: () => void;
  idPanel: string;
  /** Redondeo de la base, decidido por el padre (ver CarpetaCaso). */
  baseRedondeada: string;
};

/**
 * Tapa frontal: cerrada muestra lo mínimo. ES la que se mueve en hover —
 * CAE 12px y descubre el papel que tenía tapado. El gesto es suyo y va
 * hacia abajo a propósito: el lomo, las hojas y los papeles se quedan
 * donde están, así lo que se lee es una tapa abriéndose y no un contenido
 * que emerge.
 * Se desplaza con `translate` y no con `transform`: son propiedades
 * distintas y se componen, así que el rotateY que le anima la coreografía
 * al abrir el expediente no lo pisa.
 * Va entera en pointer-events-none: los clics la atraviesan hasta la capa
 * de abrir que está debajo. El único que los repone es el rótulo del eje,
 * que al estar pintado acá (z-20) le gana.
 */
export function TapaCarpeta({
  caso,
  tinte,
  peso,
  esUltima,
  interactiva,
  desplegada,
  onToggle,
  idPanel,
  baseRedondeada,
}: Props) {
  return (
    <span
      data-carpeta-front
      className={`${tinte.carpeta} ${tinte.carpetaHover} ${tinte.grano} ${tinte.texto} pointer-events-none relative z-20 mt-1 block overflow-hidden rounded-t-lg px-8 py-6 shadow-[0_30px_70px_-32px_rgb(31_45_77/0.55),0_-14px_30px_-20px_rgb(31_45_77/0.35)] transition-[background-color,box-shadow,translate] duration-[380ms] ease-out group-hover:shadow-[0_30px_70px_-32px_rgb(31_45_77/0.55),0_-17px_26px_-13px_rgb(31_45_77/0.6)] [backface-visibility:hidden] motion-safe:group-hover:translate-y-3 md:px-10 lg:px-12 ${peso.pt} ${
        esUltima ? "pb-20 md:pb-24" : peso.pb
      } ${baseRedondeada}`}
    >
      {/* Anatomía de la tapa: luz del canto y pliegue inferior. El
          canto se enciende al abrirse: es el filo que queda expuesto
          cuando la tapa se separa. (Había también una franja oscura
          de 10px pegada al borde izquierdo, el canto doblado de la
          carpeta; se leía como un borde de otro color y se sacó.) */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-white/25 transition-colors duration-[380ms] ease-out group-hover:bg-white/45"
      />
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
              onClick={() => interactiva && onToggle()}
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
  );
}
