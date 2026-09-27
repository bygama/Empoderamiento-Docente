import type { Tono } from "@/admin/armazon/Insignia";

// El estado de un perfil del Equipo en una insignia (DESIGN.md §11,
// «Insignias de estado»): lo que pide atención va fuerte, lo estable normal,
// lo que salió del sitio apagado. Lo usan la ficha y la lista.

type Estado = { publicado: boolean; publicadoEn: string | null; borradorEn: string | null };

/** `id` nulo es un perfil que todavía no se guardó nunca. */
export function insigniaDelPerfil({ publicado, publicadoEn, borradorEn }: Estado, id: string | null): { tono: Tono; texto: string } {
  if (!id) return { tono: "apagado", texto: "Sin guardar" };
  if (publicado) return borradorEn ? { tono: "fuerte", texto: "Cambios sin publicar" } : { tono: "normal", texto: "Publicado" };
  return publicadoEn ? { tono: "apagado", texto: "Despublicado" } : { tono: "fuerte", texto: "Sin publicar" };
}
