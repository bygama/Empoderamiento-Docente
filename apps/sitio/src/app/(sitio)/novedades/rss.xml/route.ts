import { siteConfig } from "@/config/site";
import { novedadesPublicadas } from "@/datos/consultas/novedades";
import { seoInicial } from "@/features/novedades/contenido/seo";
import { feedDeNovedades } from "@/features/novedades/rss";

// El feed de las novedades: estático, y publicar, despublicar o borrar una
// novedad lo revalida (SPEC §7.3 de `work/novedades-y-kit/`).
export const dynamic = "force-static";

export async function GET() {
  const xml = feedDeNovedades(await novedadesPublicadas(), { sitio: siteConfig.url, descripcion: seoInicial.descripcion });
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
