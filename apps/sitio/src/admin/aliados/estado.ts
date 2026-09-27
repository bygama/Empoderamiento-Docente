import type { Tono } from "@/admin/armazon/Insignia";
import type { EstadoDelAliado } from "@/datos/consultas/aliados-del-admin";

/**
 * La insignia de la publicación de un aliado (DESIGN.md §11, «Insignias»):
 * lo que pide atención va fuerte, lo estable normal, lo que salió del sitio
 * apagado. Aparte de la de la autorización, que va al lado.
 */
export function insigniaDeLaPublicacion({ publicado, publicadoEn, borradorEn }: EstadoDelAliado): { tono: Tono; texto: string } {
  if (publicado) return borradorEn ? { tono: "fuerte", texto: "Cambios sin publicar" } : { tono: "normal", texto: "Publicado" };
  return publicadoEn ? { tono: "apagado", texto: "Despublicado" } : { tono: "fuerte", texto: "Borrador" };
}
