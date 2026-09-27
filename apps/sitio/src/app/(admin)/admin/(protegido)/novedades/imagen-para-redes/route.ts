import { imagenDeLaVistaPrevia } from "@/datos/consultas/imagen-para-redes";

// La imagen para redes de lo que está en pantalla, para la vista previa de la
// ficha. La sesión y el permiso los verifica `imagenDeLaVistaPrevia`, porque
// una ruta no pasa por el layout protegido ni por la guarda.
export async function GET(pedido: Request): Promise<Response> {
  return imagenDeLaVistaPrevia(pedido);
}
