import { Highlight } from "@/components/ui/Highlight";
import { ROTULO_MICRO } from "../casos/tintes";
import { EspiralSvg } from "./EspiralSvg";
import {
  BISAGRA_TEXTO,
  REMATE_TEXTO,
  VUELTA_1,
  VUELTA_2,
  numero,
  type Estacion,
} from "./estaciones";

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
 * ancla de la segunda vuelta.
 */
export function EspiralEstatica() {
  return (
    <div className="relative z-10 mx-auto grid w-full max-w-screen-xl gap-x-16 gap-y-12 px-6 py-20 md:px-12 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="mx-auto w-full max-w-[420px] lg:sticky lg:top-24 lg:self-start">
        <EspiralSvg />
      </div>
      <div className="space-y-16">
        <div>
          <h2 className="font-display max-w-[18ch] text-h2 font-extrabold tracking-[-0.02em]">
            Cómo una <Highlight>experiencia</Highlight> se convierte en
            transformación.
          </h2>
          <ol className="mt-8 space-y-8">
            {VUELTA_1.map((e, i) => (
              <li key={e.nombre}>
                <Bloque {...e} numeroTexto={numero(i)} />
              </li>
            ))}
          </ol>
          <p className="font-display mt-8 max-w-[34ch] text-[1.25rem] leading-[1.4] font-medium">
            {BISAGRA_TEXTO}
          </p>
        </div>
        <div id="evidencia">
          <h2 className="font-display max-w-[18ch] text-h2 font-extrabold tracking-[-0.02em]">
            Implementar no es <Highlight>terminar</Highlight>.
          </h2>
          <p className="mt-5 max-w-[42ch] text-body">{REMATE_TEXTO}</p>
          <ol className="mt-8 space-y-8">
            {VUELTA_2.map((e, i) => (
              <li key={e.nombre}>
                <Bloque {...e} numeroTexto={numero(i + VUELTA_1.length)} />
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
