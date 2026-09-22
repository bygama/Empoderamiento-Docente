import type { ReactNode } from "react";
import { valorVacio, type Descripcion } from "@/lib/contenido/descripcion";
import { resolverCambio, type Cambio } from "./cambio";

type Props = {
  descripcion: Extract<Descripcion, { tipo: "listaFija" }>;
  valor: unknown[];
  alCambiar: (valor: Cambio<unknown[]>) => void;
  porItem: (indice: number, valor: unknown, cambiar: (valor: Cambio<unknown>) => void) => ReactNode;
};

/** Exactamente `cantidad` ítems: se edita cada uno, no se agregan ni se sacan (SPEC §2). */
export function ListaFija({ descripcion, valor, alCambiar, porItem }: Props) {
  // Siempre la cantidad exacta: si el valor trae menos, se completa con vacíos; si trae más, se recorta.
  const items = Array.from({ length: descripcion.cantidad }, (_, i) => (i < valor.length ? valor[i] : valorVacio(descripcion.item)));
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">{descripcion.etiqueta}</p>
      {/* La cantidad sale del esquema, no de contar la lista: dice cuántos hay aunque `items` todavía esté completando vacíos. */}
      <p className="text-xs text-gris-texto">
        Son {descripcion.cantidad} ítems.{descripcion.ayuda ? ` ${descripcion.ayuda}` : ""}
      </p>
      <ol className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="rounded-lg border border-azul-claro/60 p-4">
            <p className="mb-3 text-sm font-medium">
              {descripcion.item.etiqueta} {i + 1}
            </p>
            {porItem(i, item, (nuevo) =>
              // Mapea contra el array más fresco (`actual`), no contra
              // `items` de este render: un ítem que resuelve tarde (una
              // foto que sube) no pisa lo que se tocó en otro ítem mientras
              // tanto. El fallback a `items` es defensivo, para el caso raro
              // de que `actual` llegue sin forma de array.
              alCambiar((actual: unknown) => {
                const base = Array.isArray(actual) ? actual : items;
                return base.map((x, j) => (j === i ? resolverCambio(nuevo, x) : x));
              }),
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
