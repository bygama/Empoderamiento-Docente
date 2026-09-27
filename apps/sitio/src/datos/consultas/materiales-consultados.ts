import { base } from "@/datos/cliente";
import { sumasDe } from "@/datos/contadores";
import { diaISO } from "@/lib/metricas/periodos";
import type { Dia } from "@/lib/metricas/tipos";

// Cuántas veces se abrió cada material de la Biblioteca (el contador
// `material-consultado`, SPEC de work/metricas-completas/ §5): lo leen Qué
// hace la gente, la lista de la Biblioteca del admin y el Inicio.

export type MaterialConsultado = { id: string; titulo: string; consultas: number };

/** Los `cuantos` materiales más consultados entre dos días, con su título; los que ya no existen, no. */
export async function masConsultados(desde: Dia, hasta: Dia, cuantos = 10): Promise<MaterialConsultado[]> {
  const sumas = await sumasDe({ eventos: ["material-consultado"], desde, hasta });
  const porId = new Map<string, number>();
  for (const s of sumas) porId.set(s.clave, (porId.get(s.clave) ?? 0) + s.cuenta);
  const materiales = await base.material.findMany({ where: { id: { in: [...porId.keys()] } }, select: { id: true, titulo: true } });
  return materiales
    .map((m) => ({ id: m.id, titulo: m.titulo ?? "Material sin título", consultas: porId.get(m.id) ?? 0 }))
    .sort((a, b) => b.consultas - a.consultas || a.titulo.localeCompare(b.titulo))
    .slice(0, cuantos);
}

/** Las consultas de cada material en el mes calendario de `hoy` (UTC), del 1 hasta hoy. */
export async function consultasDelMes(hoy: Date = new Date()): Promise<Map<string, number>> {
  const hasta = diaISO(hoy);
  const sumas = await sumasDe({ eventos: ["material-consultado"], desde: `${hasta.slice(0, 7)}-01`, hasta });
  const porId = new Map<string, number>();
  for (const s of sumas) porId.set(s.clave, (porId.get(s.clave) ?? 0) + s.cuenta);
  return porId;
}
