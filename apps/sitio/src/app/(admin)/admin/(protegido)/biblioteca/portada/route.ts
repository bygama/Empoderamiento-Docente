import { portadaDeLaVistaPrevia } from "@/datos/consultas/portada-de-la-vista-previa";

// La portada tipográfica de lo que está en pantalla, para la ficha de un
// material. La sesión y el permiso los verifica `portadaDeLaVistaPrevia`,
// porque una ruta no pasa por el layout protegido ni por la guarda.
export async function GET(pedido: Request): Promise<Response> {
  return portadaDeLaVistaPrevia(pedido);
}
