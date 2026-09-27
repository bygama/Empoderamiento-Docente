import { descargarCV } from "@/datos/consultas/archivo-de-cv";

// La descarga del archivo de un CV. Solo hay archivo en la bandeja de CV; la
// sesión y el permiso los verifica `descargarCV`, porque una ruta no pasa por
// el layout protegido ni por la guarda.
export async function GET(pedido: Request, { params }: { params: Promise<{ bandeja: string; id: string }> }): Promise<Response> {
  const { bandeja, id } = await params;
  if (bandeja !== "cv") return new Response("No encontrado", { status: 404 });
  return descargarCV(pedido, id);
}
