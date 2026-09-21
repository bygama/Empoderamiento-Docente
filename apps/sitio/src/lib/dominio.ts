/**
 * ¿Este deploy es un preview de Vercel?
 *
 * `VERCEL_ENV` lo fija Vercel solo (`"production"`, `"preview"` o
 * `"development"`) y no depende de ninguna variable que tengamos que
 * configurar nosotros; en local viene `undefined`. Los previews son URLs
 * públicas que Google puede indexar con canonicals que apuntan al dominio
 * real, así que se cierran. Producción y local no se tocan: production
 * porque es el sitio de verdad, local porque nadie externo lo puede pedir.
 */
export function esUnPreviewDeVercel(entorno: string | undefined): boolean {
  // Una cadena vacía cuenta como «sin entorno»: si alguien deja VERCEL_ENV
  // vacía por accidente en producción, el dominio real no se cierra.
  return Boolean(entorno) && entorno !== "production";
}
