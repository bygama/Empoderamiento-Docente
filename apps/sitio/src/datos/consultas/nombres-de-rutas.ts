import { PAGINAS } from "@/contenido/paginas";
import { base } from "@/datos/cliente";

/**
 * Cómo se llama cada ruta del sitio, para que Métricas diga «Qué hacemos» y
 * no «/que-hacemos»: las siete páginas por su nombre, el CV por el suyo y una
 * novedad por su título publicado. Lo que no se sabe nombrar (una ruta que ya
 * no existe) no está en el mapa, y la pantalla muestra la ruta.
 */
export async function nombresDeRutas(rutas: readonly string[]): Promise<Map<string, string>> {
  const nombres = new Map<string, string>(Object.values(PAGINAS).map((p) => [p.ruta, p.nombre]));
  nombres.set("/sumate-al-equipo", "Sumate al equipo");
  const slugs = rutas.filter((r) => r.startsWith("/novedades/")).map((r) => r.slice("/novedades/".length));
  if (slugs.length) {
    const novedades = await base.novedad.findMany({ where: { slug: { in: slugs }, titulo: { not: null } }, select: { slug: true, titulo: true } });
    for (const n of novedades) if (n.slug && n.titulo) nombres.set(`/novedades/${n.slug}`, n.titulo);
  }
  return new Map(rutas.flatMap((r) => (nombres.has(r) ? [[r, nombres.get(r) as string] as const] : [])));
}
