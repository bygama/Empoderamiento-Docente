import { base } from "@/datos/cliente";
import { curvaDe, parte, sumarPorValor, visitasPorCanal, type PuntoDeLaCurva } from "@/lib/metricas/agregar";
import type { Canal } from "@/lib/metricas/canales";
import { diaISO, fechaUTC, sumarDias, type Periodo } from "@/lib/metricas/periodos";
import type { Dia } from "@/lib/metricas/tipos";
import { urlDelSitio } from "@/lib/url-del-sitio";
import { tarjetaDe, type Tarjeta } from "./metricas";
import { nombresDeRutas } from "./nombres-de-rutas";

// Lo que lee Métricas › Resumen para un período (SPEC de
// work/metricas-completas/ §6.1). Solo de nuestras tablas, nunca de la API.

/** Cuántas páginas muestra «Páginas más vistas». */
const PAGINAS_EN_LA_LISTA = 10;

export type ResumenDelPeriodo = {
  desde: Dia;
  hasta: Dia;
  /** Visitantes y vistas del período contra el anterior; `null` si todavía no hay una ventana de ese largo. */
  cifras: Tarjeta | null;
  /** Visitantes por día. */
  curva: PuntoDeLaCurva[];
  diasConDatos: number;
  canales: Array<{ canal: Canal; visitas: number; parte: number }>;
  visitasDeLosCanales: number;
  paginas: Array<{ ruta: string; nombre: string | null; vistas: number }>;
  vistasDelPeriodo: number;
};

/** El dominio del sitio: sus filas de referido son de alguien que ya estaba adentro, y no son un canal. */
export function dominioPropio(): string {
  return new URL(urlDelSitio()).hostname;
}

/** El Resumen del período que termina en `hasta` (el último día copiado). */
export async function resumenDe(periodo: Periodo, hasta: Dia): Promise<ResumenDelPeriodo> {
  const desde = sumarDias(hasta, -(periodo - 1));
  const fecha = { gte: fechaUTC(desde), lte: fechaUTC(hasta) };
  const campos = { valor: true, agrupado: true, vistas: true, visitantes: true } as const;
  // Cinco lecturas que no dependen una de la otra: van juntas.
  const [cifras, totales, primera, referidos, paginas] = await Promise.all([
    tarjetaDe(periodo),
    base.metricaDiaria.findMany({ where: { dimension: "total", fecha }, select: { fecha: true, vistas: true, visitantes: true } }),
    base.metricaDiaria.findFirst({ where: { dimension: "total" }, orderBy: { fecha: "asc" }, select: { fecha: true } }),
    base.metricaDiaria.findMany({ where: { dimension: "referido", fecha }, select: campos }),
    base.metricaDiaria.findMany({ where: { dimension: "pagina", fecha }, select: campos }),
  ]);
  const canales = visitasPorCanal(referidos, dominioPropio());
  const visitasDeLosCanales = canales.reduce((total, c) => total + c.visitas, 0);
  const masVistas = sumarPorValor(paginas, "vistas").valores.slice(0, PAGINAS_EN_LA_LISTA);
  const nombres = await nombresDeRutas(masVistas.map((p) => p.valor));
  return {
    desde,
    hasta,
    cifras,
    curva: curvaDe(new Map(totales.map((t) => [diaISO(t.fecha), t.visitantes])), { desde, hasta, primero: primera ? diaISO(primera.fecha) : null }),
    diasConDatos: totales.length,
    canales: canales.map((c) => ({ ...c, parte: parte(c.visitas, visitasDeLosCanales) })),
    visitasDeLosCanales,
    paginas: masVistas.map((p) => ({ ruta: p.valor, nombre: nombres.get(p.valor) ?? null, vistas: p.total })),
    vistasDelPeriodo: totales.reduce((total, t) => total + t.vistas, 0),
  };
}
