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

/**
 * Las cuatro tarjetas: 7 y 30 días, cada una contra la ventana anterior.
 * Toma la ventana más nueva que exista para cada `dias`, no la que coincide
 * con `hastaDia`: las ventanas se escriben con `fechaFin = ayer`, pero
 * `hastaDia` sale del último `total`, y si la API omite un día sin tráfico
 * las dos fechas se separan y la grilla quedaría vacía sin necesidad.
 */
export async function tarjetas(): Promise<Tarjeta[]> {
  // Las dos ventanas (7 y 30 días) no dependen una de la otra: van juntas con
  // Promise.all. Adentro de cada una sí hay una dependencia real (`anterior`
  // necesita la fecha de `actual`), por eso ahí el await queda en serie.
  const porVentana = await Promise.all(
    ([7, 30] as const).map(async (dias): Promise<Tarjeta | null> => {
      const actual = await base.metricaVentana.findFirst({ where: { dias }, orderBy: { fechaFin: "desc" } });
      if (!actual) return null;
      const anterior = await base.metricaVentana.findUnique({
        where: { fechaFin_dias: { fechaFin: fechaUTC(sumarDias(diaISO(actual.fechaFin), -dias)), dias } },
      });
      return {
        dias,
        vistas: actual.vistas,
        visitantes: actual.visitantes,
        variacionVistas: variacion(actual.vistas, anterior?.vistas ?? null),
        variacionVisitantes: variacion(actual.visitantes, anterior?.visitantes ?? null),
      };
    }),
  );
  return porVentana.filter((t): t is Tarjeta => t !== null);
}
