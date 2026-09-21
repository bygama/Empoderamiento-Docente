import { readFile } from "node:fs/promises";
import { buscarEnDisco, carpetaLocal, hayBlob } from "@/lib/contenido/almacen";

// Las fotos subidas en local viven en apps/sitio/.fotos/ y salen por acá. En
// Vercel están en Blob y esta ruta no sirve nada: no hay carpeta que mirar.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  if (hayBlob()) return new Response("No encontrado", { status: 404 });
  const { id } = await params;
  const archivo = await buscarEnDisco(carpetaLocal(), id);
  if (!archivo) return new Response("No encontrado", { status: 404 });
  // Copia a un Uint8Array con ArrayBuffer propio: un Buffer no entra en BodyInit desde TS 5.7.
  return new Response(new Uint8Array(await readFile(archivo.ruta)), {
    headers: { "Content-Type": archivo.tipo, "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
