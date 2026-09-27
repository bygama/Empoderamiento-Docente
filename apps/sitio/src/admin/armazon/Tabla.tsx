import { Check } from "@/components/ui/icons";

export type ColumnaDeTabla = {
  etiqueta: string;
  /** Centrada, para un sí o un no; sin esto, a la izquierda. */
  centrada?: boolean;
  /** El ancho de la columna, como clase (`w-28`); sin esto, lo que le toque. */
  ancho?: string;
};

export type FilaDeTabla = {
  clave: string;
  /** Una celda por columna. La primera es el encabezado de la fila. */
  celdas: readonly React.ReactNode[];
};

/**
 * Lo que se lee cruzando filas y columnas (DESIGN.md §11, «Tabla»): la caja de
 * la `Lista`, encabezados de columna y de fila de verdad (`th` con `scope`) y
 * un `caption` para el lector, todo en meta. En el celular la caja scrollea de
 * costado y la tabla no baja de `min-w-lg`. No sabe de ED.
 */
export function Tabla({ leyenda, columnas, filas }: { leyenda: string; columnas: readonly ColumnaDeTabla[]; filas: readonly FilaDeTabla[] }) {
  const alineacion = (c: ColumnaDeTabla | undefined) => (c?.centrada ? "text-center" : "");
  return (
    <div className="overflow-x-auto rounded-xl border border-azul-claro/60">
      <table className="w-full min-w-lg text-left text-admin-meta">
        <caption className="sr-only">{leyenda}</caption>
        <thead>
          <tr className="border-b border-azul-claro/60">
            {columnas.map((c) => (
              <th key={c.etiqueta} scope="col" className={`px-4 py-3 font-medium ${alineacion(c)} ${c.ancho ?? ""}`}>
                {c.etiqueta}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-azul-claro/60">
          {filas.map(({ clave, celdas }) => (
            <tr key={clave}>
              <th scope="row" className="px-4 py-3 align-top font-normal">
                {celdas[0]}
              </th>
              {/* Una celda por columna: se recorren las columnas, que tienen nombre. */}
              {columnas.slice(1).map((c, i) => (
                <td key={c.etiqueta} className={`px-4 py-3 align-top ${alineacion(c)}`}>
                  {celdas[i + 1]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Un sí o un no, dibujado y dicho: el ✓ se lee «Sí»; la raya, «No». */
export function SiONo({ si }: { si: boolean }) {
  return si ? (
    <>
      <Check size={16} aria-hidden="true" className="inline-block" />
      <span className="sr-only">Sí</span>
    </>
  ) : (
    <>
      <span aria-hidden="true" className="text-gris-texto">
        —
      </span>
      <span className="sr-only">No</span>
    </>
  );
}
