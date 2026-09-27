import { siteConfig } from "@/config/site";
import { novedadesPublicadas } from "@/datos/consultas/novedades";
import { contenidoDe } from "@/datos/consultas/paginas";
import { feedDeNovedades } from "@/features/novedades/rss";

// El feed de las novedades: estático, y publicar, despublicar o borrar una
// novedad lo revalida (SPEC §7.3 de `work/novedades-y-kit/`). Su descripción
// es la de la página, la que se edita en su pestaña SEO.
export const dynamic = "force-static";

export async function GET() {
  const [novedades, { seo }] = await Promise.all([novedadesPublicadas(), contenidoDe("novedades")]);
  const xml = feedDeNovedades(novedades, { sitio: siteConfig.url, descripcion: seo.descripcion });
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
