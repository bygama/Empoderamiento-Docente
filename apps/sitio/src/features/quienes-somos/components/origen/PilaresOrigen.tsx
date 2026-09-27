import { SplitChars } from "@/components/ui/SplitChars";
import type { OrigenDeQuienesSomos } from "@/features/quienes-somos/contenido/origen";
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
export function PilaresOrigen({ contenido }: { contenido: OrigenDeQuienesSomos }) {
  const { origen, sentido, evolucion } = contenido;
  return (
    <>
      {/* ── BEAT 0 · 01 Origen ──────────────────────────────────────── */}
      <Pilar
        i={0}
        titulo={
          <h2 className={`${PILAR_TITULO} mx-auto md:mx-0 md:max-w-[13ch]`}>
            <SplitChars text={origen.titulo} />
          </h2>
        }
        cuerpo={
          <p className={PILAR_CUERPO}>
            {origen.texto}
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
            {/* Tres renglones, cada uno en su máscara; el tercero en verde. */}
            {sentido.cita.map((renglon, i) => (
              <span key={renglon} className="block overflow-hidden">
                <span data-quote-line className={i === 2 ? "text-verde-concepto block" : "block"}>
                  {renglon}
                </span>
              </span>
            ))}
          </blockquote>
        }
        cuerpo={
          <p data-quote-sub className={PILAR_CUERPO}>
            {sentido.quien}
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
            <SplitChars text={evolucion.pregunta} />
            <span
              data-caret
              aria-hidden="true"
              className="bg-verde-concepto ml-2 inline-block h-[0.9em] w-[3px] translate-y-[0.12em] animate-pulse rounded-full"
            />
          </h3>
        }
        cuerpo={
          <p data-sub className={PILAR_CUERPO}>
            {evolucion.respuesta}
          </p>
        }
      />
    </>
  );
}
