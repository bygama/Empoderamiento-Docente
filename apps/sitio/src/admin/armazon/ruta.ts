/** Si `ruta` es `href` o cuelga de él: `/admin/contenido/paginas/inicio` está en `/admin/contenido/paginas`, `/admin/contenido/paginas-viejas` no. */
export function estaEn(ruta: string, href: string): boolean {
  return ruta === href || ruta.startsWith(`${href}/`);
}

/**
 * Cuál de las pestañas se enciende: **la más específica**, la de `href` más
 * largo entre las que contienen la ruta. Así la puerta de un módulo puede ser
 * una pestaña más (Resumen es `/admin/metricas`) sin encenderse en las otras.
 * `undefined` si ninguna la contiene.
 */
export function pestanaActiva(ruta: string, hrefs: readonly string[]): string | undefined {
  return hrefs.filter((href) => estaEn(ruta, href)).reduce<string | undefined>((mejor, href) => (!mejor || href.length > mejor.length ? href : mejor), undefined);
}
