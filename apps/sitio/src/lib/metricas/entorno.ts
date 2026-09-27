import type { ClienteDeAnaliticas } from "./cliente";
import { crearClienteDeAnaliticas } from "./vercel";

// El token abre toda la cuenta de Vercel, no solo la analítica (ADR-0009):
// por eso solo va en Production y en el .env.local de quien lo necesite.

/**
 * Por qué no hay números, cuando faltan las variables. Una sola frase: la dicen
 * Métricas › Resumen y el Inicio, y tienen que decir lo mismo.
 */
export const SIN_VARIABLES_DE_METRICAS = "Faltan las variables de Vercel";

export function hayVariablesDeMetricas(): boolean {
  return Boolean(process.env.VERCEL_TOKEN && process.env.VERCEL_ANALYTICS_PROJECT_ID);
}

export function clienteDesdeEntorno(): ClienteDeAnaliticas | null {
  if (!hayVariablesDeMetricas()) return null;
  return crearClienteDeAnaliticas({
    token: process.env.VERCEL_TOKEN!,
    proyecto: process.env.VERCEL_ANALYTICS_PROJECT_ID!,
    equipo: process.env.VERCEL_TEAM_ID || undefined,
  });
}
