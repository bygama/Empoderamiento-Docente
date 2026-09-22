import Image from "next/image";
import type { ReactNode } from "react";
import { X } from "@/components/ui/icons";
import { posicionDelFoco } from "@/lib/contenido/fotos";
import type { Resumen } from "@/lib/contenido/resumen";
import { resolverCambio, type Cambio } from "./cambio";

type Props = {
  /** Único en el formulario: es el `name` de los `<details>`, que así se abren de a uno. */
  nombre: string;
  etiqueta: string;
  /** El nombre de cada ítem: «Tarjeta» → «Tarjeta 1», «Tarjeta 2»… */
  etiquetaItem: string;
  cantidad: number;
  ayuda?: string;
  /** Un ítem vacío, nuevo en cada llamada: completa la lista cuando el valor trae menos. */
  itemVacio: () => unknown;
  valor: unknown[];
  alCambiar: (valor: Cambio<unknown[]>) => void;
  /** Lo que se ve de un ítem cerrado: su primera foto y una línea. */
  resumenDe: (valor: unknown) => Resumen;
  porItem: (indice: number, valor: unknown, cambiar: (valor: Cambio<unknown>) => void) => ReactNode;
};

/** La cara de un ítem cerrado: la miniatura con su número y una línea de texto. */
function Cerrado({ numero, etiquetaItem, resumen }: { numero: number; etiquetaItem: string; resumen: Resumen }) {
  return (
    <span className="block group-open/item:hidden">
      <span className="relative block aspect-4/3 overflow-hidden rounded-lg bg-gris-fondo">
        {resumen.foto ? (
          // Decorativa: el texto de abajo ya dice qué es (y sin cartel, es el alt).
          <Image src={resumen.foto.src} alt="" fill sizes="(min-width: 1024px) 160px, 33vw" className="object-cover" style={{ objectPosition: posicionDelFoco(resumen.foto.foco) }} />
        ) : null}
        <span className="absolute top-1.5 left-1.5 rounded-full bg-azul-principal px-2 text-admin-meta font-medium text-white">
          <span className="sr-only">{etiquetaItem} </span>
          {numero}
        </span>
      </span>
      <span className={`mt-1 block truncate text-admin-meta ${resumen.texto ? "text-azul-principal" : "text-gris-texto"}`}>{resumen.texto || "Sin texto"}</span>
    </span>
  );
}

/**
 * Exactamente `cantidad` ítems: se edita cada uno, no se agregan ni se sacan
 * (SPEC §2 de `work/edicion-de-paginas/`). En una grilla de miniaturas (6
 * columnas desde `lg`, 3 por debajo): cada ítem es un `<details>` con el
 * `name` de la lista, así se abre uno solo a la vez sin JS, y el abierto pasa
 * a su propia fila a todo el ancho sin reordenar nada, porque el orden de
 * lectura y de Tab es el del DOM (SPEC §5 de `work/editor-sin-pared/`).
 */
export function ListaFija({ nombre, etiqueta, etiquetaItem, cantidad, ayuda, itemVacio, valor, alCambiar, resumenDe, porItem }: Props) {
  // Siempre la cantidad exacta: si el valor trae menos, se completa con vacíos; si trae más, se recorta.
  const items = Array.from({ length: cantidad }, (_, i) => (i < valor.length ? valor[i] : itemVacio()));
  return (
    <div className="space-y-3">
      <div>
        {/* La cantidad sale del esquema, no de contar la lista: dice cuántos hay aunque `items` todavía esté completando vacíos. */}
        <p className="font-display text-admin-seccion font-bold">
          {etiqueta} · {cantidad}
        </p>
        {ayuda ? <p className="mt-1 text-admin-meta text-gris-texto">{ayuda}</p> : null}
      </div>
      <ol className="grid grid-cols-3 gap-3 lg:grid-cols-6">
        {items.map((item, i) => {
          const resumen = resumenDe(item);
          return (
            <li key={i} className="has-open:col-span-full">
              <details name={nombre} className="group/item rounded-lg open:border open:border-azul-claro/60">
                <summary className="block cursor-pointer list-none rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azul-medio [&::-webkit-details-marker]:hidden">
                  <Cerrado numero={i + 1} etiquetaItem={etiquetaItem} resumen={resumen} />
                  {/* Abierto, el mismo `summary` es la cabecera del panel: tocarlo lo cierra. */}
                  <span className="hidden items-center justify-between gap-3 px-4 py-3 group-open/item:flex">
                    <span className="min-w-0 truncate text-admin-meta font-medium">
                      {etiquetaItem} {i + 1}
                      {resumen.texto ? ` · ${resumen.texto}` : ""}
                    </span>
                    <span className="flex shrink-0 items-center gap-1 text-admin-meta font-medium text-azul-medio">
                      Cerrar <X size={16} />
                    </span>
                  </span>
                </summary>
                <div className="@container border-t border-azul-claro/60 p-4">
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
                </div>
              </details>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
