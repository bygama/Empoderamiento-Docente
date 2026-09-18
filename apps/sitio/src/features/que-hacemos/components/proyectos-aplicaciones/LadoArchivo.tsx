import type { Capitulo } from "@/features/que-hacemos/proyectos";
import { PROYECTOS_INTRO } from "@/features/que-hacemos/proyectos";
import { ColumnaCapitulo } from "./ColumnaCapitulo";
import { FichaProyecto } from "./FichaProyecto";
import { TituloGrande } from "./TituloGrande";

const TITULO = "font-display font-bold tracking-[-0.02em] text-balance";

/** «Proyectos y aplicaciones» con la palabra que enlaza con la práctica en
 *  azul medio, el mismo acento del título grande (Gastón, 2026-09-11). */
function Volanta() {
  const { volanta, volantaResaltada } = PROYECTOS_INTRO;
  const i = volanta.indexOf(volantaResaltada);
  return (
    <>
      {volanta.slice(0, i)}
      <span className="text-azul-medio">{volantaResaltada}</span>
      {volanta.slice(i + volantaResaltada.length)}
    </>
  );
}
const TITULO_ESTILO = {
  fontSize: "clamp(1.4rem, 1rem + 1.2vw, 1.9rem)",
  lineHeight: 1.1,
};

/**
 * Un lado del escenario en vivo: el encabezado, la columna del capítulo y
 * la pila de fichas, todos absolutos dentro del escenario. El lado A va
 * con columna a la izquierda y pila a la derecha; el lado B, dado vuelta.
 * El título grande de la sección solo va en el lado A; en el B el propio
 * título del capítulo hace de relevo. La coreografía busca las piezas por
 * `[data-lado]`.
 */
export function LadoArchivo({
  lado,
  capitulos,
  desde,
  total,
}: {
  lado: "a" | "b";
  capitulos: readonly Capitulo[];
  /** Cuántas fichas van antes de este lado. */
  desde: number;
  /** Fichas del archivo entero. */
  total: number;
}) {
  const espejo = lado === "b";
  const fichas = capitulos.flatMap((cap) => cap.fichas);
  const ladoTexto = espejo ? "right-5 md:right-10" : "left-5 md:left-10";
  const ladoPila = espejo ? "left-5 md:left-10" : "right-5 md:right-10";

  return (
    <div data-lado={lado} className="absolute inset-0">
      {/* Encabezado: fijo arriba, del lado de la columna, y con su mismo
          borde. Dice el NOMBRE de la sección, no repite «Así se ve en la
          práctica», que la apertura ya dijo en grande (Gastón,
          2026-09-10). El h2 real va una sola vez. */}
      <header
        data-texto
        className={`absolute top-24 w-[min(38vw,34rem)] md:top-28 ${ladoTexto}`}
      >
        {espejo ? (
          <p aria-hidden="true" className={TITULO} style={TITULO_ESTILO}>
            <Volanta />
          </p>
        ) : (
          <h2 className={TITULO} style={TITULO_ESTILO}>
            <Volanta />
          </h2>
        )}
      </header>

      <ColumnaCapitulo
        capitulos={capitulos}
        desde={desde}
        total={total}
        espejo={espejo}
      />
      {!espejo && <TituloGrande />}

      {/* La pila de fichas, centrada, del lado opuesto a la columna. */}
      <div
        data-pila
        className={`absolute top-1/2 h-[30rem] w-[clamp(380px,34vw,40rem)] -translate-y-1/2 ${ladoPila}`}
      >
        {fichas.map((f, i) => (
          <FichaProyecto key={f.id} ficha={f} n={desde + i + 1} live />
        ))}
      </div>
    </div>
  );
}
