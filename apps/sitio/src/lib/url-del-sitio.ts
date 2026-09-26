/**
 * La URL del sitio, sin barra final, para armar los links de los correos:
 * `NEXT_PUBLIC_SITE_URL`, o la que da Vercel (la de producción en producción,
 * la del deploy en un preview), o `localhost:3000`.
 */
export function urlDelSitio(entorno: Record<string, string | undefined> = process.env): string {
  const cruda =
    entorno.NEXT_PUBLIC_SITE_URL ??
    (entorno.VERCEL_ENV === "production" && entorno.VERCEL_PROJECT_PRODUCTION_URL ? `https://${entorno.VERCEL_PROJECT_PRODUCTION_URL}` : undefined) ??
    (entorno.VERCEL_URL ? `https://${entorno.VERCEL_URL}` : undefined) ??
    "http://localhost:3000";
  // Los links se arman pegando rutas: con barra final quedarían con doble barra.
  return cruda.replace(/\/+$/, "");
}
