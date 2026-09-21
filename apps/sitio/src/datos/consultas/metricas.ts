import { base } from "@/datos/cliente";
import { hayVariablesDeMetricas } from "@/lib/metricas/entorno";
import { diaISO, fechaUTC, sumarDias, variacion } from "@/lib/metricas/periodos";

// Lo que lee el panel. Solo de nuestras tablas: nunca de la API en el render.

export type EstadoDeMetricas = {
  hayVariables: boolean;
  hastaDia: string | null;
  ultima: { corridaEn: Date; ok: boolean; detalle: string } | null;
};

export async function estadoDeMetricas(): Promise<EstadoDeMetricas> {
  const [ultimoTotal, ultima] = await Promise.all([
    base.metricaDiaria.findFirst({ where: { dimension: "total" }, orderBy: { fecha: "desc" } }),
    base.sincronizacionMetricas.findFirst({ orderBy: { corridaEn: "desc" }, select: { corridaEn: true, ok: true, detalle: true } }),
  ]);
  return { hayVariables: hayVariablesDeMetricas(), hastaDia: ultimoTotal ? diaISO(ultimoTotal.fecha) : null, ultima };
}

export type Tarjeta = {
  dias: 7 | 30;
  vistas: number;
  visitantes: number;
  variacionVistas: string;
  variacionVisitantes: string;
};

/** Las cuatro tarjetas: 7 y 30 días, cada una contra la ventana anterior. */
export async function tarjetas(hastaDia: string): Promise<Tarjeta[]> {
  const resultado: Tarjeta[] = [];
  for (const dias of [7, 30] as const) {
    const [actual, anterior] = await Promise.all([
      base.metricaVentana.findUnique({ where: { fechaFin_dias: { fechaFin: fechaUTC(hastaDia), dias } } }),
      base.metricaVentana.findUnique({ where: { fechaFin_dias: { fechaFin: fechaUTC(sumarDias(hastaDia, -dias)), dias } } }),
    ]);
    if (!actual) continue;
    resultado.push({
      dias,
      vistas: actual.vistas,
      visitantes: actual.visitantes,
      variacionVistas: variacion(actual.vistas, anterior?.vistas ?? null),
      variacionVisitantes: variacion(actual.visitantes, anterior?.visitantes ?? null),
    });
  }
  return resultado;
}
