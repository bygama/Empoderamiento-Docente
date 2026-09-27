import { cvAbierto } from "@/config/cv";
import { PAGINAS } from "@/contenido/paginas";
import { slugsConFicha } from "@/datos/consultas/novedades";

/**
 * Las rutas públicas que existen hoy, en el orden del menú (work/ajustes/SPEC.md
 * §5.2): una sola lista para el `sitemap.xml`, la revisión de indexación y el
 * «hacia» de una redirección. Las siete páginas del registro, las fichas de
 * novedad que existen y `/sumate-al-equipo` solo con el formulario de CV
 * abierto (`CV_ABIERTO=si`; apagada da 404). Nunca el admin ni la API.
 *
 * Las fichas de novedad son las publicadas con cuerpo, de la base
 * (`slugsConFicha`); sin base, ninguna.
 */
export async function rutasDelSitio(entorno: Record<string, string | undefined> = process.env): Promise<string[]> {
  const paginas = Object.values(PAGINAS).map((p) => p.ruta);
  const novedades = (await slugsConFicha()).map((slug) => `/novedades/${slug}`);
  return [...paginas, ...novedades, ...(cvAbierto(entorno) ? ["/sumate-al-equipo"] : [])];
}
