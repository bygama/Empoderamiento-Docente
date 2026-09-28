import type { ClienteDeAnaliticas } from "./cliente";
import { crearClienteDeUmami } from "./umami";
import { crearClienteDeAnaliticas } from "./vercel";

// De dónde salen las visitas, elegido por las variables (ADR-0018): Umami en
// un VPS, Vercel Web Analytics en Vercel. El token de Vercel abre toda la
// cuenta, no solo la analítica (ADR-0009): por eso solo va en Production, y
// fuera de Vercel no se usa aunque esté.

export type FuenteDeVisitas = "umami" | "vercel";
type Entorno = Record<string, string | undefined>;

/** Las variables que configuran cada fuente, todas necesarias. */
export const VARIABLES_DE_LA_FUENTE = {
  umami: ["UMAMI_API_URL", "UMAMI_API_KEY", "UMAMI_WEBSITE_ID"],
  vercel: ["VERCEL_TOKEN", "VERCEL_ANALYTICS_PROJECT_ID"],
} as const satisfies Record<FuenteDeVisitas, readonly string[]>;

const tiene = (entorno: Entorno, fuente: FuenteDeVisitas) => VARIABLES_DE_LA_FUENTE[fuente].every((v) => entorno[v]);

/**
 * La fuente que se copia: la usan la copia diaria y Ajustes › Conexiones.
 * Umami si están sus variables; si no, Vercel si el sitio corre en Vercel
 * (`VERCEL`, que pone Vercel) con las suyas; si no, ninguna. El script del
 * sitio (`script.ts`) sigue la misma regla salvo en una cosa: en Vercel carga
 * el de Vercel aunque falten el token y el proyecto, que son solo de la copia,
 * porque una visita que no se contó no se recupera.
 */
export function fuenteDeVisitas(entorno: Entorno = process.env): FuenteDeVisitas | null {
  if (tiene(entorno, "umami")) return "umami";
  if (entorno.VERCEL && tiene(entorno, "vercel")) return "vercel";
  return null;
}

/**
 * La fuente que corresponde aunque todavía falten sus variables: la
 * configurada, o la del host (Vercel en Vercel, Umami en cualquier otro lado).
 * Es la que se nombra cuando no hay ninguna.
 */
export function fuenteEsperada(entorno: Entorno = process.env): FuenteDeVisitas {
  return fuenteDeVisitas(entorno) ?? (entorno.VERCEL ? "vercel" : "umami");
}

/**
 * Por qué no hay números, cuando faltan las variables. Una sola frase: la dicen
 * Métricas › Resumen y el Inicio, y tienen que decir lo mismo.
 */
export const SIN_VARIABLES_DE_METRICAS = "Faltan las variables de la analítica";

export function hayVariablesDeMetricas(entorno: Entorno = process.env): boolean {
  return fuenteDeVisitas(entorno) !== null;
}

export function clienteDesdeEntorno(entorno: Entorno = process.env): ClienteDeAnaliticas | null {
  const fuente = fuenteDeVisitas(entorno);
  if (fuente === "umami") return crearClienteDeUmami({ url: entorno.UMAMI_API_URL!, apiKey: entorno.UMAMI_API_KEY!, sitio: entorno.UMAMI_WEBSITE_ID! });
  if (fuente === "vercel") {
    return crearClienteDeAnaliticas({
      token: entorno.VERCEL_TOKEN!,
      proyecto: entorno.VERCEL_ANALYTICS_PROJECT_ID!,
      equipo: entorno.VERCEL_TEAM_ID || undefined,
    });
  }
  return null;
}
