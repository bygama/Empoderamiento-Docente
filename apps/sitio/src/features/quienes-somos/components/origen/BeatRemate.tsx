import { Fragment } from "react";
import { PALABRAS_REMATE } from "./data";

/** BEAT 4: «Vivir para hacer vivir» — las palabras convergen desde el blur. */
export function BeatRemate() {
  return (
    <div
      data-beat="4"
      className="flex h-full flex-col items-center justify-center px-6 text-center motion-reduce:h-auto motion-reduce:py-24"
    >
      <h3
        className="font-display font-bold tracking-[-0.02em]"
        style={{ fontSize: "clamp(2.6rem, 1rem + 5.6vw, 5.4rem)", lineHeight: 1.05 }}
      >
        {PALABRAS_REMATE.map((w, i) => (
          <Fragment key={w}>
            <span
              data-fin-word
              className={`inline-block ${
                i === 0 || i === 3 ? "text-verde-concepto" : "text-white"
              }`}
            >
              {w}
            </span>
            {i < 3 ? " " : null}
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
        Para transformar el aprendizaje, el cuerpo docente necesita
        primero vivir una nueva relación con la matemática.
      </p>
    </div>
  );
}
