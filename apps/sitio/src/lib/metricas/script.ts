// Qué script de analítica carga el sitio (ADR-0018): uno solo, según dónde
// corre, y nunca uno que dé 404. Sin dominio de ED.

export type ScriptDeAnalitica = { tipo: "vercel" } | { tipo: "umami"; sitio: string } | null;

/**
 * - En Vercel (`VERCEL`, que Vercel pone en el build y en el runtime), el de
 *   Vercel Web Analytics: pega a `/_vercel/insights`, que solo existe ahí.
 *   Manda aunque haya variables de Umami, porque `/umami/…` en Vercel no existe.
 * - Fuera de Vercel, con `UMAMI_WEBSITE_ID`, el de Umami, que sirve el proxy
 *   del VPS en `/umami/script.js`.
 * - Si no, ninguno. Y nunca fuera de producción: no hay nada que medir.
 */
export function scriptDeAnalitica(entorno: Record<string, string | undefined>): ScriptDeAnalitica {
  if (entorno.NODE_ENV !== "production") return null;
  if (entorno.VERCEL) return { tipo: "vercel" };
  if (entorno.UMAMI_WEBSITE_ID) return { tipo: "umami", sitio: entorno.UMAMI_WEBSITE_ID };
  return null;
}
