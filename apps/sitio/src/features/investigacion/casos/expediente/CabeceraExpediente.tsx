import type { Ref } from "react";
import type { CasoInvestigacion } from "@/features/investigacion/casos/tipos";
import { ROTULO_MICRO } from "../tintes";
import { Enlace } from "@/components/ui/icons";
import { useCopiar } from "@/lib/hooks/useCopiar";

/** El punto que separa los datos en renglón; bajo `lg` no va. */
const PUNTO = "bg-azul-principal/30 h-1 w-1 rounded-full max-lg:hidden";
/** El rótulo de cada dato en la ficha de celular. */
const ROTULO_FICHA = "font-mono text-[0.6rem] tracking-[0.14em] uppercase";

type Props = {
  caso: CasoInvestigacion;
  refTitulo: Ref<HTMLHeadingElement>;
};

/**
 * Cabecera del lugar: identidad del expediente, FUERA de la carpeta (como
 * el rótulo de sala de un archivo). Rótulo con copia del link, título
 * display ancho y ficha catalográfica.
 *
 * Bajo `lg` (Gastón, 2026-10-02) el rótulo se va —el número ya está en la
 * solapa y en la barra de abajo— y queda solo «Copiar link», centrado
 * arriba, entre el logo y el botón del menú; el título baja de cuerpo y el
 * eje pasa a la ficha, que ahí es una tabla chica con sus rótulos.
 */
export function CabeceraExpediente({ caso, refTitulo }: Props) {
  const { copiado, copiar } = useCopiar();
  return (
    <header data-exp-entrada data-exp-header className="relative z-10">
      <p
        data-exp-rotulo
        className={`flex flex-wrap items-center gap-x-4 gap-y-1.5 max-lg:justify-center ${ROTULO_MICRO} text-azul-principal/70`}
      >
        <span className="max-lg:hidden">EXPEDIENTE Nº {caso.numero}</span>
        <span aria-hidden="true" className={PUNTO} />
        <span className="max-lg:hidden">{caso.eje.toUpperCase()}</span>
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
          className="border-azul-principal/25 text-azul-principal hover:border-azul-principal focus-visible:outline-verde-concepto inline-flex min-h-8 items-center gap-1.5 rounded-full border px-2.5 transition-colors max-lg:min-h-11 max-lg:px-4 focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <Enlace size={13} aria-hidden="true" />
          {copiado === "link" ? "COPIADO" : "COPIAR LINK"}
        </button>
      </p>
      <h3
        ref={refTitulo}
        data-exp-titulo
        tabIndex={-1}
        // Bajo `lg` el cuerpo baja: a tamaño display la pregunta se llevaba
        // media pantalla (siete renglones en un celular).
        className="font-display text-azul-principal mt-5 max-w-[27ch] text-display font-extrabold tracking-[-0.025em] outline-none max-lg:mt-4 max-lg:text-[clamp(1.6rem,1.1rem+2.2vw,2.3rem)] max-lg:leading-[1.12] max-lg:tracking-[-0.02em] max-lg:text-balance"
      >
        {caso.pregunta}
      </h3>
      {/* Ficha catalográfica: el documento de identidad del caso. Solo
          período y ámbito: «ESTADO: EN CURSO» y «05 EVIDENCIAS» no se
          entendían (Daniela, 2026-09-30); el estado se sigue cargando en el
          admin, y las evidencias tienen su rótulo adentro del expediente. En
          escritorio, un renglón con puntos; bajo `lg`, una ficha de verdad
          (Gastón, 2026-10-02): el eje, el ámbito y el período en renglones
          propios con su rótulo a la izquierda. */}
      <div data-exp-ficha className="mt-6 max-lg:mt-5">
        <p className={`flex flex-wrap items-center gap-x-4 gap-y-1.5 max-lg:hidden ${ROTULO_MICRO} text-azul-principal/70`}>
          <span>PERÍODO {caso.ficha.periodo}</span>
          <span aria-hidden="true" className={PUNTO} />
          <span>{caso.ficha.ambito.toUpperCase()}</span>
        </p>
        <dl className="border-azul-principal/15 border-y lg:hidden">
          {[
            ["Eje", caso.eje],
            ["Ámbito", caso.ficha.ambito],
            ["Período", caso.ficha.periodo],
          ].map(([rotulo, valor]) => (
            <div key={rotulo} className="border-azul-principal/10 grid grid-cols-[4.25rem_minmax(0,1fr)] items-baseline gap-x-3 border-b py-2.5 last:border-b-0">
              <dt className={`${ROTULO_FICHA} text-gris-texto`}>{rotulo}</dt>
              <dd className="text-azul-principal font-sans text-[0.9rem] leading-snug font-medium">{valor}</dd>
            </div>
          ))}
        </dl>
      </div>
    </header>
  );
}
