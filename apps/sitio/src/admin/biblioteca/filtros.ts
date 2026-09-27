import { z } from "zod";
import type { FiltrosDeMateriales, Salud } from "@/datos/consultas/lista-de-materiales";
import { TIPOS } from "@/features/biblioteca/contenido/modelo";

/**
 * Los filtros de la lista de la Biblioteca, que viven en la URL (el buscador
 * es un formulario `GET`). Llegan de afuera, así que se validan con Zod en el
 * borde: lo que no sirve se ignora, no rompe la pantalla.
 */

export const ESTADOS = { publicado: "Publicados", oculto: "Ocultos" } as const;
export const SALUDES: Record<Salud, string> = { "link-roto": "Link roto", "sin-portada": "Sin portada", incompletos: "Datos incompletos" };

export type Filtros = FiltrosDeMateriales & { pagina: number };

const primero = (valor: unknown) => (Array.isArray(valor) ? valor[0] : valor);
const opcional = <T extends z.ZodType>(esquema: T) => z.preprocess(primero, esquema.optional()).catch(undefined);

const esquema = z.object({
  q: opcional(z.string().trim().max(100).transform((q) => q || undefined)),
  tipo: opcional(z.enum(TIPOS)),
  estado: opcional(z.enum(["publicado", "oculto"])),
  salud: opcional(z.enum(["link-roto", "sin-portada", "incompletos"])),
  pagina: z.preprocess(primero, z.coerce.number().int().min(1).max(1000)).catch(1),
});

export function leerFiltros(parametros: Record<string, string | string[] | undefined>): Filtros {
  return esquema.parse(parametros);
}

const CLAVES = ["tipo", "estado", "salud", "q"] as const;
type EnLaUrl = Partial<Record<(typeof CLAVES)[number], string>>;

/** La URL de la lista con estos filtros, en esa página; sin lo vacío. */
export function urlDeBiblioteca(filtros: EnLaUrl, pagina = 1): string {
  const parametros = new URLSearchParams();
  for (const clave of CLAVES) {
    const valor = filtros[clave];
    if (valor) parametros.set(clave, valor);
  }
  if (pagina > 1) parametros.set("pagina", String(pagina));
  const consulta = parametros.toString();
  return `/admin/biblioteca${consulta ? `?${consulta}` : ""}`;
}

/** Los filtros que la búsqueda conserva al buscar o al borrar lo buscado: todos menos la búsqueda y la página. */
export function conservados({ tipo, estado, salud }: Filtros): Record<string, string> {
  return Object.fromEntries(Object.entries({ tipo, estado, salud }).filter((par): par is [string, string] => Boolean(par[1])));
}
