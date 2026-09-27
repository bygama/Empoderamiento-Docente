import { cvAbierto } from "@/config/cv";
import { PAGINAS } from "@/contenido/paginas";
import { NOVEDADES } from "@/features/novedades/data/novedades";

/**
 * Las rutas públicas que existen hoy, en el orden del menú (work/ajustes/SPEC.md
 * §5.2): una sola lista para el `sitemap.xml`, la revisión de indexación y el
 * «hacia» de una redirección. Las siete páginas del registro, las fichas de
 * novedad que existen y `/sumate-al-equipo` solo con el formulario de CV
 * abierto (`CV_ABIERTO=si`; apagada da 404). Nunca el admin ni la API.
 *
 * Asíncrona a propósito: cuando las novedades vivan en la base (lane 6), sus
 * fichas salen de su consulta.
 */
export async function rutasDelSitio(entorno: Record<string, string | undefined> = process.env): Promise<string[]> {
  const paginas = Object.values(PAGINAS).map((p) => p.ruta);
  const novedades = NOVEDADES.filter((n) => n.cuerpo).map((n) => `/novedades/${n.id}`);
  return [...paginas, ...novedades, ...(cvAbierto(entorno) ? ["/sumate-al-equipo"] : [])];
}
