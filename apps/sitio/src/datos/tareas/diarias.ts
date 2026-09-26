import { correrTareas, type Corrida } from "@/lib/tareas/corredor";
import { definirTareas } from "@/lib/tareas/registro";
import { registrarCorrida } from "./corridas";
import { copiaDeVercel } from "./metricas-de-vercel";

/**
 * Lo que corre el cron diario (`/api/cron/diario`), una vez por día. Vercel
 * Hobby corre pocos crons y una vez por día, así que un módulo que necesite
 * algo programado (el chequeo de links, la retención, el resumen semanal)
 * suma su tarea acá, no un cron nuevo (ADR-0011).
 */
export const TAREAS_DIARIAS = definirTareas([copiaDeVercel]);

/**
 * Cada tarea tiene 50 segundos: la función tiene 60, y así una que se cuelga
 * queda registrada como fallida antes de que Vercel corte todo.
 */
export const LIMITE_POR_TAREA_MS = 50_000;

export async function correrTareasDiarias(): Promise<Corrida[]> {
  return correrTareas(TAREAS_DIARIAS, { registrar: registrarCorrida, limiteMs: LIMITE_POR_TAREA_MS });
}
