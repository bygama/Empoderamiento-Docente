import Image from "next/image";
import type { Puente } from "@/features/biblioteca/contenido/puente";
import { estiloDeFoco } from "@/lib/contenido/fotos";
import { numeroDeRecurso } from "./numero";
import type { Tema } from "./temas";

/**
 * Un panel de la pila: el lomo (número y nombre de abajo hacia arriba, lo
 * único que queda a la vista al taparse) y el cuerpo con la foto, qué es el
 * recurso y de qué línea de investigación nace. En live es absoluto y viaja;
 * en estático se apila vertical; en celular y tablet (`movil`) es una carta
 * de la pila con lomo arriba (puente/pila-movil.ts). El texto y la foto llegan por props; el
 * tema (navy o gris) lo pone la pila, por el lugar del panel.
 *
 * En celular la carta no repite lo que ya dice su lomo: el «Recurso 01 / 04»
 * no se muestra y el nombre queda solo para lectores de pantalla (el lomo es
 * decorativo). Con todo adentro, la carta no entraba en lo que queda de
 * pantalla y la pila la achicaba hasta que no se leía.
 */
export function PanelRecurso({
  recurso: c,
  tema,
  i,
  total,
  live,
  movil,
}: {
  recurso: Puente["recursos"][number];
  tema: Tema;
  i: number;
  total: number;
  live: boolean;
  movil: boolean;
}) {
  return (
    <article
      data-pila-card
      data-puente-card
      className={
        tema.card +
        " overflow-hidden shadow-[0_28px_70px_-32px_rgb(15_23_42/0.45)] " +
        (live
          ? "absolute inset-y-0 rounded-[1.5rem] md:rounded-[2rem]"
          : movil
            ? "absolute inset-x-0 top-0 rounded-2xl"
            : "relative rounded-2xl")
      }
      style={
        live
          ? {
              left: `calc(var(--pila-paso) * ${i})`,
              width: `calc(100% - var(--pila-paso) * ${i})`,
              zIndex: 10 + i,
            }
          : undefined
      }
    >
      {/* Lomo: número arriba, título leyendo de abajo hacia
          arriba. Es lo único que queda a la vista al taparse. */}
      {live && (
        <div
          aria-hidden="true"
          className={
            "absolute inset-y-0 left-0 z-10 flex w-[var(--pila-paso)] flex-col items-center justify-between py-6 " +
            tema.spine
          }
        >
          <span className="font-mono text-[0.65rem] tracking-[0.14em]">
            {numeroDeRecurso(i)}
          </span>
          <span className="font-display rotate-180 text-[1.02rem] font-bold tracking-[-0.01em] whitespace-nowrap [writing-mode:vertical-rl]">
            {c.nombre}
          </span>
        </div>
      )}

      {/* En la pila de celular el lomo va arriba y en horizontal: es la
          franja que queda a la vista cuando la carta siguiente la tapa. */}
      {movil && (
        <div
          aria-hidden="true"
          data-puente-lomo
          className={"flex h-12 items-center gap-3 px-5 " + tema.spine}
        >
          <span className="font-mono text-[0.65rem] tracking-[0.14em]">{numeroDeRecurso(i)}</span>
          <span className="font-display text-[1rem] font-bold tracking-[-0.01em]">{c.nombre}</span>
        </div>
      )}

      <div
        data-pila-body
        data-puente-cuerpo
        className={
          movil
            ? "grid gap-4 p-5 pt-0 md:grid-cols-[1fr_1.05fr] md:gap-8 md:p-8 md:pt-0"
            : "grid h-full items-center gap-7 md:grid-cols-[1fr_1.05fr] md:gap-10 " +
              (live
                ? "p-7 pl-[calc(var(--pila-paso)+0.75rem)] md:p-12 md:pl-[calc(var(--pila-paso)+1.5rem)]"
                : "p-6 md:p-10")
        }
        style={
          live
            ? {
                // Deja libre lo que ocupan los lomos que esperan a
                // la derecha (los paneles siguientes): el último no
                // tiene ninguno delante y queda con el padding base.
                paddingRight: `calc(3rem + var(--pila-paso) * ${total - 1 - i})`,
              }
            : undefined
        }
      >
        <figure className="relative aspect-[4/3] max-h-[50svh] w-full overflow-hidden rounded-xl md:rounded-2xl max-md:aspect-[5/2] max-md:max-h-[28lvh]">
          <Image
            src={c.foto.src}
            // Decorativa: el panel ya dice todo (SPEC §3). El alt queda con la foto, para donde se use.
            alt=""
            fill
            sizes="(min-width: 768px) 42vw, 100vw"
            className="object-cover"
            style={estiloDeFoco(c.foto.foco)}
          />
        </figure>

        <div className="min-w-0">
          <p
            className={
              "font-mono text-[0.7rem] tracking-[0.14em] uppercase " +
              (movil ? "max-md:hidden " : "") +
              tema.eyebrow
            }
          >
            {`Recurso ${numeroDeRecurso(i)} / 04`}
          </p>
          <h3
            className={
              "font-display mt-3 font-extrabold tracking-[-0.02em] " +
              (movil ? "max-md:sr-only " : "") +
              tema.titulo
            }
            style={{
              fontSize: "clamp(1.9rem, 1.2rem + 2.2vw, 3rem)",
              lineHeight: 1.05,
            }}
          >
            {c.nombre}
          </h3>
          <p
            className={
              "mt-4 max-w-[46ch] font-sans text-[1rem] leading-relaxed md:text-[1.08rem] max-md:text-[0.95rem] " +
              (movil ? "max-md:mt-0 " : "") +
              tema.desc
            }
          >
            {c.descripcion}
          </p>

          <div className={"mt-7 border-t pt-5 max-md:mt-3 " + tema.divisor}>
            <p
              className={
                "font-mono text-[0.66rem] tracking-[0.16em] uppercase " +
                tema.naceLabel
              }
            >
              Nace de la línea
            </p>
            <p
              className={
                "font-display mt-2 max-w-[30ch] text-[1.12rem] leading-snug font-bold md:text-[1.3rem] " +
                tema.linea
              }
            >
              {c.linea}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
