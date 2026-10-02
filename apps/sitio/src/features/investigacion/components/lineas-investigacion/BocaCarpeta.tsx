import { Pestana } from "@/features/investigacion/casos/Garabatos";
import { ROTULO_TAB } from "@/features/investigacion/casos/tintes";

/** Puntas de papel asomando por la boca de la carpeta (mal guardadas). */
const PAPELES = [
  "left-[42%] -top-[9px] h-4 w-24 rotate-[0.6deg] bg-white/95",
  "left-[54%] -top-[6px] h-3.5 w-14 -rotate-[1deg] bg-white/75",
  "left-[70%] -top-[8px] h-4 w-28 rotate-[0.3deg] bg-white/90",
] as const;

/**
 * El canto de arriba de la carpeta de Líneas: la pestaña troquelada con su
 * rótulo de archivo, los papeles que asoman por la boca y el canto
 * iluminado de la tapa. Todo decorado: el rótulo es la estructura del
 * archivo, no copy.
 */
export function BocaCarpeta() {
  return (
    <>
      {/* Pestaña troquelada, grande como en la referencia. */}
      <span
        aria-hidden="true"
        className="text-azul-claro absolute -top-12 left-[4vw] z-0 block h-12 w-[22rem] max-md:left-0 max-md:w-[min(21.5rem,100%)] lg:-top-14 lg:left-[13vw] lg:h-14 lg:w-[26rem]"
      >
        <Pestana className="h-full w-full">
          <span className={`${ROTULO_TAB} text-azul-principal whitespace-nowrap max-md:text-[0.66rem] max-md:tracking-[0.1em]`}>
            02 · Líneas de investigación
          </span>
        </Pestana>
      </span>

      {/* Papeles mal guardados asomando por la boca. En celular no van: la
          carpeta es angosta y las puntas se salían por el costado. */}
      {PAPELES.map((clases) => (
        <span
          key={clases}
          aria-hidden="true"
          className={`pointer-events-none absolute z-0 block rounded-t-[3px] shadow-[0_-2px_5px_-2px_rgb(31_45_77/0.4)] max-md:hidden ${clases}`}
        />
      ))}

      {/* Canto iluminado de la tapa. */}
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-white/40" />
    </>
  );
}
