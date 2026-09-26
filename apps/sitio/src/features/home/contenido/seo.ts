import { TITULO_DEL_SITIO } from "@/config/metadata";
import { siteConfig } from "@/config/site";
import type { Seo } from "@/lib/contenido/seo";

/**
 * El SEO de Inicio hoy: el título por defecto del sitio, su descripción y la
 * imagen del sitio para redes (sin imagen propia). Los dos textos pasan lo que
 * Google muestra (72 y 241 caracteres): el editor lo avisa, pero es lo que el
 * sitio dice hoy, y cambiarlo es una decisión de ED.
 */
export const seoInicial: Seo = { titulo: TITULO_DEL_SITIO, descripcion: siteConfig.description, imagenParaRedes: null };
