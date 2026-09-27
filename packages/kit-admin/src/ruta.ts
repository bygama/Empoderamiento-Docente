/** Si `ruta` es `href` o cuelga de él: `/admin/productos/3` está en `/admin/productos`, `/admin/productos-viejos` no. */
export function estaEn(ruta: string, href: string): boolean {
  return ruta === href || ruta.startsWith(`${href}/`);
}

/**
 * Cuál de las pestañas se enciende: **la más específica**, la de `href` más
 * largo entre las que contienen la ruta. Así la puerta de un módulo puede ser
 * una pestaña más (la primera, con la ruta del módulo) sin encenderse en las
 * otras.
 * `undefined` si ninguna la contiene.
 */
export function pestanaActiva(ruta: string, hrefs: readonly string[]): string | undefined {
  return hrefs.filter((href) => estaEn(ruta, href)).reduce<string | undefined>((mejor, href) => (!mejor || href.length > mejor.length ? href : mejor), undefined);
}
