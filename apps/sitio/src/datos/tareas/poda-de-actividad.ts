import { base } from "@/datos/cliente";
import type { ResultadoDeTarea, Tarea } from "@/lib/tareas/registro";

// La actividad se guarda 12 meses (SPEC del mapa del admin §5.8): lo más viejo
// se borra una vez por día, como una tarea más del cron diario (ADR-0011). Si
// falla, la próxima corrida borra lo que quedó: no hay nada que recuperar.

export const MESES_DE_ACTIVIDAD = 12;

/** El borde: lo anterior a esto se borra. Doce meses de calendario, en UTC. */
export function limiteDeActividad(hoy: Date): Date {
  const limite = new Date(hoy);
  limite.setUTCMonth(limite.getUTCMonth() - MESES_DE_ACTIVIDAD);
  return limite;
}

export async function podarActividad(hoy: Date = new Date()): Promise<ResultadoDeTarea> {
  const { count } = await base.actividad.deleteMany({ where: { en: { lt: limiteDeActividad(hoy) } } });
  return {
    ok: true,
    detalle: count
      ? `${count === 1 ? "Se borró 1 fila" : `Se borraron ${count} filas`} de actividad de más de ${MESES_DE_ACTIVIDAD} meses.`
      : `No había actividad de más de ${MESES_DE_ACTIVIDAD} meses.`,
  };
}

export const podaDeActividad: Tarea = {
  clave: "poda-de-actividad",
  nombre: "Poda de la actividad",
  correr: () => podarActividad(),
};
