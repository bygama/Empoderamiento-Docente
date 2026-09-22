import { ListaDePaginas } from "@/admin/paginas/ListaDePaginas";
import { listaDePaginas } from "@/datos/consultas/editor-de-paginas";

export default async function PaginasDelAdmin() {
  const filas = await listaDePaginas();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-manrope)] text-2xl font-bold">Páginas</h1>
        <p className="mt-1 max-w-prose text-gris-texto">
          Los textos y las fotos de las siete páginas del sitio, en el orden del menú. Guardar no publica: cada
          página tiene un borrador y una versión publicada.
        </p>
      </div>
      <ListaDePaginas filas={filas} />
    </div>
  );
}
