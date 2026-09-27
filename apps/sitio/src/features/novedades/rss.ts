import { rss } from "@/lib/rss";
import { etiquetaDeCategoria } from "./contenido/modelo";
import type { NovedadDelSitio } from "./contenido/novedad";

// El feed de las novedades (`/novedades/rss.xml`): cada publicada, en el orden
// del sitio. Una novedad con ficha lleva a su ficha; sin ficha, al listado.

/** La fecha de una novedad como día: «2026-07» es el 1 de julio, «2026» el 1 de enero. */
function diaDe(fecha: string): Date {
  const [anio, mes = 1, dia = 1] = fecha.split("-").map(Number);
  return new Date(Date.UTC(anio, mes - 1, dia));
}

export function feedDeNovedades(novedades: readonly NovedadDelSitio[], { sitio, descripcion }: { sitio: string; descripcion: string }): string {
  const listado = new URL("/novedades", sitio).href;
  return rss(
    { titulo: "Novedades · Empoderamiento Docente", link: listado, descripcion, propio: new URL("/novedades/rss.xml", sitio).href, idioma: "es" },
    novedades.map((n) => ({
      titulo: n.titulo,
      link: n.cuerpo.length > 0 ? new URL(`/novedades/${n.slug}`, sitio).href : listado,
      // El slug y no el link: una novedad sin ficha comparte el link del listado.
      guid: `${listado}/${n.slug}`,
      fecha: diaDe(n.fecha),
      descripcion: n.bajada,
      categoria: etiquetaDeCategoria(n.categoria),
    })),
  );
}
