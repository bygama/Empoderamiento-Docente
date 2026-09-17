import { SplitChars } from "@/components/ui/SplitChars";
import { PREGUNTA } from "./data";
import { PILAR_CUERPO, PILAR_TITULO } from "./estilos";
import { Pilar } from "./Pilar";

/**
 * Los beats 0–2: los TRES PILARES (01 Origen · 02 Sentido · 03 Evolución).
 * Comparten la cáscara `Pilar`: misma grilla, misma jerarquía y cajas de
 * altura reservada. Al cruzarse cambia el contenido, nunca la posición: la
 * regla verde, la etiqueta, el título y el cuerpo caen siempre en la misma
 * línea. Fragment: los tres siguen siendo hijos directos de `[data-story-tilt]`
 * (la coreografía los superpone con `position: absolute`).
 */
export function PilaresOrigen() {
  return (
    <>
      {/* ── BEAT 0 · 01 Origen ──────────────────────────────────────── */}
      <Pilar
        i={0}
        titulo={
          <h2 className={`${PILAR_TITULO} mx-auto md:mx-0 md:max-w-[13ch]`}>
            <SplitChars text="No nacimos de una teoría." />
          </h2>
        }
        cuerpo={
          <p className={PILAR_CUERPO}>
            Nacimos en aulas reales, discutiendo la matemática a fondo con
            docentes de distintos estados de México.
          </p>
        }
      />

      {/* ── BEAT 1 · 02 Sentido — la cita de la profesora ─────────────
          Misma caja tipográfica que los otros dos pilares: la cita ES el
          título del beat (no una tarjeta aparte). La comilla cuelga en el
          margen para que las tres líneas alineen su filo izquierdo con
          los títulos vecinos. Dramatización del testimonio (video 2) —
          validar con cliente. ── */}
      <Pilar
        i={1}
        titulo={
          <blockquote
            data-quote-card
            className={`${PILAR_TITULO} relative`}
          >
            {/* Comilla: marca centrada sobre la cita en mobile y volada
                al margen en desktop, para que las tres líneas alineen
                su filo izquierdo con los títulos de los otros pilares. */}
            <span
              data-quote-mark
              aria-hidden="true"
              className="text-verde-concepto block [font-size:1.7em] [line-height:0.72] md:absolute md:top-[0.04em] md:right-full md:mr-[0.1em] md:[font-size:1em] md:[line-height:1]"
            >
              “
            </span>
            <span className="block overflow-hidden">
              <span data-quote-line className="block">
                Estaba a punto de jubilarme.
              </span>
            </span>
            <span className="block overflow-hidden">
              <span data-quote-line className="block">
                Ahora quiero volver:
              </span>
            </span>
            <span className="block overflow-hidden">
              <span data-quote-line className="text-verde-concepto block">
                quiero transformar el aula.
              </span>
            </span>
          </blockquote>
        }
        cuerpo={
          <p data-quote-sub className={PILAR_CUERPO}>
            — Una profesora, al cerrar uno de los primeros encuentros de
            formación docente en México.
          </p>
        }
      />

      {/* ── BEAT 2 · 03 Evolución (typewriter por scroll) ───────────── */}
      <Pilar
        i={2}
        titulo={
          <h3
            data-type
            className={`${PILAR_TITULO} mx-auto md:mx-0 md:max-w-[15ch]`}
          >
            <SplitChars text={PREGUNTA} />
            <span
              data-caret
              aria-hidden="true"
              className="bg-verde-concepto ml-2 inline-block h-[0.9em] w-[3px] translate-y-[0.12em] animate-pulse rounded-full"
            />
          </h3>
        }
        cuerpo={
          <p data-sub className={PILAR_CUERPO}>
            Esa convicción se volvió maestría, doctorado e investigación, y
            después procesos de desarrollo profesional en México y
            Argentina.
          </p>
        }
      />
    </>
  );
}
