import { base } from "@/datos/cliente";
import type { Corrida } from "@/lib/tareas/corredor";

// La tabla común de lo programado (ADR-0011): cada corrida de cada tarea, del
// cron o de «Actualizar ahora». La leen el panel de cada copia y, después,
// Ajustes › Conexiones.

export type UltimaCorrida = { corridaEn: Date; ok: boolean; detalle: string };

export async function registrarCorrida({ clave, ok, detalle }: Corrida): Promise<void> {
  await base.corridaDeTarea.create({ data: { tarea: clave, ok, detalle } });
}

export async function ultimaCorrida(tarea: string): Promise<UltimaCorrida | null> {
  return base.corridaDeTarea.findFirst({
    where: { tarea },
    orderBy: { corridaEn: "desc" },
    select: { corridaEn: true, ok: true, detalle: true },
  });
}
