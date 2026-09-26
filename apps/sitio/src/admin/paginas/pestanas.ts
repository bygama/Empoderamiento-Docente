import type { Pestana } from "@/admin/armazon/Pestanas";

// Las pantallas de una página en el editor (SPEC §7 de `work/paginas-inicio/`):
// pestañas que son rutas, debajo de su encabezado. Sin datos de la base: las
// arma la ruta con lo que la página tiene.

export const EDITOR_DE_PAGINAS = "/admin/contenido/paginas";

/** Las pestañas de una página: las de edición que tenga (sus secciones, su SEO) y las que revisan lo guardado. */
export function pestanasDeLaPagina(slug: string, tiene: { secciones: boolean; seo: boolean }): Pestana[] {
  const base = `${EDITOR_DE_PAGINAS}/${slug}`;
  return [
    ...(tiene.secciones ? [{ href: base, etiqueta: "Secciones" }] : []),
    ...(tiene.seo ? [{ href: `${base}/seo`, etiqueta: "SEO" }] : []),
    { href: `${base}/cambios`, etiqueta: "Qué cambió" },
    { href: `${base}/versiones`, etiqueta: "Versiones" },
  ];
}
