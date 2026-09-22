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
  /** Queda pegado arriba al hacer scroll. */
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
  return (
    <header
      className={`-mx-6 border-b px-6 py-3 transition-colors ${fijo ? "sticky top-0 z-10" : ""} ${resaltado ? "border-azul-principal bg-azul-principal text-white" : "border-azul-claro/60 bg-white"}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
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
        {acciones ? <div className="flex flex-wrap items-center gap-2">{acciones}</div> : null}
      </div>
      {/* Con fondo blanco propio: los tintes del aviso están medidos sobre blanco, y así se leen igual en el modo navy. */}
      {avisos ? <div className="mt-3 rounded-lg bg-white">{avisos}</div> : null}
    </header>
  );
}
