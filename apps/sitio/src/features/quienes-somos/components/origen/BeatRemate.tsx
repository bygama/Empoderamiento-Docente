import { Fragment } from "react";
import { fragmentos } from "@/lib/contenido/resaltado";
import { Palabras } from "./Palabras";

/**
 * La frase en TRAMOS (cada parte resaltada o sin resaltar), y cada tramo
 * palabra por palabra. `desde` es el lugar del tramo en la frase: su clave.
 */
function tramos(frase: string): Array<{ desde: number; verde: boolean; palabras: string[] }> {
  let desde = 0;
  return fragmentos(frase)
    .map((f) => {
      const tramo = { desde, verde: f.resaltado, palabras: f.texto.split(/\s+/).filter((p) => p !== "") };
      desde += f.texto.length;
      return tramo;
    })
    .filter((t) => t.palabras.length > 0);
}

/**
 * BEAT 4: «Vivir para hacer vivir». En escritorio las palabras convergen
 * desde el blur, centradas, en la línea que les toque. Bajo `lg`, con el
 * pasador de capítulos, cada tramo va en su renglón: la frase empieza y
 * termina con la misma palabra, y apilada ese espejo se ve —los tramos verdes
 * grandes, lo del medio más chico—, siempre centrada (Gastón, 2026-10-02: a la
 * izquierda no).
 * Los renglones salen de lo que el contenido marca en verde: si la frase
 * cambia en el admin, la composición la sigue.
 */
export function BeatRemate({ frase, texto }: { frase: string; texto: string }) {
  const lista = tramos(frase);
  return (
    <div
      data-beat="4"
      className="flex h-full flex-col items-center justify-center px-6 text-center motion-reduce:h-auto motion-reduce:py-24 [[data-modo=quieto]_&]:h-auto max-lg:[[data-modo=quieto]_&]:py-16"
    >
      <h3
        className="font-display font-bold tracking-[-0.02em]"
        style={{ fontSize: "clamp(2.6rem, 1rem + 5.6vw, 5.4rem)", lineHeight: 1.05 }}
      >
        {lista.map((tramo, i) => (
          <Fragment key={tramo.desde}>
            {i > 0 ? " " : null}
            <span
              data-fin-tramo
              className={
                tramo.verde
                  ? "text-verde-concepto max-lg:[[data-modo=movil]_&]:block max-lg:[[data-modo=movil]_&]:text-[1.3em]"
                  : "text-white max-lg:[[data-modo=movil]_&]:block max-lg:[[data-modo=movil]_&]:py-[0.18em] max-lg:[[data-modo=movil]_&]:text-[0.62em] max-lg:[[data-modo=movil]_&]:font-medium max-lg:[[data-modo=movil]_&]:tracking-normal"
              }
            >
              {tramo.palabras.map((palabra, k) => (
                <Fragment key={`${tramo.desde}-${palabra}`}>
                  {k > 0 ? " " : null}
                  <span data-fin-word className="inline-block">
                    {palabra}
                  </span>
                </Fragment>
              ))}
            </span>
          </Fragment>
        ))}
      </h3>
      <span
        data-fin-rule
        aria-hidden="true"
        className="bg-verde-concepto mt-8 block h-[2px] w-24 origin-center rounded-full"
      />
      <p
        data-fin-sub
        className="text-azul-claro/85 mt-7 max-w-[50ch] font-sans text-[1.02rem] leading-relaxed md:text-[1.15rem]"
      >
        <Palabras texto={texto} />
      </p>
    </div>
  );
}
