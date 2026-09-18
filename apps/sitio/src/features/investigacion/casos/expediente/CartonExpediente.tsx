import Image from "next/image";
import Link from "next/link";
import type { CasoInvestigacion } from "../data";
import { ETIQUETA_DEMO } from "../data";
import { ROTULO_MICRO } from "../tintes";
import { EvidenciasCaso } from "../EvidenciasCaso";
import { ClipPapel } from "../Garabatos";
import { RotuloExpediente } from "./RotuloExpediente";

type Props = {
  caso: CasoInvestigacion;
  /** true salvo en la carpeta clara: decide el color del texto sobre el cartón. */
  oscuro: boolean;
};

/**
 * SUPERFICIE 2: el cartón — recursos sueltos sobre el interior tintado de la
 * carpeta: collage de evidencias, análisis como hoja mecanografiada con
 * clip, aprendizaje como post-it, síntesis en placa, sello ED estampado
 * directo sobre el color y producción como etiquetas.
 */
export function CartonExpediente({ caso, oscuro }: Props) {
  /* Colores del cartón (texto directo sobre el interior tintado). */
  const cartonTexto = oscuro ? "text-white/85" : "text-azul-principal/85";
  const cartonMarcador = oscuro ? "text-white/35" : "text-azul-medio/60";
  const cartonRegla = oscuro ? "border-white/15" : "border-azul-principal/15";

  return (
    <div data-exp-carton className="relative px-1 pt-14 pb-2 lg:px-6 lg:pt-20 lg:pb-4">
      {/* Evidencias: el collage pegado al cartón */}
      <section data-exp-bloque aria-label="Evidencias">
        <RotuloExpediente
          texto={cartonTexto}
          marcador={cartonMarcador}
          regla={cartonRegla}
        >{`EVIDENCIAS — ${caso.evidencias.length} DOCUMENTOS`}</RotuloExpediente>
        <div className={`mt-10 ${cartonTexto}`}>
          <EvidenciasCaso evidencias={caso.evidencias} tinte={caso.tinte} />
        </div>
      </section>

      {/* Lectura: análisis como hoja mecanografiada suelta +
          aprendizaje como post-it celeste */}
      <div className="mt-16 grid items-start gap-10 lg:mt-24 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16">
        <section data-exp-bloque aria-label="Análisis">
          <div
            data-exp-asienta
            className="bg-grain-light relative rotate-[-0.7deg] rounded-md bg-white p-7 pt-9 shadow-[0_24px_55px_-24px_rgb(10_16_30/0.55)] lg:p-10 lg:pt-11"
          >
            <ClipPapel className="text-gris-texto absolute -top-4 left-8 h-12 w-auto rotate-[4deg] drop-shadow-sm" />
            <RotuloExpediente>ANÁLISIS</RotuloExpediente>
            <p className="font-typewriter text-azul-principal/90 mt-6 max-w-[58ch] text-[1rem] leading-[1.95]">
              {caso.analisis}
            </p>
          </div>
        </section>
        <aside data-exp-bloque aria-label="Aprendizaje" className="lg:pt-8">
          <div
            data-pieza-parallax
            data-exp-asienta
            data-profundidad="5"
            className="bg-azul-claro relative rotate-[1.6deg] rounded-lg p-6 pt-8 shadow-[0_18px_40px_-20px_rgb(10_16_30/0.5)]"
          >
            <span
              aria-hidden="true"
              className="absolute -top-2.5 left-1/2 h-6 w-20 -translate-x-1/2 rotate-[-2deg] border border-white/60 bg-white/55 shadow-sm"
            />
            <h4 className={`text-azul-principal/75 ${ROTULO_MICRO}`}>
              APRENDIZAJE
            </h4>
            <p className="font-hand text-azul-principal mt-3 text-[1.6rem] leading-[1.25] font-medium">
              “{caso.aprendizaje}”
            </p>
          </div>
        </aside>
      </div>

      {/* Síntesis: placa blanca sujeta al cartón + sello ED con
          logo estampado DIRECTO sobre el color */}
      <section
        data-exp-bloque
        aria-label="Qué cambió"
        className="relative mt-16 lg:mt-24"
      >
        <div
          data-exp-asienta
          className="bg-grain-light relative max-w-3xl rotate-[0.5deg] rounded-2xl bg-white px-8 py-10 shadow-[0_26px_60px_-26px_rgb(10_16_30/0.55)] lg:px-12 lg:py-12"
        >
          <span
            aria-hidden="true"
            className="bg-azul-claro/45 absolute -top-3 left-10 h-6 w-24 rotate-[-3deg] border border-white/60 shadow-sm"
          />
          <span
            aria-hidden="true"
            className="bg-azul-claro/45 absolute -right-4 -bottom-3 h-6 w-24 rotate-[5deg] border border-white/60 shadow-sm"
          />
          <RotuloExpediente>QUÉ CAMBIÓ</RotuloExpediente>
          <p className="font-display text-azul-principal mt-5 max-w-[34ch] text-[1.3rem] leading-snug font-bold md:text-[1.55rem]">
            {caso.queCambio}
          </p>
        </div>

        <span
          data-exp-sello
          data-pieza-parallax
          data-profundidad="3"
          className={`absolute -bottom-8 hidden rotate-[4deg] items-center gap-3.5 rounded-lg border-2 px-5 py-3.5 opacity-75 lg:right-6 lg:flex ${
            oscuro
              ? "border-white/70 text-white/90"
              : "border-azul-principal/70 text-azul-principal/90"
          }`}
        >
          <Image
            src={
              oscuro
                ? "/brand/logotipo-principal-ed-negativo.png"
                : "/brand/logotipo-principal-ed.png"
            }
            alt=""
            aria-hidden="true"
            width={395}
            height={433}
            className="h-11 w-auto select-none"
          />
          <span className={ROTULO_MICRO}>
            ARCHIVO DE
            <br />
            INVESTIGACIÓN
          </span>
        </span>
      </section>

      {/* Pie sobre el cartón: producción como etiquetas */}
      <footer data-exp-bloque className="mt-20 space-y-6 lg:mt-24">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <span className={`${cartonTexto} ${ROTULO_MICRO}`}>
            PRODUCCIÓN RELACIONADA
          </span>
          {caso.produccionRelacionada.map((recurso, i) => (
            <Link
              key={recurso.titulo}
              href={recurso.href}
              className={`border-azul-principal/15 text-azul-principal hover:text-verde-concepto-texto bg-grain-light rounded-md border bg-white px-4 py-2 font-mono text-[0.72rem] tracking-[0.08em] shadow-[0_10px_24px_-14px_rgb(10_16_30/0.5)] transition-colors ${
                i % 2 === 0 ? "rotate-[-1deg]" : "rotate-[1.2deg]"
              }`}
            >
              {recurso.titulo}
            </Link>
          ))}
        </div>
        {caso.esDemo && (
          <p className={`${cartonTexto} font-sans text-[0.78rem] italic opacity-90`}>
            {ETIQUETA_DEMO}
            {caso.aclaracion ? ` — ${caso.aclaracion}` : ""}
          </p>
        )}
      </footer>
    </div>
  );
}
