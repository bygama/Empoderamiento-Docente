/** Los estados vacíos del panel, en llano: qué pasa y qué hacer. */
export function Estado({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div className="rounded-xl border border-dashed border-azul-claro p-6">
      <p className="font-medium">{titulo}</p>
      <p className="mt-1 max-w-prose text-sm text-gris-texto">{texto}</p>
    </div>
  );
}
