import { z } from "zod";
import { esquemaDelId } from "@/datos/esquemas";
import { esModuloDeActividad, type ModuloDeActividad } from "./modulos";

/**
 * Los filtros de Cuentas › Actividad, que viven en la URL (el buscador es un
 * formulario `GET`). Llegan de afuera, así que se validan con Zod en el
 * borde: lo que no sirve se ignora, no rompe la pantalla.
 */

/** «Cuándo»: rangos relativos, que no dependen de la zona de quien mira (SPEC de work/cuentas §4.4). */
export const CUANDO = {
  "24h": { texto: "Últimas 24 horas", dias: 1 },
  "7d": { texto: "Últimos 7 días", dias: 7 },
  "30d": { texto: "Últimos 30 días", dias: 30 },
  "3m": { texto: "Últimos 3 meses", dias: 91 },
} as const;
type Cuando = keyof typeof CUANDO;

export type Filtros = { q?: string; persona?: string; modulo?: ModuloDeActividad; cuando?: Cuando; pagina: number };

const primero = (valor: unknown) => (Array.isArray(valor) ? valor[0] : valor);
const opcional = <T extends z.ZodType>(esquema: T) => z.preprocess(primero, esquema.optional()).catch(undefined);

const esquema = z.object({
  q: opcional(z.string().trim().max(100).transform((q) => q || undefined)),
  persona: opcional(esquemaDelId),
  modulo: opcional(z.string().refine(esModuloDeActividad).transform((m) => m as ModuloDeActividad)),
  cuando: opcional(z.enum(Object.keys(CUANDO) as [Cuando, ...Cuando[]])),
  pagina: z.preprocess(primero, z.coerce.number().int().min(1).max(10_000)).catch(1),
});

export function leerFiltros(parametros: Record<string, string | string[] | undefined>): Filtros {
  return esquema.parse(parametros);
}

export function hayFiltros({ q, persona, modulo, cuando }: Filtros): boolean {
  return Boolean(q || persona || modulo || cuando);
}

const CLAVES = ["q", "persona", "modulo", "cuando"] as const;
type EnLaUrl = Partial<Record<(typeof CLAVES)[number], string>>;

/** La URL de la actividad con estos filtros, en esa página; sin lo vacío. */
export function urlDeActividad(filtros: EnLaUrl, pagina: number): string {
  const parametros = new URLSearchParams();
  for (const clave of CLAVES) {
    const valor = filtros[clave];
    if (valor) parametros.set(clave, valor);
  }
  if (pagina > 1) parametros.set("pagina", String(pagina));
  const consulta = parametros.toString();
  return `/admin/cuentas/actividad${consulta ? `?${consulta}` : ""}`;
}

/** Los filtros que la búsqueda conserva al buscar o al borrar lo buscado: todos menos la búsqueda y la página. */
export function conservados({ persona, modulo, cuando }: Filtros): Record<string, string> {
  return Object.fromEntries(Object.entries({ persona, modulo, cuando }).filter((par): par is [string, string] => Boolean(par[1])));
}
