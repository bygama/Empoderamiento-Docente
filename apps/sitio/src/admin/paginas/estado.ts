import type { Tono } from "@/admin/armazon/Insignia";
import type { PaginaParaEditar } from "@/datos/consultas/editor-de-paginas";

/**
 * La insignia de una página según su estado (SPEC §4 de
 * `work/editor-sin-pared/`): un borrador pide atención y va fuerte; lo
 * publicado es el estado estable; sin borrador ni publicación, el sitio
 * muestra el contenido inicial del código, y va apagada.
 */
export function insigniaDelEstado(estado: PaginaParaEditar["estado"]): { tono: Tono; etiqueta: string } {
  if (estado.borradorEn) return { tono: "fuerte", etiqueta: "Borrador sin publicar" };
  if (estado.publicadoEn) return { tono: "normal", etiqueta: "Publicada" };
  return { tono: "apagado", etiqueta: "Sin editar" };
}
