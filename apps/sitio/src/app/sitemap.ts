import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { rutasDelSitio } from "@/datos/consultas/rutas-del-sitio";

// `/sitemap.xml`: las rutas públicas que existen, con la URL del dominio real
// (work/ajustes/SPEC.md §5.2). Sin `lastmod`: no hay una fecha confiable para
// todas, y Google ignora las que no lo son.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return (await rutasDelSitio()).map((ruta) => ({ url: new URL(ruta, siteConfig.url).toString() }));
}
