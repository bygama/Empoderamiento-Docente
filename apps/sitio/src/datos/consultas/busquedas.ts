import { base } from "@/datos/cliente";
import { copiaDeSearchConsole } from "@/datos/tareas/busquedas-de-google";
import { ultimaCorrida, type UltimaCorrida } from "@/datos/tareas/corridas";
import { hayVariablesDeBusquedas } from "@/lib/busquedas/entorno";
import { casiNosEncuentran, ordenarPorClics, posicionPromedio, type Agregado, type Casi } from "@/lib/busquedas/lecturas";
import type { DimensionDeBusqueda } from "@/lib/busquedas/tipos";
import { diaISO, fechaUTC, sumarDias, variacion } from "@/lib/metricas/periodos";

// Lo que lee Búsquedas. Solo de nuestras tablas: nunca de la API en el render.

/** Cuatro semanas enteras: los días de la semana se compensan. */
export const DIAS_DEL_PERIODO = 28;
const FILAS_POR_LISTA = 10;

export type EstadoDeBusquedas = {
  conectado: boolean;
  /** El último día copiado, o `null` si todavía no hay ninguno. */
  hastaDia: string | null;
  ultima: UltimaCorrida | null;
};

export async function estadoDeBusquedas(): Promise<EstadoDeBusquedas> {
  const [ultimoTotal, ultima] = await Promise.all([
    base.busquedaDiaria.findFirst({ where: { dimension: "total" }, orderBy: { fecha: "desc" } }),
    ultimaCorrida(copiaDeSearchConsole.clave),
  ]);
  return { conectado: hayVariablesDeBusquedas(), hastaDia: ultimoTotal ? diaISO(ultimoTotal.fecha) : null, ultima };
}

export type FilaDeBusquedas = { valor: string; clics: number; impresiones: number; posicion: number | null };

export type ResumenDeBusquedas = {
  desde: string;
  hasta: string;
  clics: number;
  impresiones: number;
  posicion: number | null;
  variacionClics: string;
  variacionImpresiones: string;
  casi: Casi[];
  consultas: FilaDeBusquedas[];
  paginas: FilaDeBusquedas[];
  paises: FilaDeBusquedas[];
};

/** Lo que suma cada valor de una dimensión en el período, con la posición lista para re-promediar. */
async function agregados(dimension: DimensionDeBusqueda, desde: string, hasta: string): Promise<Agregado[]> {
  const grupos = await base.busquedaDiaria.groupBy({
    by: ["valor"],
    where: { dimension, fecha: { gte: fechaUTC(desde), lte: fechaUTC(hasta) } },
    _sum: { clics: true, impresiones: true, sumaDePosiciones: true },
  });
  return grupos.map((g) => ({ valor: g.valor, clics: g._sum.clics ?? 0, impresiones: g._sum.impresiones ?? 0, sumaDePosiciones: g._sum.sumaDePosiciones ?? 0 }));
}

/** Lo que suman todas las búsquedas del rango: la fila `total`, o `null` si no hay ningún día copiado en él. Lo lee también el Inicio. */
export async function totalDeBusquedas(desde: string, hasta: string): Promise<Agregado | null> {
  const [total] = await agregados("total", desde, hasta);
  return total ?? null;
}

function lista(filas: Agregado[]): FilaDeBusquedas[] {
  return ordenarPorClics(filas)
    .slice(0, FILAS_POR_LISTA)
    .map((f) => ({ valor: f.valor, clics: f.clics, impresiones: f.impresiones, posicion: posicionPromedio(f.sumaDePosiciones, f.impresiones) }));
}

/** Los 28 días que terminan en `hasta` (el último copiado), contra los 28 anteriores. */
export async function resumenDeBusquedas(hasta: string): Promise<ResumenDeBusquedas> {
  const desde = sumarDias(hasta, -(DIAS_DEL_PERIODO - 1));
  const hastaAnterior = sumarDias(desde, -1);
  const desdeAnterior = sumarDias(hastaAnterior, -(DIAS_DEL_PERIODO - 1));
  const [total, anterior, consultas, paginas, paises] = await Promise.all([
    totalDeBusquedas(desde, hasta),
    totalDeBusquedas(desdeAnterior, hastaAnterior),
    agregados("consulta", desde, hasta),
    agregados("pagina", desde, hasta),
    agregados("pais", desde, hasta),
  ]);
  const clics = total?.clics ?? 0;
  const impresiones = total?.impresiones ?? 0;
  return {
    desde,
    hasta,
    clics,
    impresiones,
    posicion: posicionPromedio(total?.sumaDePosiciones ?? 0, impresiones),
    variacionClics: variacion(clics, anterior ? anterior.clics : null),
    variacionImpresiones: variacion(impresiones, anterior ? anterior.impresiones : null),
    casi: casiNosEncuentran(consultas),
    consultas: lista(consultas),
    paginas: lista(paginas),
    paises: lista(paises),
  };
}
