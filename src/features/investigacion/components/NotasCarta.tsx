import Image from "next/image";
import type { ReactNode } from "react";
import { Highlight } from "@/components/ui/Highlight";

/**
 * Una nota del sobre: una hoja más del archivo (la 01 es la historia del
 * hero). Corta a propósito: se lee de una pasada, sin scroll propio, con
 * un solo peso que importa (decisión 2026-09-11: menos es más).
 *
 * En la coreografía (`live`) las dos viven adentro del sobre, entre la
 * solapa y el cuerpo, y salen por la boca; estáticas, van en flujo una
 * bajo la otra.
 */
function Nota({
  folio,
  live,
  children,
}: {
  folio: string;
  live: boolean;
  children: ReactNode;
}) {
  return (
    <article
      data-carta-nota
      className={`bg-grain-light text-azul-principal rounded-[3px] bg-white px-10 py-9 shadow-[0_30px_70px_-30px_rgb(0_0_0/0.55)] lg:px-14 lg:py-11 ${
        live
          ? "absolute top-5 left-1/2 z-10 w-[calc(100%-3.5rem)] -translate-x-1/2"
          : "relative mx-auto mt-10 max-w-3xl first-of-type:mt-14"
      }`}
    >
      <span className="text-gris-texto/70 font-mono text-[0.68rem] tracking-[0.2em] uppercase">
        {folio}
      </span>
      {children}
    </article>
  );
}

/** Nota 1 — la pregunta. Copy del doc maestro §4, recortado a la pregunta
 *  sola: el título de la sección ya dice «Nacimos de una pregunta», y la
 *  nota lo repetía («Empoderamiento Docente nació de una pregunta:») antes
 *  de hacerla (Facundo, 2026-09-12). */
export function LaPregunta({ live }: { live: boolean }) {
  return (
    <Nota folio="Archivo ED · Hoja 02" live={live}>
      <p className="font-display mt-6 text-[1.42rem] leading-[1.32] font-semibold lg:text-[1.62rem]">
        ¿Qué sucede cuando las y los docentes transforman su relación con el
        saber matemático escolar?
      </p>
      <p className="text-azul-principal/85 mt-6 text-[0.98rem] leading-[1.7] lg:text-[1.02rem]">
        Esa pregunta sigue orientando todo lo que hacemos.
      </p>
    </Nota>
  );
}

/** Nota 2 — la postura, con las perspectivas transversales como posdata. */
export function LaPostura({ live }: { live: boolean }) {
  return (
    <Nota folio="Archivo ED · Hoja 03" live={live}>
      <p className="font-display mt-6 text-[1.42rem] leading-[1.32] font-semibold lg:text-[1.62rem]">
        No investigamos para observar la escuela desde afuera.{" "}
        <Highlight>Investigamos con los contextos educativos</Highlight>.
      </p>
      <p className="text-gris-texto mt-6 text-[0.86rem] leading-[1.6]">
        <span className="text-azul-principal/70 mr-2 font-mono text-[0.7rem] tracking-[0.16em] uppercase">
          P. D.
        </span>
        Género, inclusión, derechos humanos, ciudadanía y justicia social son
        criterios con los que investigamos.
      </p>
      <div className="mt-7 flex items-center justify-between">
        <Image
          src="/brand/logotipo-principal-ed.png"
          alt="Empoderamiento Docente"
          width={160}
          height={40}
          className="h-7 w-auto opacity-90"
        />
        <span className="text-gris-texto/60 font-mono text-[0.66rem] tracking-[0.18em] uppercase">
          Investigar para transformar
        </span>
      </div>
    </Nota>
  );
}
