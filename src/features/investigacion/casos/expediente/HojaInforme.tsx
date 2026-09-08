import type { CasoInvestigacion } from "../data";
import { ROTULO_SECCION, TINTES } from "../tintes";
import { LaminaCaso } from "../LaminaCaso";
import { FlechaManuscrita, SubrayadoMarcador } from "../Garabatos";
import { RotuloExpediente } from "./RotuloExpediente";

/**
 * SUPERFICIE 1: la hoja blanca — el informe, corto. Margen de hoja con
 * perforación y anillas (lg+), la lámina que LIDERA con el contexto
 * mecanografiado al lado, y el cierre con la pregunta de investigación.
 * `[data-exp-hoja]` es el destino de la hoja que emerge de la carpeta.
 */
export function HojaInforme({ caso }: { caso: CasoInvestigacion }) {
  const tinte = TINTES[caso.tinte];
  return (
    <div
      data-exp-hoja
      data-exp-entrada
      className="bg-grain-light renglones-papel relative rounded-[1.2rem] bg-white px-6 py-12 shadow-[0_30px_60px_-26px_rgb(10_16_30/0.5)] md:px-10 lg:px-24 lg:py-16"
    >
      {/* Margen de hoja + perforación + anilla (lg+) */}
      <span
        aria-hidden="true"
        className="border-azul-principal/10 pointer-events-none absolute top-0 bottom-0 left-16 hidden border-r lg:block"
      />
      {["30%", "72%"].map((top) => (
        <span key={top} aria-hidden="true" className="hidden lg:block">
          <span
            className={`absolute left-7 h-4 w-4 -translate-y-1/2 rounded-full ${tinte.carpeta} shadow-[inset_0_2px_3px_rgb(0_0_0/0.4)]`}
            style={{ top }}
          />
          <span
            className="border-gris-texto/50 absolute -left-3 z-10 h-14 w-7 -translate-y-1/2 rotate-[-4deg] rounded-full border-[3px] shadow-sm"
            style={{ top }}
          />
        </span>
      ))}

      {/* Apertura: la lámina LIDERA y el contexto mecanografiado
          la acompaña */}
      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
        <section
          data-exp-bloque
          aria-label="Lámina del caso"
          className="lg:-mt-2 lg:-ml-32"
        >
          <LaminaCaso lamina={caso.lamina} tinte={caso.tinte} esDemo={caso.esDemo} />
        </section>
        <section data-exp-bloque aria-label="Contexto" className="lg:pt-4">
          <RotuloExpediente>CONTEXTO</RotuloExpediente>
          <p className="font-typewriter text-azul-principal/90 mt-7 max-w-[48ch] text-[1rem] leading-[1.95]">
            {caso.contexto}
          </p>
          <div className="mt-8 hidden items-end gap-3 lg:flex">
            <FlechaManuscrita className="text-azul-medio/80 h-9 w-24 scale-x-[-1] rotate-[-6deg]" />
            <span className="font-hand text-azul-medio text-[1.35rem] leading-none">
              el registro de la sesión
            </span>
          </div>
        </section>
      </div>

      {/* Cierre del informe: la pregunta de investigación */}
      <section
        data-exp-bloque
        aria-label="Pregunta de investigación"
        className={`border-t ${tinte.borde} mt-14 pt-10 pb-2 text-center lg:mt-16 lg:pt-12`}
      >
        <h4 className={`text-gris-texto ${ROTULO_SECCION} relative inline-block`}>
          <SubrayadoMarcador
            aria-hidden="true"
            className="text-verde-concepto/60 absolute -bottom-2 left-0 h-2.5 w-full"
          />
          PREGUNTA DE INVESTIGACIÓN
        </h4>
        <p
          className={`font-display mx-auto mt-6 max-w-3xl text-[1.3rem] leading-snug font-bold tracking-[-0.015em] md:text-[1.6rem] ${tinte.acentoTexto}`}
        >
          {caso.preguntaInvestigacion}
        </p>
      </section>
    </div>
  );
}
