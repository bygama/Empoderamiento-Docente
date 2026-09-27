import { estadoDeBusquedas, totalDeBusquedas, type EstadoDeBusquedas } from "@/datos/consultas/busquedas";
import { estadoDeMetricas, tarjetaDe, type EstadoDeMetricas, type Tarjeta } from "@/datos/consultas/metricas";
import { SIN_VARIABLES_DE_METRICAS } from "@/lib/metricas/entorno";
import { cvRecibidos } from "./de-los-mensajes";
import type { Agregado } from "@/lib/busquedas/lecturas";
import { sumarDias, variacion } from "@/lib/metricas/periodos";

// Lo que lee cada número de «Esta semana», con los mismos cortes que la
// pantalla de su módulo: si Métricas › Resumen dice que faltan las variables,
// el Inicio dice lo mismo en vez de mostrar la última ventana vieja.

/** Un número de la semana y cómo le fue contra la anterior («+12 %», «igual»…). */
export type DeLaSemana = { valor: number; variacion: string };

/** El número; `{ motivo }` si no lo hay por algo que se puede decir; `null` si todavía no hay datos. */
export type LecturaDeLaSemana = DeLaSemana | { motivo: string } | null;

export const DIAS = 7;

/**
 * Los visitantes de la ventana de 7 días, cortando donde corta Resumen
 * (`admin/metricas/Resumen.tsx`): sin variables, su motivo; sin ningún día copiado, nada.
 * Recibe el estado y la ventana para poder probar los cortes sin base.
 */
export async function visitantesSegun(
  estado: Pick<EstadoDeMetricas, "hayVariables" | "hastaDia">,
  ventana: () => Promise<Tarjeta | null>,
): Promise<LecturaDeLaSemana> {
  if (!estado.hayVariables) return { motivo: SIN_VARIABLES_DE_METRICAS };
  if (!estado.hastaDia) return null;
  const actual = await ventana();
  return actual ? { valor: actual.visitantes, variacion: actual.variacionVisitantes } : null;
}

export const SIN_SEARCH_CONSOLE = "Search Console no está conectado";

/**
 * Los clics de los 7 días que terminan en el último copiado (Search Console
 * llega con 2 o 3 días de atraso) contra los 7 anteriores, cortando donde
 * corta Búsquedas: sin conexión no muestra datos.
 */
export async function clicsSegun(
  estado: Pick<EstadoDeBusquedas, "conectado" | "hastaDia">,
  total: (desde: string, hasta: string) => Promise<Agregado | null>,
): Promise<LecturaDeLaSemana> {
  if (!estado.conectado) return { motivo: SIN_SEARCH_CONSOLE };
  if (!estado.hastaDia) return null;
  const desde = sumarDias(estado.hastaDia, -(DIAS - 1));
  const hastaAnterior = sumarDias(desde, -1);
  const [actual, anterior] = await Promise.all([total(desde, estado.hastaDia), total(sumarDias(hastaAnterior, -(DIAS - 1)), hastaAnterior)]);
  const clics = actual?.clics ?? 0;
  return { valor: clics, variacion: variacion(clics, anterior ? anterior.clics : null) };
}

/**
 * Los CV que llegaron en los últimos 7 días contra los 7 anteriores. Mensajes
 * cuenta en el momento: acá la semana termina ahora, y un cero es un cero.
 */
export async function cvDeLaSemana(hoy: Date = new Date()): Promise<LecturaDeLaSemana> {
  const semana = DIAS * 86_400_000;
  const desde = new Date(hoy.getTime() - semana);
  const [actual, anterior] = await Promise.all([cvRecibidos(desde, hoy), cvRecibidos(new Date(desde.getTime() - semana), desde)]);
  return { valor: actual, variacion: variacion(actual, anterior) };
}

export async function visitantes(): Promise<LecturaDeLaSemana> {
  return visitantesSegun(await estadoDeMetricas(), () => tarjetaDe(DIAS));
}

export async function clicsDeGoogle(): Promise<LecturaDeLaSemana> {
  return clicsSegun(await estadoDeBusquedas(), totalDeBusquedas);
}
