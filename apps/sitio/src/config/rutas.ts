import { PAGINAS } from "@/contenido/paginas";
import type { RutaDeclarada } from "@/lib/seo/rutas";

/**
 * Todo lo que el sitio contesta, como sus carpetas en `app/` (sin los grupos)
 * y las de `public/` (work/ajustes/SPEC.md §5.1). Ajustes › SEO no acepta una
 * redirección desde una ruta que el sitio contesta por su cuenta: ahí nunca se
 * aplicaría. `rutas.test.ts` recorre `app/` y `public/` y falla si algo no está
 * declarado acá, o si algo declarado ya no está: una ruta nueva no reabre el
 * hueco en silencio.
 *
 * El `sitemap.xml` es otra lista, más corta: las páginas que se muestran
 * (`datos/consultas/rutas-del-sitio.ts`).
 */
export const RUTAS_DE_LA_APP: readonly RutaDeclarada[] = [
  ...Object.values(PAGINAS).map(({ ruta }) => ({ ruta, contesta: "sola" as const })),
  // Con el formulario de CV cerrado no va al sitemap, pero su página contesta igual: da 404 ella.
  { ruta: "/sumate-al-equipo", contesta: "sola" },
  { ruta: "/novedades/[slug]/imagen-para-redes", contesta: "sola" },
  { ruta: "/novedades/rss.xml", contesta: "sola" },
  // La portada tipográfica de un material sin portada propia; lo que no es un publicado, 404.
  { ruta: "/biblioteca/portada/[id]", contesta: "sola" },
  // Los que Next arma desde los archivos de app/.
  { ruta: "/sitemap.xml", contesta: "sola" },
  { ruta: "/robots.txt", contesta: "sola" },
  { ruta: "/favicon.ico", contesta: "sola" },
  { ruta: "/apple-icon*.png", contesta: "sola" },
  { ruta: "/opengraph-image*.png", contesta: "sola" },
  // El admin y la API, enteros.
  { ruta: "/admin/[[...todo]]", contesta: "sola" },
  { ruta: "/api/[[...todo]]", contesta: "sola" },
  // Lo que empieza con «_» es interno de Next (/_next, /_not-found, /_global-error): nunca pasa por la atrapa-todo.
  { ruta: "/_*/[[...todo]]", contesta: "sola" },
  ...["aliados", "biblioteca", "brand", "equipo", "firma", "fotos", "investigacion", "novedades", "quienes-somos"].map((carpeta) => ({
    ruta: `/${carpeta}`,
    contesta: "archivos" as const,
  })),
  // Sin una novedad con ese slug, la ficha busca una redirección; lo que no es de ninguna, la atrapa-todo.
  { ruta: "/novedades/[slug]", contesta: "o-redirige" },
  { ruta: "/[...resto]", contesta: "o-redirige" },
];
