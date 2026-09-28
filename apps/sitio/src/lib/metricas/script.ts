import { fuenteDeVisitas } from "./entorno";

// Qué script de analítica carga el sitio (ADR-0018): el de la fuente activa,
// la misma que copia la tarea diaria, y uno solo. Sin dominio de ED.

export type ScriptDeAnalitica = { tipo: "vercel" } | { tipo: "umami"; sitio: string } | null;

/**
 * La fuente sale de `fuenteDeVisitas`, la regla que usan también la copia y
 * Ajustes › Conexiones:
 * - Umami, con sus tres variables: su script, que sirve el proxy del VPS en
 *   `/umami/script.js`. En Vercel no hay proxy y daría 404: Conexiones lo
 *   avisa (`config/conexiones.ts`).
 * - Vercel, en Vercel con sus variables: el de Vercel Web Analytics, que pega a
 *   `/_vercel/insights`, que solo existe ahí.
 * - Ninguna: ninguno. Y nunca fuera de producción: no hay nada que medir.
 */
export function scriptDeAnalitica(entorno: Record<string, string | undefined>): ScriptDeAnalitica {
  if (entorno.NODE_ENV !== "production") return null;
  const fuente = fuenteDeVisitas(entorno);
  if (fuente === "umami") return { tipo: "umami", sitio: entorno.UMAMI_WEBSITE_ID! };
  if (fuente === "vercel") return { tipo: "vercel" };
  return null;
}
