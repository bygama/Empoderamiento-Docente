/**
 * Un apartado de una pantalla de ajustes (DESIGN.md §11, «Apartado»): a la
 * izquierda qué es y qué pasa si se toca; a la derecha, lo que se toca. Desde
 * `lg`, en dos columnas (un tercio y dos); por debajo, uno arriba del otro.
 * Van en una pila, separados por un divisor, y el `id` es su ancla
 * (`/cuenta#contrasena`). No sabe de ED.
 */
export function Apartado({ id, titulo, descripcion, children }: { id: string; titulo: string; descripcion?: string; children: React.ReactNode }) {
  const idDelTitulo = `${id}-titulo`;
  return (
    <section id={id} aria-labelledby={idDelTitulo} className="grid gap-x-10 gap-y-4 border-t border-azul-claro/60 py-8 first:border-t-0 lg:grid-cols-3">
      <div>
        <h2 id={idDelTitulo} className="font-display text-admin-seccion font-bold">
          {titulo}
        </h2>
        {descripcion ? <p className="mt-1 max-w-prose text-admin-meta text-gris-texto">{descripcion}</p> : null}
      </div>
      <div className="min-w-0 lg:col-span-2">{children}</div>
    </section>
  );
}
