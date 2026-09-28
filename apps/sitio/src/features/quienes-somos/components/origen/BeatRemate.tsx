import { Fragment } from "react";
import { fragmentos } from "@/lib/contenido/resaltado";

/** La frase, palabra por palabra; cada una en verde si cae en una parte resaltada. */
function palabras(frase: string): Array<{ palabra: string; verde: boolean }> {
  return fragmentos(frase).flatMap((f) =>
    f.texto
      .split(/\s+/)
      .filter((palabra) => palabra !== "")
      .map((palabra) => ({ palabra, verde: f.resaltado })),
  );
}

/** BEAT 4: «Vivir para hacer vivir» — las palabras convergen desde el blur. */
export function BeatRemate({ frase, texto }: { frase: string; texto: string }) {
  const lista = palabras(frase);
  return (
    <div
      data-beat="4"
      className="flex h-full flex-col items-center justify-center px-6 text-center motion-reduce:h-auto motion-reduce:py-24 [[data-modo=quieto]_&]:h-auto max-lg:[[data-modo=quieto]_&]:py-16"
    >
      <h3
        className="font-display font-bold tracking-[-0.02em]"
        style={{ fontSize: "clamp(2.6rem, 1rem + 5.6vw, 5.4rem)", lineHeight: 1.05 }}
      >
        {lista.map(({ palabra, verde }, i) => (
          <Fragment key={palabra}>
            <span
              data-fin-word
              className={`inline-block ${verde ? "text-verde-concepto" : "text-white"}`}
            >
              {palabra}
            </span>
            {i < lista.length - 1 ? " " : null}
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
        {texto}
      </p>
    </div>
  );
}
