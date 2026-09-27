import { diaISO, fechaUTC } from "@/lib/metricas/periodos";
import { base } from "./cliente";

/**
 * Las marcas que se agregan a mano en la curva del Resumen (tabla `marcas`,
 * SPEC de work/metricas-completas/ §6.1.1). Las de publicar no viven acá:
 * salen de `actividad` (`datos/consultas/marcas.ts`). Su largo máximo,
 * `LARGO_DE_UNA_MARCA`, está en `config/metricas.ts`: lo usa también el
 * formulario.
 */

export async function crearMarca({ fecha, texto, creadaPor }: { fecha: string; texto: string; creadaPor: string }): Promise<{ id: string }> {
  return base.marca.create({ data: { fecha: fechaUTC(fecha), texto, creadaPor }, select: { id: true } });
}

/** Borra la marca y devuelve qué decía, o `null` si ya no estaba. */
export async function borrarMarca(id: string): Promise<{ texto: string } | null> {
  const [borrada] = await base.$transaction([base.marca.findUnique({ where: { id }, select: { texto: true } }), base.marca.deleteMany({ where: { id } })]);
  return borrada;
}

/** Si una fecha `AAAA-MM-DD` sirve para una marca: existe y no es futura (en UTC, como los días de la curva). */
export function fechaDeMarcaValida(fecha: string, hoy: Date = new Date()): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || fecha < "2000-01-01") return false;
  const valida = diaISO(fechaUTC(fecha)) === fecha;
  return valida && fecha <= diaISO(hoy);
}
