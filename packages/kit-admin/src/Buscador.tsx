import Link from "next/link";
import { Boton } from "./Boton";
import { claseDeBoton, ENTRADA } from "./clases";

type Props = {
  /** Qué busca, para el lector y el `aria-label` del formulario: «Buscar en Contacto». */
  etiqueta: string;
  /** Adónde va: la misma lista. */
  accion: string;
  /** Lo buscado ahora, si hay. */
  q?: string;
  /** Qué mira, en la caja vacía: «Nombre, correo o texto». */
  ayuda: string;
  /** Lo demás de la URL que la búsqueda conserva (`estado`). */
  conservar?: Readonly<Record<string, string>>;
};

/**
 * La caja de búsqueda de una lista larga (DESIGN.md §11, «Buscador»): un
 * formulario GET con `role="search"`, sin JavaScript, que deja lo buscado en
 * la URL (`?q=`). La caja es la `ENTRADA` del admin y el botón, secundario:
 * buscar no es la acción de la pantalla. Con algo buscado, «Borrar la
 * búsqueda» vuelve a la lista entera. No sabe de ED.
 */
export function Buscador({ etiqueta, accion, q, ayuda, conservar = {} }: Props) {
  const id = `buscar-${accion.replaceAll("/", "-")}`;
  const sinBusqueda = `${accion}${new URLSearchParams(conservar).size ? `?${new URLSearchParams(conservar)}` : ""}`;
  return (
    <form role="search" aria-label={etiqueta} action={accion} className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
      {Object.entries(conservar).map(([nombre, valor]) => (
        <input key={nombre} type="hidden" name={nombre} value={valor} />
      ))}
      <label htmlFor={id} className="sr-only">
        {etiqueta}
      </label>
      <input id={id} type="search" name="q" defaultValue={q} placeholder={ayuda} maxLength={100} className={`${ENTRADA} min-w-0 flex-1 sm:w-64`} />
      <Boton variante="secundario" type="submit">
        Buscar
      </Boton>
      {q ? (
        <Link href={sinBusqueda} className={claseDeBoton("terciario")}>
          Borrar la búsqueda
        </Link>
      ) : null}
    </form>
  );
}
