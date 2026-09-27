/**
 * Un bloque del formulario de una ficha (DESIGN.md §11, «Ficha de una
 * entidad»): su título con el divisor de las secciones del editor, y los
 * campos debajo. Lo usa la ficha que escribe su formulario a mano.
 */
export function Bloque({ id, titulo, children }: { id: string; titulo: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="space-y-5">
      <h2 id={id} className="border-b border-azul-claro/60 pb-2 font-display text-admin-seccion font-bold">
        {titulo}
      </h2>
      {children}
    </section>
  );
}
