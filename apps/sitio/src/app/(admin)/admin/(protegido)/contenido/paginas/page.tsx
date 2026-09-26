import type { Metadata } from "next";
import { EncabezadoDeContenido } from "@/admin/contenido/EncabezadoDeContenido";
import { ListaDePaginas } from "@/admin/paginas/ListaDePaginas";
import { listaDePaginas } from "@/datos/consultas/editor-de-paginas";

export const metadata: Metadata = { title: "Páginas" };

export default async function PaginasDelAdmin() {
  const filas = await listaDePaginas();
  return (
    <div className="space-y-8">
      <EncabezadoDeContenido detalle="Las siete páginas del sitio, en el orden del menú. Guardar no publica: cada una tiene un borrador y una versión publicada." />
      <ListaDePaginas filas={filas} />
    </div>
  );
}
