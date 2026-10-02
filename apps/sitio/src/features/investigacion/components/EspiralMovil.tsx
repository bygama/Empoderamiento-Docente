import type { Ciclo } from "@/features/investigacion/contenido/ciclo";
import { ConResaltado } from "./ConResaltado";
import { ALTO_ESPIRAL_MOVIL_LVH, LVH_HASTA_LA_BISAGRA } from "./coreografia-espiral-movil";
import { ESTACIONES, numero } from "./espiral";
import { EspiralSvg } from "./EspiralSvg";

/** La frase clave de la versión breve, con el subrayado verde de la lámina. */
function conSubrayado(clave: string) {
  return (
    <mark className="text-azul-principal relative bg-transparent font-medium">
      {clave}
      <span aria-hidden="true" className="bg-verde-concepto absolute inset-x-0 -bottom-[0.1em] h-[0.12em]" />
    </mark>
  );
}

const LAMINA = "absolute inset-x-0 top-0";

/**
 * La hoja 03 en celular: UNA ESTACIÓN POR VEZ. La escena queda fija, con la
 * espiral arriba y una sola lámina de texto debajo; al scrollear el personaje
 * recorre el trazo y las láminas se relevan: el título, las cuatro estaciones
 * del ciclo pedagógico en primer plano, «Implementar no es terminar» mientras
 * la cámara se aleja y aparece la segunda vuelta, las cuatro de la evidencia
 * y, con el lazo de vuelta al inicio, el remate. Es la historia de la lámina
 * de escritorio (EspiralLamina.tsx) con sus mismos textos breves, sin
 * anotaciones colgadas de la figura: en un celular no entran.
 *
 * Presentacional: el SSR la dibuja con todas las láminas apiladas y todo lo
 * que se mueve lo mueve coreografia-espiral-movil.ts. El orden de las
 * láminas en el DOM es el del recorrido.
 */
export function EspiralMovil({ contenido }: { contenido: Ciclo }) {
  const estaciones = [...contenido.pedagogico, ...contenido.evidencia];
  const mitad = contenido.pedagogico.length;
  const lamina = (e: (typeof estaciones)[number], i: number) => (
    <li key={numero(i)} data-espiral-lamina className={LAMINA}>
      <span className="text-verde-concepto-texto font-mono text-[0.72rem] font-bold tracking-[0.2em] tabular-nums">
        {numero(i)}
      </span>
      <h3 className="font-display mt-1.5 text-[1.4rem] leading-[1.15] font-bold tracking-[-0.01em] md:text-[1.7rem]">
        {e.nombre}
      </h3>
      <p className="text-azul-principal/80 mt-2.5 max-w-[42ch] text-[1.02rem] leading-[1.55] md:text-[1.15rem]">
        <ConResaltado texto={e.breve} resaltar={conSubrayado} />
      </p>
    </li>
  );
  return (
    <div data-espiral-pista className="relative" style={{ height: `${ALTO_ESPIRAL_MOVIL_LVH}lvh` }}>
      {/* Ancla interna: «Volvemos a investigar» aterriza donde la cámara se aleja. */}
      <span id="evidencia" aria-hidden="true" className="absolute" style={{ top: `${LVH_HASTA_LA_BISAGRA}lvh` }} />
      <div
        data-espiral-escena
        className="sticky top-[var(--visor-arriba,0px)] flex h-lvh flex-col px-6 pt-[5.25rem] pb-[calc(100lvh-100svh+1.25rem)] md:px-12"
      >
        <p className="text-gris-texto/80 flex items-baseline justify-between gap-3 font-mono text-[0.62rem] tracking-[0.12em] uppercase">
          <span>Hoja 03 · Ciclo de investigación</span>
          <span aria-hidden="true" className="tabular-nums">
            <span data-espiral-contador className="text-azul-principal font-bold">01</span> / {numero(ESTACIONES - 1)}
          </span>
        </p>

        {/* La figura toma el alto que deja el texto: en un celular alto la
            espiral crece, en uno bajo cede. */}
        <div data-espiral-figura className="relative mt-3 max-h-[27rem] min-h-0 flex-1">
          <EspiralSvg lamina className="[[data-modo=movil]_&]:h-full" />
        </div>

        <ol className="relative mt-5 h-[14.5rem] shrink-0 md:h-[15rem]">
          <li data-espiral-lamina className={LAMINA}>
            <h2 className="font-display max-w-[16ch] text-[1.9rem] leading-[1.08] font-extrabold tracking-[-0.025em] md:text-[2.4rem]">
              <ConResaltado texto={contenido.titulo} />
            </h2>
          </li>
          {estaciones.slice(0, mitad).map((e, i) => lamina(e, i))}
          <li data-espiral-lamina className={LAMINA}>
            <h2 className="font-display max-w-[16ch] text-[1.9rem] leading-[1.08] font-extrabold tracking-[-0.025em] md:text-[2.4rem]">
              <ConResaltado texto={contenido.tituloEvidencia} />
            </h2>
          </li>
          {estaciones.slice(mitad).map((e, i) => lamina(e, i + mitad))}
          <li data-espiral-lamina className={LAMINA}>
            <p className="font-display max-w-[36ch] text-[1.15rem] leading-[1.45] font-medium md:text-[1.35rem]">
              {contenido.remate}
            </p>
          </li>
        </ol>
      </div>
    </div>
  );
}
