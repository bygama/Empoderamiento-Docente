/** Si `ruta` es `href` o cuelga de él: `/admin/contenido/paginas/inicio` está en `/admin/contenido/paginas`, `/admin/contenido/paginas-viejas` no. */
export function estaEn(ruta: string, href: string): boolean {
  return ruta === href || ruta.startsWith(`${href}/`);
}
