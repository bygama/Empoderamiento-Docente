import Link from "next/link";

type Miga = { href: string; etiqueta: string };

type Props = {
  /** El `h1` de la pantalla. */
  titulo: string;
  /** Lo que hay arriba de esta pantalla, en orden; van antes del título, en la misma línea. */
  migas?: Miga[];
  /** Al lado del título: una `Insignia`. */
  estado?: React.ReactNode;
  /** Una línea en meta debajo del título. */
  detalle?: React.ReactNode;
  /** A la derecha, con un solo primario. */
  acciones?: React.ReactNode;
  /** Abajo, adentro del encabezado: así un aviso se ve aunque la pantalla esté scrolleada. */
  avisos?: React.ReactNode;
  /**
   * Las acciones y los avisos quedan siempre a la vista: en escritorio, todo
   * el encabezado pegado arriba; por debajo de `lg`, el título hace scroll y
   * las acciones van en una barra fija abajo, al alcance del pulgar. Quien lo
   * usa deja lugar abajo para que la barra no tape lo último.
   */
  fijo?: boolean;
  /**
   * Todo el encabezado pasa a `azul-principal` (el modo navy de DESIGN.md
   * §11): lo que hay adentro tiene que ir en su versión «sobre azul».
   */
  resaltado?: boolean;
};

/**
 * El encabezado de una pantalla del admin (DESIGN.md §11): dónde estás, el
 * título, el estado, el detalle y las acciones. No sabe de ED. El `-mx-6`
 * lo lleva hasta los bordes del `main` del armazón, que tiene `px-6`.
 */
export function Encabezado({ titulo, migas, estado, detalle, acciones, avisos, fijo = false, resaltado = false }: Props) {
  // Sobre azul: el texto en blanco (13,63:1) y lo secundario en `azul-claro`
  // (7,68:1), incluido el foco, porque el `azul-medio` ahí da 2,67:1.
  const secundario = resaltado ? "text-azul-claro" : "text-gris-texto";
  const miga = resaltado ? "text-azul-claro focus-visible:outline-azul-claro" : "text-azul-medio focus-visible:outline-azul-medio";
  const fondo = resaltado ? "border-azul-principal bg-azul-principal" : "border-azul-claro/60 bg-white";
  // En escritorio la barra se disuelve (`contents`) y sus hijos vuelven a la
  // fila del encabezado. En el celular es una barra fija de 64 px (40 del
  // botón y 12 arriba y abajo), que suma el área segura del iPhone cuando la
  // hay; el aviso va arriba de las acciones (`flex-col-reverse`), sin cambiar
  // el orden del DOM.
  const barra = fijo
    ? `fixed inset-x-0 bottom-0 z-10 flex flex-col-reverse gap-2 border-t px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-colors lg:contents ${fondo}`
    : "contents";
  return (
    <header
      className={`-mx-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b px-6 py-3 transition-colors ${fijo ? "lg:sticky lg:top-0 lg:z-10" : ""} ${fondo} ${resaltado ? "text-white" : ""}`}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          {migas?.length ? (
            <nav aria-label="Estás en" className="text-admin-meta">
              <ol className="flex items-baseline gap-2">
                {migas.map((m) => (
                  <li key={m.href} className="flex items-baseline gap-2">
                    <Link href={m.href} className={`rounded-sm underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 ${miga}`}>
                      {m.etiqueta}
                    </Link>
                    <span aria-hidden="true" className={secundario}>
                      /
                    </span>
                  </li>
                ))}
              </ol>
            </nav>
          ) : null}
          <h1 className="font-display text-admin-titulo font-bold">{titulo}</h1>
          {estado ? <span className="self-center">{estado}</span> : null}
        </div>
        {detalle ? <div className={`mt-1 flex flex-wrap items-center gap-x-3 text-admin-meta ${secundario}`}>{detalle}</div> : null}
      </div>
      {acciones || avisos ? (
        <div className={barra}>
          {acciones ? <div className="flex flex-wrap items-center justify-end gap-2">{acciones}</div> : null}
          {/* Con fondo blanco propio: los tintes del aviso están medidos sobre blanco, y así se leen igual en el modo navy. */}
          {avisos ? <div className="w-full rounded-lg bg-white">{avisos}</div> : null}
        </div>
      ) : null}
    </header>
  );
}
