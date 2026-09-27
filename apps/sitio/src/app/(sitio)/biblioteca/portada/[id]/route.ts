import { datosDeLaPortada, idsConPortadaGenerada } from "@/datos/consultas/portadas";
import { portadaTipografica } from "@/features/biblioteca/portada/generar";

// La portada tipográfica generada de cada material publicado sin portada
// propia (SPEC §13.2 de `work/biblioteca/`): estática, y publicar la revalida.
// La pide el catálogo en lugar de la portada que no tiene.
export const dynamic = "force-static";

export async function generateStaticParams() {
  return (await idsConPortadaGenerada()).map((id) => ({ id }));
}

export async function GET(_pedido: Request, { params }: { params: Promise<{ id: string }> }) {
  const datos = await datosDeLaPortada((await params).id);
  if (!datos) return new Response("Ese material no lleva la portada generada.", { status: 404 });
  return portadaTipografica(datos);
}
