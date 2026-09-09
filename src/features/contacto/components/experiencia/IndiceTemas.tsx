import { ArrowRight } from "@/components/ui/icons";
import { CanalDirecto } from "../CanalDirecto";
import { TEMAS, type TemaKey } from "./data";

type Props = {
  /** Recibe el tema y la tarjeta clickeada (la coreografía la apaga primero). */
  onElegir: (key: TemaKey, cardEl: HTMLElement) => void;
};

/**
 * Índice de temas: cada tema es una TARJETA-BOTÓN. Superficie clara con borde
 * en reposo (lee como algo clickeable, no como una lista de texto), ícono de
 * marca a la izquierda para identificar el tema y una flecha SIEMPRE visible
 * a la derecha que se enciende y avanza en hover. Al pie, el canal directo.
 */
export function IndiceTemas({ onElegir }: Props) {
  return (
    <div className="mt-10 lg:mt-0" role="group" aria-label="Tema de la consulta">
      {/* En pantallas bajas (≤ 860px de alto) las filas se compactan para
          que los cinco temas entren sin scroll interno (ver el panel); en
          las muy bajas (≤ 760px: laptop escalada, 1440×690) se aprietan
          un poco más. El CONTENIDO (número, título, detalle) es el mismo en
          todas: se gana espacio en márgenes e interlineado, nunca sacando
          información (Gastón, 2026-09-09). */}
      <div className="flex flex-col gap-2.5 [@media(max-height:860px)_and_(min-height:761px)]:gap-2 [@media(max-height:760px)]:gap-1.5">
        {TEMAS.map((t, i) => (
          <button
            key={t.key}
            type="button"
            data-tema-card
            onClick={(e) => onElegir(t.key, e.currentTarget)}
            className="group border-azul-claro/45 hover:border-verde-concepto/50 focus-visible:outline-verde-concepto flex items-center gap-4 rounded-xl border bg-white/55 px-4 py-3 text-left transition-[border-color,background-color,box-shadow] duration-300 hover:bg-white hover:shadow-[0_16px_36px_-22px_rgb(31_45_77/0.45)] focus-visible:outline-2 focus-visible:-outline-offset-2 md:gap-5 md:px-5 md:py-3.5 [@media(max-height:860px)_and_(min-height:761px)]:md:py-2.5 [@media(max-height:760px)]:md:py-2"
          >
            {/* Baldosa de ícono de marca (identifica el tema). */}
            <span
              className="border-azul-claro/50 group-hover:border-verde-concepto/60 group-hover:bg-verde-concepto/10 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border bg-white transition-colors duration-300"
              aria-hidden="true"
            >
              <t.Icon
                size={22}
                className="text-azul-medio group-hover:text-verde-concepto transition-colors duration-300"
              />
            </span>
            <span className="min-w-0 flex-1">
              {/* Número a la IZQUIERDA del título, centrado con él en la
                  misma línea (Gastón, 2026-09-09); antes iba arriba. */}
              <span
                data-row-titulo
                className="font-display text-azul-principal flex items-center gap-2.5 text-[1.15rem] leading-snug font-bold tracking-[-0.01em] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 md:text-[1.3rem] [@media(max-height:760px)]:leading-tight"
              >
                <span className="text-verde-concepto/80 font-mono text-[0.66rem] font-medium tracking-[0.12em] tabular-nums">
                  0{i + 1}
                </span>
                <span>{t.titulo}</span>
              </span>
              <span className="text-gris-texto mt-0.5 hidden font-sans text-[0.83rem] leading-relaxed sm:block [@media(max-height:760px)]:mt-0 [@media(max-height:760px)]:leading-snug">
                {t.detalle}
              </span>
            </span>
            {/* Flecha SIEMPRE visible: la señal de que la fila es una
                acción. Se enciende y avanza en hover. */}
            <ArrowRight
              size={20}
              aria-hidden="true"
              className="text-azul-medio/45 group-hover:text-verde-concepto shrink-0 transition-[color,translate] duration-300 group-hover:translate-x-1"
            />
          </button>
        ))}
      </div>

      {/* Canal directo (antes en la barra fija): al pie del índice,
          jerarquía menor. Centrado bajo la columna del índice. */}
      <div data-ap-head className="mt-5 text-center [@media(max-height:860px)_and_(min-height:761px)]:mt-3.5 [@media(max-height:760px)]:mt-2.5">
        <p className="text-gris-texto font-sans text-[0.85rem]">
          ¿Preferís escribir directo?
        </p>
        <CanalDirecto className="mt-2.5" />
      </div>
    </div>
  );
}
