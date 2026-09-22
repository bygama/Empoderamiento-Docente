import { notFound } from "next/navigation";
import { EditorDePagina } from "@/admin/paginas/EditorDePagina";
import { esSlug, PAGINAS } from "@/contenido/paginas";
import { paginaParaEditar } from "@/datos/consultas/editor-de-paginas";

export default async function EditarPagina({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // Un slug que no está en el registro, o una página sin secciones todavía, no tiene editor.
  if (!esSlug(slug) || Object.keys(PAGINAS[slug].secciones).length === 0) notFound();
  const pagina = await paginaParaEditar(slug);
  return (
    <>
      <h1 className="sr-only">Editar {pagina.nombre}</h1>
      {/* La key remonta el editor entero al navegar de una página a otra: sin ella, el estado local (lo escrito, lo sucio) sobreviviría al slug viejo. */}
      <EditorDePagina key={pagina.slug} pagina={pagina} />
    </>
  );
}
