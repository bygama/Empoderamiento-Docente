import Image from "next/image";
import type { Tema } from "./temas";

/** Lo que muestra un panel: el tipo de recurso, qué es, de qué línea nace, su foto y su tema. */
export type Recurso = { tipo: string; desc: string; linea: string; imagen: string; tema: Tema };

/**
 * Un panel de la pila: el lomo (número y nombre de abajo hacia arriba, lo
 * único que queda a la vista al taparse) y el cuerpo con la foto, qué es el
 * recurso y de qué línea de investigación nace. En live es absoluto y viaja;
 * en estático se apila vertical.
 */
export function PanelRecurso({ recurso: c, i, total, live }: { recurso: Recurso; i: number; total: number; live: boolean }) {
  return (
    <article
      data-pila-card
      className={
        c.tema.card +
        " overflow-hidden shadow-[0_28px_70px_-32px_rgb(15_23_42/0.45)] " +
        (live
          ? "absolute inset-y-0 rounded-[1.5rem] md:rounded-[2rem]"
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
            c.tema.spine
          }
        >
          <span className="font-mono text-[0.65rem] tracking-[0.14em]">
            {`0${i + 1}`}
          </span>
          <span className="font-display rotate-180 text-[1.02rem] font-bold tracking-[-0.01em] whitespace-nowrap [writing-mode:vertical-rl]">
            {c.tipo}
          </span>
        </div>
      )}

      <div
        data-pila-body
        className={
          "grid h-full items-center gap-7 md:grid-cols-[1fr_1.05fr] md:gap-10 " +
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
        <figure className="relative aspect-[4/3] max-h-[50svh] w-full overflow-hidden rounded-xl md:rounded-2xl">
          <Image
            src={c.imagen}
            alt=""
            fill
            sizes="(min-width: 768px) 42vw, 100vw"
            className="object-cover"
          />
        </figure>

        <div className="min-w-0">
          <p
            className={
              "font-mono text-[0.7rem] tracking-[0.14em] uppercase " +
              c.tema.eyebrow
            }
          >
            {`Recurso 0${i + 1} / 04`}
          </p>
          <h3
            className={
              "font-display mt-3 font-extrabold tracking-[-0.02em] " +
              c.tema.titulo
            }
            style={{
              fontSize: "clamp(1.9rem, 1.2rem + 2.2vw, 3rem)",
              lineHeight: 1.05,
            }}
          >
            {c.tipo}
          </h3>
          <p
            className={
              "mt-4 max-w-[46ch] font-sans text-[1rem] leading-relaxed md:text-[1.08rem] " +
              c.tema.desc
            }
          >
            {c.desc}
          </p>

          <div className={"mt-7 border-t pt-5 " + c.tema.divisor}>
            <p
              className={
                "font-mono text-[0.66rem] tracking-[0.16em] uppercase " +
                c.tema.naceLabel
              }
            >
              Nace de la línea
            </p>
            <p
              className={
                "font-display mt-2 max-w-[30ch] text-[1.12rem] leading-snug font-bold md:text-[1.3rem] " +
                c.tema.linea
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
