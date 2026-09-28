import type { Ciclo, Estacion } from "@/features/investigacion/contenido/ciclo";
import { ROTULO_MICRO } from "../casos/tintes";
import { ConResaltado } from "./ConResaltado";
import { numero } from "./espiral";
import { EspiralSvg } from "./EspiralSvg";

function Bloque({ numeroTexto, nombre, texto, destacado }: Estacion & { numeroTexto: string }) {
  return (
    <div className="relative">
      <span className={`${ROTULO_MICRO} text-gris-texto/80 block tabular-nums`}>
        {numeroTexto}
      </span>
      <h3 className="font-display mt-2 text-[1.35rem] leading-tight font-bold lg:text-[1.55rem]">
        {nombre}
      </h3>
      <p className="mt-3 max-w-[42ch] text-[1rem] leading-[1.65] lg:text-[1.05rem]">{texto}</p>
      {destacado ? (
        <p className="text-azul-principal mt-3 max-w-[42ch] text-[1rem] leading-[1.6] font-medium">
          {destacado}
        </p>
      ) : null}
    </div>
  );
}

/**
 * La espiral sin coreografía: touch, reduced-motion y el SSR. Las dos
 * listas en flujo, con la espiral formada a un costado. `#evidencia` es el
 * ancla de la segunda vuelta. Es la que muestra el texto completo de cada
 * estación, la bisagra y el título de la evidencia.
 *
 * En modo movil (el section lleva data-modo) la grilla pasa a bloque: si la
 * espiral y el texto quedan en filas distintas de la grilla, el sticky de la
 * espiral no tiene recorrido (su fila mide lo que ella). Como bloque, los dos
 * comparten contenedor y la espiral acompaña la lectura pegada arriba.
 */
export function EspiralEstatica({ contenido }: { contenido: Ciclo }) {
  const { pedagogico, evidencia } = contenido;
  return (
    <div className="relative z-10 mx-auto grid w-full max-w-screen-xl gap-x-16 gap-y-12 px-6 py-20 md:px-12 lg:grid-cols-[0.9fr_1.1fr] [[data-modo=movil]_&]:block">
      <div className="mx-auto w-full max-w-[420px] lg:sticky lg:top-24 lg:self-start [[data-modo=movil]_&]:sticky [[data-modo=movil]_&]:top-[4.75rem] [[data-modo=movil]_&]:z-10 [[data-modo=movil]_&]:-mx-6 [[data-modo=movil]_&]:mb-10 [[data-modo=movil]_&]:h-[36lvh] [[data-modo=movil]_&]:w-auto [[data-modo=movil]_&]:max-w-none [[data-modo=movil]_&]:bg-white/95 [[data-modo=movil]_&]:px-6 [[data-modo=movil]_&]:py-2 [[data-modo=movil]_&]:backdrop-blur md:[[data-modo=movil]_&]:-mx-12 md:[[data-modo=movil]_&]:px-12">
        <EspiralSvg className="[[data-modo=movil]_&]:mx-auto [[data-modo=movil]_&]:h-full [[data-modo=movil]_&]:w-auto" />
      </div>
      <div className="space-y-16">
        <div>
          <h2 className="font-display max-w-[18ch] text-h2 font-extrabold tracking-[-0.02em]">
            <ConResaltado texto={contenido.titulo} />
          </h2>
          <ol className="mt-8 space-y-8">
            {pedagogico.map((e, i) => (
              <li key={numero(i)} data-estacion={i}>
                <Bloque {...e} numeroTexto={numero(i)} />
              </li>
            ))}
          </ol>
          <p className="font-display mt-8 max-w-[34ch] text-[1.25rem] leading-[1.4] font-medium">
            {contenido.bisagra}
          </p>
        </div>
        <div id="evidencia">
          <h2 className="font-display max-w-[18ch] text-h2 font-extrabold tracking-[-0.02em]">
            <ConResaltado texto={contenido.tituloEvidencia} />
          </h2>
          <p className="mt-5 max-w-[42ch] text-body">{contenido.remate}</p>
          <ol className="mt-8 space-y-8">
            {evidencia.map((e, i) => (
              <li key={numero(i + pedagogico.length)} data-estacion={i + pedagogico.length}>
                <Bloque {...e} numeroTexto={numero(i + pedagogico.length)} />
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
