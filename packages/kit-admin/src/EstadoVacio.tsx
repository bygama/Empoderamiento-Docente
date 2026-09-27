/**
 * Lo que se ve donde todavía no hay nada (DESIGN.md §11): qué pasa, en el
 * título, y qué hacer, en una frase. El borde punteado dice «acá va a haber
 * algo» sin competir con el contenido de verdad; es decorativo, así que va en
 * `azul-claro`. No sabe de ED.
 *
 * La **acción**, cuando la pantalla vacía tiene algo para hacer («Todavía no
 * hay entradas. [Nueva entrada]»), va debajo de la frase: es el primario de
 * la pantalla, así que el encabezado no lo repite.
 *
 * Cuando lo que falta es configurar algo, lleva **pasos**: una lista ordenada
 * en meta `azul-principal` (13,63:1), porque son instrucciones para seguir y no
 * una aclaración: «Conectá el servicio», y cómo.
 */
export function EstadoVacio({ titulo, texto, pasos, accion }: { titulo: string; texto: string; pasos?: readonly string[]; accion?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-azul-claro p-6">
      <p className="font-medium">{titulo}</p>
      <p className="mt-1 max-w-prose text-admin-meta text-gris-texto">{texto}</p>
      {pasos?.length ? (
        <ol className="mt-4 max-w-prose list-decimal space-y-2 pl-5 text-admin-meta marker:font-medium">
          {pasos.map((paso) => (
            <li key={paso}>{paso}</li>
          ))}
        </ol>
      ) : null}
      {accion ? <div className="mt-4">{accion}</div> : null}
    </div>
  );
}
