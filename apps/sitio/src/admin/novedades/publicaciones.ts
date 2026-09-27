import type { Opcion } from "@ed/kit-admin";
import { MATERIALES } from "@/features/biblioteca/data/materiales";

/**
 * Las publicaciones del catálogo de la Biblioteca que una novedad puede abrir
 * al final de su ficha: el título exacto, con el año para distinguir. Salen
 * del código hasta la lane 8, que pasa el catálogo a la base y esto a una
 * relación (DECISIONS, B).
 */
export function opcionesDePublicacion(): Opcion[] {
  return MATERIALES.map((m) => ({ valor: m.titulo, etiqueta: `${m.titulo} (${m.anio})` }));
}
