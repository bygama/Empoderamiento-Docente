import { notFound } from "next/navigation";
import { abrirEnlace } from "@/datos/abrir-enlace";

// El link corto para compartir (work/metricas-completas/SPEC.md §6.4): cuenta
// el clic y lleva a la página con un 307. Un código que no es de ningún link
// da el 404 del sitio. La ruta solo delega: contar y buscar es de `datos/`.
export async function GET(pedido: Request, { params }: { params: Promise<{ codigo: string }> }): Promise<Response> {
  const respuesta = await abrirEnlace(pedido, (await params).codigo);
  return respuesta ?? notFound();
}
