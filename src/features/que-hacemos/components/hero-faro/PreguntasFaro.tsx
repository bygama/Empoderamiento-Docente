import { Highlight } from "@/components/ui/Highlight";
import { PREGUNTAS, VERBO_POS } from "../preguntas-faro";

/** S2 · Los cinco verbos: un golpe narrativo por momento. */
export function PreguntasFaro() {
  return (
    <>
      {PREGUNTAS.map(({ antes, clave, resto }, i) => {
        // La primera pregunta es la tesis: un escalón más grande y más
        // ancha que las cuatro que se desprenden de ella.
        const lider = i === 0;
        return (
          <div
            key={clave}
            data-verbo-txt={i}
            aria-hidden="true"
            // La líder cierra en dos líneas («…transformar y por qué?»
            // entera en la segunda): 44rem, pero nunca más de 54vw para
            // que en desktops angostos no se meta bajo la torre.
            className={`pointer-events-none absolute ${lider ? "max-w-[min(44rem,54vw)]" : "max-w-[26rem]"}`}
            style={VERBO_POS[i]}
          >
            {/* La palabra clave: celeste (la luz la toca) + subrayado
                verde pintado por la coreografía (background-size 0→100%,
                mismo mecanismo que el mensaje central). Sombra suave
                para despegar el texto del cielo. */}
            <p
              data-v
              className="font-display font-bold tracking-[-0.02em] text-white [text-shadow:0_2px_28px_rgb(6_11_25/0.6)] [&_mark]:text-azul-claro [&_mark]:bg-[linear-gradient(var(--color-verde-concepto),var(--color-verde-concepto))] [&_mark]:bg-no-repeat [&_mark]:[background-position:0_96%] [&_mark]:[background-size:0%_0.12em] [&_mark]:no-underline"
              style={{
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
