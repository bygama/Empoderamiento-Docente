import { CAPITULOS, FICHAS } from "@/features/que-hacemos/proyectos";

/**
 * La columna de la izquierda del escenario en vivo: el título grande del
 * capítulo (uno por capítulo, apilados; la coreografía muestra uno solo),
 * su bajada y el contador de fichas. `[data-texto]`: no aparece hasta que
 * termina el solo de la víbora.
 */
export function ColumnaCapitulo() {
  return (
    <div
      data-texto
      className="absolute top-1/2 left-5 w-[min(38vw,34rem)] -translate-y-1/2 md:left-10"
    >
      <div className="relative h-[13rem]">
        {CAPITULOS.map((cap) => (
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
            <p className="text-gris-texto mt-5 max-w-[34ch] font-sans text-[1.05rem] leading-relaxed">
              {cap.bajada}
            </p>
          </div>
        ))}
      </div>
      <p
        data-contador
        className="text-verde-concepto-texto mt-8 font-mono text-[0.8rem] tracking-[0.18em]"
      >
        01 / {String(FICHAS.length).padStart(2, "0")}
      </p>
    </div>
  );
}
