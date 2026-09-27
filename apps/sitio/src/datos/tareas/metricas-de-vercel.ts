import type { PrismaClient } from "@/../prisma/generado/client";
import { base as baseDeLaApp } from "@/datos/cliente";
import { clienteDesdeEntorno } from "@/lib/metricas/entorno";
import { ayerUTC, diaISO, fechaUTC, rangoFaltante, sumarDias } from "@/lib/metricas/periodos";
import type { FilaDiaria } from "@/lib/metricas/tipos";
import type { ClienteDeAnaliticas } from "@/lib/metricas/cliente";
import type { ResultadoDeTarea, Tarea } from "@/lib/tareas/registro";
import { CONSULTAS, DIAS_POR_CORRIDA, ventanasQueSePiden } from "./consultas-de-vercel";

// Copia a nuestra base lo que la API de Web Analytics tiene y todavía no
// guardamos. Idempotente: correr dos veces deja lo mismo. Es una tarea del
// cron diario (ADR-0011): devuelve qué pasó, en llano, y quien la corre lo
// registra en `corridas_de_tareas`, también cuando falla.

const PAUSA_MS = 250;
const pausa = () => new Promise((r) => setTimeout(r, PAUSA_MS));

async function guardarFila(base: PrismaClient, fila: Omit<FilaDiaria, "dimension"> & { dimension: string }) {
  const clave = { fecha: fechaUTC(fila.fecha), dimension: fila.dimension, valor: fila.valor, agrupado: fila.agrupado };
  const datos = { vistas: fila.vistas, visitantes: fila.visitantes };
  await base.metricaDiaria.upsert({ where: { fecha_dimension_valor_agrupado: clave }, create: { ...clave, ...datos }, update: datos });
}

export async function sincronizarMetricas({
  cliente,
  base,
  hoy = new Date(),
  minimoDias = 0,
}: {
  cliente: ClienteDeAnaliticas;
  base: PrismaClient;
  hoy?: Date;
  /** El botón «Actualizar ahora» pide siempre los últimos N días, por lo que llegó tarde. */
  minimoDias?: number;
}): Promise<ResultadoDeTarea> {
  const ultimo = await base.metricaDiaria.findFirst({ where: { dimension: "total" }, orderBy: { fecha: "desc" } });
  const ayer = ayerUTC(hoy);
  let rango = rangoFaltante({ ultimoGuardado: ultimo ? diaISO(ultimo.fecha) : null, hoy, maximo: DIAS_POR_CORRIDA });
  // Ni el tiempo de una función ni la ventana del plan dejan pedir más:
  // minimoDias nunca pide más días de los que ya acepta una corrida.
  const minimo = Math.min(minimoDias, DIAS_POR_CORRIDA);
  if (minimo > 0) {
    const desdeMinimo = sumarDias(ayer, -(minimo - 1));
    rango = { desde: rango && rango.desde < desdeMinimo ? rango.desde : desdeMinimo, hasta: ayer };
  }
  if (!rango) return { ok: true, detalle: "Nada nuevo: ya estaba al día." };

  try {
    let filas = 0;
    for (const { dimension, filtro, guardarComo } of CONSULTAS) {
      // Las filas de un mismo llamado son upserts independientes a nuestra
      // base (claves distintas): van juntas. La pausa que sigue es la que
      // protege el ritmo de llamadas a la API externa de Vercel.
      const filasDia = await cliente.porDia(rango, dimension, filtro);
      await Promise.all(filasDia.map((fila) => guardarFila(base, { ...fila, dimension: guardarComo })));
      filas += filasDia.length;
      await pausa();
    }
    // Cada ventana es independiente: una que falla va al detalle y no voltea
    // la copia, porque la marca de agua depende solo de las filas diarias.
    let ventanas = 0;
    const fallidas: string[] = [];
    for (const v of ventanasQueSePiden(rango.hasta, hoy)) {
      try {
        const medida = await cliente.ventana({ desde: v.desde, hasta: v.fechaFin });
        const clave = { fechaFin: fechaUTC(v.fechaFin), dias: v.dias };
        await base.metricaVentana.upsert({ where: { fechaFin_dias: clave }, create: { ...clave, ...medida }, update: medida });
        ventanas++;
      } catch (e) {
        fallidas.push(`la de ${v.dias} días hasta el ${v.fechaFin} (${e instanceof Error ? e.message : String(e)})`);
      }
      await pausa();
    }
    // `total` es la marca de agua: la próxima corrida decide desde dónde seguir
    // mirando la fila `total` más nueva. Si se guardara antes de que termine el
    // resto (una consulta con un 429, por ejemplo) la marca
    // avanzaría sin que el rango haya entrado entero. Por eso cierra la
    // corrida, con el mismo patrón de upserts independientes que el resto.
    const filasTotal = await cliente.porDia(rango, "total");
    await Promise.all(filasTotal.map((fila) => guardarFila(base, fila)));
    filas += filasTotal.length;
    const dias = Math.round((fechaUTC(rango.hasta).getTime() - fechaUTC(rango.desde).getTime()) / 86_400_000) + 1;
    const sinVentana = fallidas.length ? ` No se pudo: ${fallidas.join("; ")}.` : "";
    return { ok: true, detalle: `Del ${rango.desde} al ${rango.hasta}: ${dias} días, ${filas} filas, ${ventanas} ventanas.${sinVentana}` };
  } catch (e) {
    return { ok: false, detalle: e instanceof Error ? e.message : String(e) };
  }
}

/**
 * Arma el cliente con las variables del entorno y copia. Si faltan, la
 * corrida sale fallida (para que el panel lo muestre) y no toca la API.
 */
export async function copiarMetricas({ minimoDias = 0 }: { minimoDias?: number } = {}): Promise<ResultadoDeTarea> {
  const cliente = clienteDesdeEntorno();
  if (!cliente) return { ok: false, detalle: "Faltan VERCEL_TOKEN y/o VERCEL_ANALYTICS_PROJECT_ID: ver el README." };
  return sincronizarMetricas({ cliente, base: baseDeLaApp, minimoDias });
}

export const copiaDeVercel: Tarea = { clave: "metricas-de-vercel", nombre: "Copia de Vercel Analytics", correr: () => copiarMetricas() };
