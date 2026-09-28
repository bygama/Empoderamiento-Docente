import { fuenteDeVisitas } from "./entorno";

// Qué script de analítica carga el sitio (ADR-0018): uno solo, el de la
// fuente que se copia cuando la hay. Sin dominio de ED.

export type ScriptDeAnalitica = { tipo: "vercel" } | { tipo: "umami"; sitio: string } | null;

/**
 * - Umami, si la copia es de Umami (sus tres variables, `fuenteDeVisitas`): su
 *   script, que sirve el proxy del VPS en `/umami/script.js`. En Vercel no hay
 *   proxy y daría 404: Conexiones lo avisa (`config/conexiones.ts`).
 * - Si no, en Vercel (`VERCEL`), el de Vercel Web Analytics, que pega a
 *   `/_vercel/insights`, que solo existe ahí. Sin exigir el token ni el
 *   proyecto: son de la copia, y Vercel cuenta sin ellos (una visita que no se
 *   contó no se recupera, ni en un Preview ni antes de cargar el token).
 * - Si no, ninguno. Y nunca fuera de producción: no hay nada que medir.
 */
export function scriptDeAnalitica(entorno: Record<string, string | undefined>): ScriptDeAnalitica {
  if (entorno.NODE_ENV !== "production") return null;
  if (fuenteDeVisitas(entorno) === "umami") return { tipo: "umami", sitio: entorno.UMAMI_WEBSITE_ID! };
  if (entorno.VERCEL) return { tipo: "vercel" };
  return null;
}
