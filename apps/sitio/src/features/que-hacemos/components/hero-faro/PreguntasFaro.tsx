import { Highlight } from "@/components/ui/Highlight";
import { partirResaltado } from "@/lib/contenido/resaltado";
import { VERBO_POS } from "../preguntas-faro";

/**
 * Dónde va cada frase en celular y tablet (pisa VERBO_POS, que es de
 * escritorio y va en línea: de ahí los `!`). Siempre del lado OPUESTO al
 * faro (coreografia-faro-movil.ts):
 *  · la tesis, con el faro a la izquierda: a todo el ancho y alineada a la
 *    derecha, para cerrar en tres renglones; su franja termina lejos de la
 *    punta de la torre.
 *  · las otras tres, con el faro a la derecha, a la izquierda y cada una a
 *    una ALTURA distinta —arriba, al medio, a la altura de la linterna—:
 *    la luz va bajando por el cielo de frase en frase en vez de apuntar
 *    siempre al mismo lugar (Gastón, 2026-09-23). La de abajo, más angosta:
 *    ahí la torre y su baranda están más cerca.
 */
const ZONA_MOVIL = [
  "max-lg:top-[max(6rem,13svh)]! max-lg:bottom-[calc(48%+7.5rem)]! max-lg:right-5! max-lg:left-5! max-lg:items-center max-lg:justify-end max-lg:text-right! md:max-lg:right-10! md:max-lg:left-10!",
  "max-lg:top-[max(6rem,13svh)]! max-lg:bottom-[calc(48%+1.5rem)]! max-lg:right-[30%]! max-lg:left-5! max-lg:items-start max-lg:text-left! md:max-lg:left-10!",
  "max-lg:top-[max(6rem,13svh)]! max-lg:bottom-[calc(48%+1.5rem)]! max-lg:right-[30%]! max-lg:left-5! max-lg:items-center max-lg:text-left! md:max-lg:left-10!",
  "max-lg:top-[56%]! max-lg:bottom-auto! max-lg:right-[36%]! max-lg:left-5! max-lg:items-start max-lg:text-left! md:max-lg:left-10!",
] as const;

/** S2 · Las cuatro frases del enfoque: un golpe por momento. Cada una trae su palabra clave entre dobles asteriscos. */
export function PreguntasFaro({ frases }: { frases: readonly string[] }) {
  return (
    <>
      {frases.map((frase, i) => {
        const { antes, clave, despues: resto } = partirResaltado(frase);
        // La primera frase es la tesis: un escalón más grande y más
        // ancha que las tres que se desprenden de ella.
        const lider = i === 0;
        return (
          <div
            key={frase}
            data-verbo-txt={i}
            aria-hidden="true"
            // La líder cierra en tres líneas («No capacitamos docentes: /
            // transformamos la relación / con las matemáticas.»): 50rem,
            // pero nunca más de 60vw para que en desktops angostos no se
            // meta bajo la torre. En celular y tablet: ZONA_MOVIL.
            className={`pointer-events-none absolute ${lider ? "max-w-[min(50rem,60vw)]" : "max-w-[26rem]"} max-lg:flex max-lg:max-w-none! max-lg:[transform:none]! ${ZONA_MOVIL[i]}`}
            style={VERBO_POS[i]}
          >
            {/* La palabra clave: celeste (la luz la toca) + subrayado
                verde pintado por la coreografía (background-size 0→100%,
                mismo mecanismo que el mensaje central). Sombra suave
                para despegar el texto del cielo. */}
            <p
              data-v
              className={`${lider ? "max-lg:text-[min(calc((100vw-2.5rem)/14.6),2.4rem)]! max-lg:text-balance md:max-lg:text-[min(calc((100vw-5rem)/14.6),2.4rem)]!" : "max-lg:text-[clamp(1.4rem,1rem+2vw,2rem)]!"} font-display font-bold tracking-[-0.02em] text-white [text-shadow:0_2px_28px_rgb(6_11_25/0.6)] [&_mark]:text-azul-claro [&_mark]:bg-[linear-gradient(var(--color-verde-concepto),var(--color-verde-concepto))] [&_mark]:bg-no-repeat [&_mark]:[background-position:0_96%] [&_mark]:[background-size:0%_0.12em] [&_mark]:no-underline`}
              style={{
                // En celular y tablet, un escalón menos (la clase pisa al
                // estilo en línea): la columna es angosta.
                fontSize: lider
                  ? "clamp(2.2rem, 1.2rem + 2.4vw, 3.4rem)"
                  : "clamp(1.6rem, 1rem + 1.6vw, 2.4rem)",
                lineHeight: lider ? 1.1 : 1.18,
                opacity: 0,
              }}
            >
              {antes}
              <Highlight>{clave}</Highlight>
              {resto}
            </p>
          </div>
        );
      })}
    </>
  );
}
