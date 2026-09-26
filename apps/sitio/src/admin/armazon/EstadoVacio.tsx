/**
 * Lo que se ve donde todavía no hay nada (DESIGN.md §11): qué pasa, en el
 * título, y qué hacer, en una frase. El borde punteado dice «acá va a haber
 * algo» sin competir con el contenido de verdad; es decorativo, así que va en
 * `azul-claro`. No sabe de ED. La acción principal llega con su primer
 * consumidor, Novedades («Nueva novedad»).
 */
export function EstadoVacio({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div className="rounded-xl border border-dashed border-azul-claro p-6">
      <p className="font-medium">{titulo}</p>
      <p className="mt-1 max-w-prose text-admin-meta text-gris-texto">{texto}</p>
    </div>
  );
}
