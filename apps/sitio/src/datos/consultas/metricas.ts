import { base } from "@/datos/cliente";
import { ultimaCorrida, type UltimaCorrida } from "@/datos/tareas/corridas";
import { copiaDeVercel } from "@/datos/tareas/metricas-de-vercel";
import { hayVariablesDeMetricas } from "@/lib/metricas/entorno";
import { diaISO, fechaUTC, sumarDias, variacion, type Periodo } from "@/lib/metricas/periodos";

// Lo que lee el panel. Solo de nuestras tablas: nunca de la API en el render.

export type EstadoDeMetricas = {
  hayVariables: boolean;
  hastaDia: string | null;
  ultima: UltimaCorrida | null;
};

export async function estadoDeMetricas(): Promise<EstadoDeMetricas> {
  const [ultimoTotal, ultima] = await Promise.all([
    base.metricaDiaria.findFirst({ where: { dimension: "total" }, orderBy: { fecha: "desc" } }),
    ultimaCorrida(copiaDeVercel.clave),
  ]);
  return { hayVariables: hayVariablesDeMetricas(), hastaDia: ultimoTotal ? diaISO(ultimoTotal.fecha) : null, ultima };
}

export type Tarjeta = {
  dias: Periodo;
  vistas: number;
  visitantes: number;
  variacionVistas: string;
  variacionVisitantes: string;
};

/**
 * La ventana más nueva de ese largo contra la anterior, o `null` si todavía
 * no hay ninguna. Toma la más nueva que exista, no la que coincide con
 * `hastaDia`: las ventanas se escriben con `fechaFin = ayer`, pero `hastaDia`
 * sale del último `total`, y si la API omite un día sin tráfico las dos fechas
 * se separan y la grilla quedaría vacía sin necesidad. La lee también el
 * Inicio, en «Esta semana».
 */
export async function tarjetaDe(dias: Periodo): Promise<Tarjeta | null> {
  // Acá sí hay una dependencia real: `anterior` necesita la fecha de `actual`.
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
}

/** Las cuatro tarjetas: 7 y 30 días, cada una contra la ventana anterior. */
export async function tarjetas(): Promise<Tarjeta[]> {
  // Las dos ventanas no dependen una de la otra: van juntas.
  const porVentana = await Promise.all(([7, 30] as const).map(tarjetaDe));
  return porVentana.filter((t): t is Tarjeta => t !== null);
}
