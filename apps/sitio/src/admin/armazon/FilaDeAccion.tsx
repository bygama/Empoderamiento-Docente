/**
 * Una acción al pie de una ficha (DESIGN.md §11, «Ficha de una entidad»,
 * «Deshacer o sacar del sitio»): a la izquierda qué es y qué pasa si se toca,
 * a la derecha lo que la hace. Van en una lista con divisor; lo que no se
 * deshace confirma en el lugar (`Confirmacion`).
 */
export function FilaDeAccion({ titulo, consecuencia, children }: { titulo: string; consecuencia: string; children?: React.ReactNode }) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-4">
      <div className="min-w-0 max-w-prose">
        <p className="font-medium">{titulo}</p>
        <p className="mt-0.5 text-admin-meta text-gris-texto">{consecuencia}</p>
      </div>
      {children}
    </li>
  );
}
