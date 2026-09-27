import { partirResaltado } from "@/lib/contenido/resaltado";
import type { Perspectiva } from "./constelacion-mirada";

type Props = {
  p: Perspectiva;
  i: number;
  live: boolean;
};

/**
 * Zona de lectura de un principio: frase tachada, afirmativa y acento. Con
 * la escena viva, `prepararEstados` la ancla a la derecha del viewport; sin
 * motion queda apilada en flow.
 */
export function DetallePerspectiva({ p, i, live }: Props) {
  // La frase va sin punto (lo pone el sitio) y lo tachado es su parte entre
  // dobles asteriscos; la afirmación destaca la suya.
  const frase = partirResaltado(p.frase);
  const afirmacion = partirResaltado(p.afirmacion);
  return (
    <div
      data-detalle={i}
      className={"motion-reduce:py-14" + (live ? "" : " py-14")}
    >
      <div
        data-detalle-inner
        className={
          "mx-auto max-w-xl text-center " + (live ? "px-0" : "px-6")
        }
      >
        {/* Barra de acento decorativa: el color identifica al
            principio sin comprometer el contraste del texto. Queda
            sola —sin la etiqueta «01 — Pensamiento matemático»—:
            ese dato ya lo dice el nodo del mapa, al que la cámara
            está apuntando mientras se lee este bloque. */}
        <span
          aria-hidden="true"
          className={
            "mb-5 block h-[3px] w-8 rounded-full " +
            (live ? "mx-0" : "mx-auto")
          }
          style={{ backgroundColor: p.accent }}
        />
        <h3
          className="font-display text-azul-principal font-bold tracking-[-0.02em]"
          style={{ fontSize: "clamp(1.7rem, 1rem + 1.6vw, 2.4rem)", lineHeight: 1.14 }}
        >
          {frase.antes}
          {frase.clave === null ? null : (
            <span className="relative inline-block whitespace-nowrap">
              <span className="text-azul-principal/70">{frase.clave}</span>
              <span
                data-strike
                aria-hidden="true"
                className="bg-azul-principal/60 absolute top-1/2 left-0 h-[0.07em] w-full -translate-y-1/2 rounded-full"
              />
            </span>
          )}
          {`${frase.despues}.`}
        </h3>
        <p
          className="font-display text-azul-principal mt-3 font-semibold"
          style={{ fontSize: "clamp(1.25rem, 0.9rem + 1vw, 1.7rem)", lineHeight: 1.25 }}
        >
          {afirmacion.antes}
          {p.acentoTexto ? (
            <span style={{ color: p.acentoTexto }}>{afirmacion.clave}</span>
          ) : (
            <span className="relative inline-block">
              {afirmacion.clave}
              {/* Subrayado editorial: se dibuja izq→der con el scroll */}
              <span
                data-afirma-underline
                aria-hidden="true"
                className="absolute -bottom-[0.05em] left-0 h-[0.06em] w-full rounded-full"
                style={{ backgroundColor: p.accent }}
              />
            </span>
          )}
          {afirmacion.despues}
        </p>
      </div>
    </div>
  );
}
