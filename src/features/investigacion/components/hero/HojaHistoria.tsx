import { Fragment } from "react";
import { FIGURAS } from "../constelacion";

/**
 * La hoja 01 del archivo: el papel donde corre la historia de los cuatro
 * beats. A la izquierda, el hueco donde aterriza la bandada y se arma la
 * constelación (los puntos viven en su propia capa, encima de la hoja:
 * Bandada.tsx; el hueco solo dice dónde y de qué tamaño); a la derecha,
 * riel 01–04, verbo que se releva y frase que se pinta palabra por palabra
 * (la bajada del doc maestro vive repartida en esas cuatro frases:
 * constelacion.ts → frase).
 *
 * Llega subiendo desde abajo sobre la noche al ritmo del scroll y se queda
 * enmarcada por ella (inset-2.5: la canaleta deja ver el cielo alrededor,
 * como una hoja sobre un escritorio a oscuras). Invisible hasta que la
 * coreografía la muestra, y siempre si no corre: touch y reduced-motion ven
 * el hero de noche y nada más (coreografia-historia.ts).
 */
export function HojaHistoria() {
  return (
    <div
      data-hero-hoja
      aria-hidden="true"
      className="bg-grain-light text-azul-principal pointer-events-none invisible absolute inset-2.5 z-40 overflow-hidden rounded-xl bg-white shadow-[0_-24px_60px_-28px_rgb(0_0_0/0.7)]"
    >
      {/* Folio de archivo (guiño al remate de la pila de expedientes). */}
      <span className="text-gris-texto/70 absolute top-7 right-8 font-mono text-[0.68rem] tracking-[0.2em] uppercase">
        Archivo ED · Hoja 01
      </span>

      <div className="mx-auto grid h-full w-full max-w-screen-xl items-center gap-x-16 px-6 md:px-12 lg:grid-cols-[0.95fr_1.05fr]">
        {/* El hueco de la lámina: mismo aspecto que el viewBox de las
            figuras (400x480). La coreografía lo mide para saber dónde
            aterriza la bandada. */}
        <div>
          <div
            data-historia-destino
            className="mx-auto aspect-[400/480] w-full max-w-[min(460px,54svh)]"
          />
        </div>

        <div className="max-w-[44ch]">
          {/* Riel 01–04: la brújula de la historia. */}
          <div
            data-riel
            className="flex items-center gap-3 font-mono text-[0.7rem] tracking-[0.22em] uppercase"
          >
            {FIGURAS.map((f, i) => (
              <Fragment key={f.id}>
                <span data-riel-numero className="text-gris-texto/80 tabular-nums">
                  0{i + 1}
                </span>
                {i < FIGURAS.length - 1 && (
                  <span className="bg-azul-principal/15 relative h-px w-12 overflow-hidden">
                    <span
                      data-riel-relleno
                      className="bg-verde-concepto absolute inset-0 origin-left"
                    />
                  </span>
                )}
              </Fragment>
            ))}
          </div>

          {/* El verbo que se releva (empujado hacia arriba por el nuevo). */}
          {/* h holgada para los descendentes (la «g» de Preguntar) sin
              soltar el overflow-hidden que necesita el relevo. */}
          <div className="font-display text-azul-principal relative mt-8 h-[1.5em] overflow-hidden text-[2.1rem] leading-[1.35] font-extrabold tracking-[-0.02em] lg:text-[2.5rem]">
            {FIGURAS.map((f) => (
              <span key={f.id} data-verbo className="absolute inset-0">
                {f.etiqueta}
              </span>
            ))}
          </div>

          {/* La frase que se pinta palabra por palabra. */}
          <div className="text-azul-principal/15 mt-5 grid max-w-[38ch] text-[1.05rem] leading-relaxed lg:text-[1.15rem]">
            {FIGURAS.map((f) => (
              <p key={f.id} data-frase className="col-start-1 row-start-1">
                {f.frase.split(" ").map((palabra, k) => (
                  <span key={k} data-palabra>
                    {palabra}{" "}
                  </span>
                ))}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
