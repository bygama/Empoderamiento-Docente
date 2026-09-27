import Link from "next/link";

export type Tarjeta = {
  href: string;
  /** El nombre accesible del link. */
  nombre: string;
  /** Qué es, en una línea. */
  que: string;
  /** Cómo está: una línea en meta o una `Insignia`. */
  estado: React.ReactNode;
};

/**
 * La puerta de un módulo con varias pantallas (DESIGN.md §11): una grilla de
 * tarjetas, y cada tarjeta entera es el link. El link es el nombre, y su
 * `::after` se estira sobre toda la tarjeta: así se toca en cualquier lado,
 * pero el lector de pantalla lee «Páginas» y no el párrafo entero, que queda
 * como descripción. El foco se dibuja en la tarjeta, no en el nombre. No sabe
 * de ED: quien lo usa arma las tarjetas.
 */
export function IndiceDeTarjetas({ tarjetas }: { tarjetas: readonly Tarjeta[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tarjetas.map((t) => {
        const id = `tarjeta${t.href.replaceAll("/", "-")}`;
        return (
          <li
            key={t.href}
            className="relative flex flex-col rounded-xl border border-azul-claro/60 bg-white p-5 transition-colors hover:border-azul-medio has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-azul-medio"
          >
            <Link href={t.href} aria-describedby={`${id}-que ${id}-estado`} className="font-display text-admin-seccion font-bold focus-visible:outline-none after:absolute after:inset-0 after:rounded-xl">
              {t.nombre}
            </Link>
            <p id={`${id}-que`} className="mt-1 text-admin-meta text-gris-texto">
              {t.que}
            </p>
            <div id={`${id}-estado`} className="mt-auto pt-4 text-admin-meta">
              {t.estado}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
