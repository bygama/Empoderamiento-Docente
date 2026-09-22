import Link from "next/link";

type Miga = { href: string; etiqueta: string };

type Props = {
  /** El `h1` de la pantalla. */
  titulo: string;
  /** Lo que hay arriba de esta pantalla, en orden; van antes del título, en la misma línea. */
  migas?: Miga[];
  /** Al lado del título: una `Insignia`. */
  estado?: React.ReactNode;
  /** Una línea en meta `gris-texto` debajo del título. */
  detalle?: React.ReactNode;
  /** A la derecha, con un solo primario. */
  acciones?: React.ReactNode;
  /** Abajo, adentro del encabezado: así un aviso se ve aunque la pantalla esté scrolleada. */
  avisos?: React.ReactNode;
  /** Queda pegado arriba al hacer scroll. */
  fijo?: boolean;
};

/**
 * El encabezado de una pantalla del admin (DESIGN.md §11): dónde estás, el
 * título, el estado, el detalle y las acciones. No sabe de ED. El `-mx-6`
 * lo lleva hasta los bordes del `main` del armazón, que tiene `px-6`.
 */
export function Encabezado({ titulo, migas, estado, detalle, acciones, avisos, fijo = false }: Props) {
  return (
    <header className={`-mx-6 border-b border-azul-claro/60 bg-white px-6 py-3 ${fijo ? "sticky top-0 z-10" : ""}`}>
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            {migas?.length ? (
              <nav aria-label="Estás en" className="text-admin-meta">
                <ol className="flex items-baseline gap-2">
                  {migas.map((m) => (
                    <li key={m.href} className="flex items-baseline gap-2">
                      <Link
                        href={m.href}
                        className="rounded-sm text-azul-medio underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azul-medio"
                      >
                        {m.etiqueta}
                      </Link>
                      <span aria-hidden="true" className="text-gris-texto">
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
          {detalle ? <div className="mt-1 flex flex-wrap items-center gap-x-3 text-admin-meta text-gris-texto">{detalle}</div> : null}
        </div>
        {acciones ? <div className="flex flex-wrap items-center gap-2">{acciones}</div> : null}
      </div>
      {avisos ? <div className="mt-3">{avisos}</div> : null}
    </header>
  );
}
