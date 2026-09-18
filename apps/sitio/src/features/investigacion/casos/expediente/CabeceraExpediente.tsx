import type { Ref } from "react";
import type { CasoInvestigacion } from "../data";
import { ROTULO_MICRO } from "../tintes";
import { Enlace } from "@/components/ui/icons";
import { useCopiar } from "@/lib/hooks/useCopiar";

type Props = {
  caso: CasoInvestigacion;
  refTitulo: Ref<HTMLHeadingElement>;
};

/**
 * Cabecera del lugar: identidad del expediente, FUERA de la carpeta (como
 * el rótulo de sala de un archivo). Rótulo con copia del link, título
 * display ancho y ficha catalográfica.
 */
export function CabeceraExpediente({ caso, refTitulo }: Props) {
  const { copiado, copiar } = useCopiar();
  return (
    <header data-exp-entrada data-exp-header className="relative z-10">
      <p
        data-exp-rotulo
        className={`flex flex-wrap items-center gap-x-4 gap-y-1.5 ${ROTULO_MICRO} text-azul-principal/70`}
      >
        <span>EXPEDIENTE Nº {caso.numero}</span>
        <span aria-hidden="true" className="bg-azul-principal/30 h-1 w-1 rounded-full" />
        <span>{caso.eje.toUpperCase()}</span>
        {caso.esDemo && (
          <span className="border-azul-principal/25 text-gris-texto rounded-full border px-2.5 py-0.5">
            DEMO
          </span>
        )}
        {/* El caso tiene dirección propia (#slug): copiarla para mandar
            «leé este caso» por donde sea. */}
        <button
          type="button"
          onClick={() =>
            copiar(`${window.location.origin}/investigacion#${caso.slug}`, "link")
          }
          className="border-azul-principal/25 text-azul-principal hover:border-azul-principal focus-visible:outline-verde-concepto inline-flex min-h-8 items-center gap-1.5 rounded-full border px-2.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <Enlace size={13} aria-hidden="true" />
          {copiado === "link" ? "COPIADO" : "COPIAR LINK"}
        </button>
      </p>
      <h3
        ref={refTitulo}
        data-exp-titulo
        tabIndex={-1}
        className="font-display text-azul-principal mt-5 max-w-[27ch] text-display font-extrabold tracking-[-0.025em] outline-none"
      >
        {caso.pregunta}
      </h3>
      {/* Ficha catalográfica: el documento de identidad del caso */}
      <p
        data-exp-ficha
        className={`mt-6 flex flex-wrap items-center gap-x-4 gap-y-1.5 ${ROTULO_MICRO} text-azul-principal/70`}
      >
        <span>PERÍODO {caso.ficha.periodo}</span>
        <span aria-hidden="true" className="bg-azul-principal/30 h-1 w-1 rounded-full" />
        <span>{caso.ficha.ambito.toUpperCase()}</span>
        <span aria-hidden="true" className="bg-azul-principal/30 h-1 w-1 rounded-full" />
        <span>
          {caso.evidencias.length.toString().padStart(2, "0")} EVIDENCIAS
        </span>
        <span aria-hidden="true" className="bg-azul-principal/30 h-1 w-1 rounded-full" />
        <span>ESTADO: {caso.ficha.estado}</span>
      </p>
    </header>
  );
}
