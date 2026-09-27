import { novedadesPublicadas, slugsConFicha } from "@/datos/consultas/novedades";
import { imagenParaRedes } from "@/features/novedades/imagen-para-redes/generar";

// La imagen para redes generada de cada ficha publicada: estática como la
// ficha, y publicar la revalida. La ficha la pone en su `og:image` cuando no
// tiene una propia.
export const dynamic = "force-static";

export async function generateStaticParams() {
  return (await slugsConFicha()).map((slug) => ({ slug }));
}

export async function GET(_pedido: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const n = (await novedadesPublicadas()).find((x) => x.slug === slug && x.cuerpo.length > 0);
  if (!n) return new Response("Esa novedad no tiene ficha.", { status: 404 });
  return imagenParaRedes(n);
}
