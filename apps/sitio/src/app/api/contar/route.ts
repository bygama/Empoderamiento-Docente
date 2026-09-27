import { recibirEvento } from "@/datos/recibir-evento";

// El sitio avisa acá que pasó un evento raro de la lista cerrada (un CV
// enviado, un material consultado) y se suma uno por día (work/metricas-completas/
// SPEC.md §5.2). Contesta siempre 204. La ruta solo delega: validar y contar es
// de `datos/`.
export async function POST(pedido: Request): Promise<Response> {
  return recibirEvento(pedido);
}
