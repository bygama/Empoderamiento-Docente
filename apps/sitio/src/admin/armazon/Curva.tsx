import { diaLargo, fraseDeLaCurva, posicion, techoDe, trazosDe, type Punto } from "./curva/calculos";
import { Desplegable } from "./Lista";
import { Tabla } from "./Tabla";

const numero = new Intl.NumberFormat("es-AR");
const diaCorto = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "short", timeZone: "UTC" });
const corto = (d: string) => diaCorto.format(new Date(`${d}T00:00:00.000Z`));

type Props = {
  /** Qué muestra, para la frase y la tabla: «Visitantes por día». */
  nombre: string;
  /** La columna de la tabla: «Visitantes». */
  medida: string;
  /** Un punto por día, en orden; `null` es «todavía no había datos» y corta la línea. */
  puntos: readonly Punto[];
  /** Los días con marca, con los números que remiten a la lista de marcas. */
  marcas?: ReadonlyArray<{ dia: string; numeros: readonly number[] }>;
};

// Contrastes (DESIGN.md §11, «Gráficos»): la línea en `azul-medio` (5,11:1 ·
// 7,14:1 en el oscuro), las marcas en `gris-texto` (4,83:1 · 7,08:1), las
// etiquetas en meta `gris-texto`. El área y la grilla son decorativas.
const TRAZO = { vectorEffect: "non-scaling-stroke", strokeLinecap: "round", strokeLinejoin: "round" } as const;

/**
 * Una curva diaria de una sola serie (DESIGN.md §11, «Gráficos»): un SVG
 * dibujado en el servidor, sin dependencias, que se estira al ancho. Las
 * etiquetas van en HTML, así no se achican con el SVG. Para el lector, una
 * frase que la resume (`role="img"`) y, plegada debajo, la tabla con los
 * números, que es también su vista para quien no distingue la línea. Al pasar
 * sobre un día, el navegador dice su número. No sabe de ED.
 */
export function Curva({ nombre, medida, puntos, marcas = [] }: Props) {
  const techo = techoDe(Math.max(0, ...puntos.map((p) => p.valor ?? 0)));
  const { linea, area } = trazosDe(puntos, techo);
  const indice = new Map(puntos.map((p, i) => [p.dia, i]));
  const x = (d: string) => posicion(indice.get(d) ?? 0, puntos.length, 0, techo).x;
  const ultimo = puntos.findLastIndex((p) => p.valor !== null);
  const final = ultimo >= 0 ? posicion(ultimo, puntos.length, puntos[ultimo].valor ?? 0, techo) : null;
  const ancho = 100 / Math.max(1, puntos.length - 1);
  const numerosDe = new Map(marcas.map((m) => [m.dia, m.numeros]));

  return (
    <figure className="space-y-3">
      <div className={`relative pl-10 ${marcas.length ? "pt-8" : "pt-2"}`}>
        <div className="relative h-48 sm:h-56">
          {[techo, techo / 2, 0].map((v, i) => (
            <span key={v} aria-hidden="true" className="absolute -left-10 w-8 -translate-y-1/2 text-right text-admin-meta text-gris-texto" style={{ top: `${i * 50}%` }}>
              {numero.format(v)}
            </span>
          ))}
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label={fraseDeLaCurva(nombre, puntos)} className="absolute inset-0 size-full overflow-visible">
            {[0, 50, 100].map((y) => (
              <line key={y} x1={0} x2={100} y1={y} y2={y} strokeWidth={1} className="stroke-azul-claro/60" {...TRAZO} />
            ))}
            <path d={area} className="fill-azul-claro/30" />
            {marcas.map((m) => (
              <line key={m.dia} x1={x(m.dia)} x2={x(m.dia)} y1={0} y2={100} strokeWidth={1} strokeDasharray="4 4" className="stroke-gris-texto" {...TRAZO} />
            ))}
            <path d={linea} fill="none" strokeWidth={2} className="stroke-azul-medio" {...TRAZO} />
            {puntos.map((p, i) => (
              <rect key={p.dia} x={Math.max(0, (i - 0.5) * ancho)} y={0} width={ancho} height={100} fill="transparent">
                <title>{`${diaLargo(p.dia)}: ${p.valor === null ? "sin datos" : numero.format(p.valor)}`}</title>
              </rect>
            ))}
          </svg>
          {final ? (
            <span
              aria-hidden="true"
              className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-azul-medio ring-2 ring-white"
              style={{ left: `${final.x}%`, top: `${final.y}%` }}
            />
          ) : null}
          {marcas.map((m) => (
            <span
              key={m.dia}
              aria-hidden="true"
              className="absolute -top-7 -translate-x-1/2 rounded-full border border-gris-texto bg-white px-1.5 text-admin-meta font-medium whitespace-nowrap text-azul-principal"
              style={{ left: `${x(m.dia)}%` }}
            >
              {m.numeros.join(", ")}
            </span>
          ))}
        </div>
        <div aria-hidden="true" className="mt-2 flex justify-between text-admin-meta text-gris-texto">
          <span>{corto(puntos[0]?.dia ?? "")}</span>
          <span>{corto(puntos[puntos.length - 1]?.dia ?? "")}</span>
        </div>
      </div>
      <Desplegable resumen="Ver los números">
        <div className="mt-2">
          <Tabla
            leyenda={nombre}
            columnas={[{ etiqueta: "Día" }, { etiqueta: medida }, { etiqueta: "Marca" }]}
            filas={puntos.map((p) => ({
              clave: p.dia,
              celdas: [diaLargo(p.dia), p.valor === null ? "Sin datos" : numero.format(p.valor), numerosDe.get(p.dia)?.join(", ") ?? ""],
            }))}
          />
        </div>
      </Desplegable>
    </figure>
  );
}
