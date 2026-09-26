/**
 * Lo que se ve donde todavía no hay nada (DESIGN.md §11): qué pasa, en el
 * título, y qué hacer, en una frase. El borde punteado dice «acá va a haber
 * algo» sin competir con el contenido de verdad; es decorativo, así que va en
 * `azul-claro`. No sabe de ED. La acción principal llega con su primer
 * consumidor, Novedades («Nueva novedad»).
 *
 * Cuando lo que falta es configurar algo, lleva **pasos**: una lista ordenada
 * en meta `azul-principal` (13,63:1), porque son instrucciones para seguir y no
 * una aclaración. Primer consumidor: «Conectá Search Console».
 */
export function EstadoVacio({ titulo, texto, pasos }: { titulo: string; texto: string; pasos?: readonly string[] }) {
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
    </div>
  );
}
