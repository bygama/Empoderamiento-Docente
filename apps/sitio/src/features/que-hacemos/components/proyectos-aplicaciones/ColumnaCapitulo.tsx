import type { Capitulo } from "@/features/que-hacemos/proyectos";
import { Bajada } from "./Bajada";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * La columna del capítulo de una mitad del escenario en vivo: el título
 * grande del capítulo (uno por capítulo, apilados; la coreografía muestra
 * uno solo), su bajada y el contador de fichas, que sigue la cuenta del
 * archivo entero («05 / 08» en el espejo). `[data-columna]`: la
 * coreografía decide cuándo aparece.
 */
export function ColumnaCapitulo({
  capitulos,
  desde,
  total,
  espejo,
}: {
  capitulos: readonly Capitulo[];
  desde: number;
  total: number;
  espejo: boolean;
}) {
  return (
    <div
      data-columna
      className={
        "absolute top-1/2 w-[min(38vw,34rem)] -translate-y-1/2 " +
        (espejo ? "right-5 md:right-10" : "left-5 md:left-10")
      }
    >
      <div className="relative h-[13rem]">
        {capitulos.map((cap) => (
          <div
            key={cap.id}
            data-cap-titulo
            className="absolute inset-x-0 top-0"
          >
            <h3
              className="font-display font-extrabold tracking-[-0.03em] text-balance"
              style={{
                fontSize: "clamp(2rem, 1rem + 2.6vw, 3.4rem)",
                lineHeight: 1.02,
              }}
            >
              {cap.titulo}
            </h3>
            <Bajada
              cap={cap}
              className="text-gris-texto mt-5 max-w-[34ch] font-sans text-[1.05rem] leading-relaxed"
            />
          </div>
        ))}
      </div>
      <p
        data-contador
        className="text-verde-concepto-texto mt-8 font-mono text-[0.8rem] tracking-[0.18em]"
      >
        {pad(desde + 1)} / {pad(total)}
      </p>
    </div>
  );
}
