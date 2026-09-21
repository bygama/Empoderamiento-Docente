import type { PrismaClient } from "@/../prisma/generado/client";
import { base as baseDeLaApp } from "@/datos/cliente";
import { clienteDesdeEntorno } from "@/lib/metricas/entorno";
import { ayerUTC, diaISO, fechaUTC, MAXIMO_DIAS_POR_CORRIDA, rangoFaltante, sumarDias, ventanasDe } from "@/lib/metricas/periodos";
import { DIMENSIONES } from "@/lib/metricas/tipos";
import type { FilaDiaria, Rango } from "@/lib/metricas/tipos";
import type { ClienteDeAnaliticas } from "@/lib/metricas/vercel";

// Copia a nuestra base lo que la API de Web Analytics tiene y todavía no
// guardamos. Idempotente: correr dos veces deja lo mismo. Registra cada
// corrida, también las fallidas, con el motivo en llano.

const PAUSA_MS = 250;
const pausa = () => new Promise((r) => setTimeout(r, PAUSA_MS));

// `total` es la marca de agua: la próxima corrida decide desde dónde seguir
// mirando la fila `total` más nueva. Si se guardara antes de que termine el
// resto (una dimensión o una ventana con un 429, por ejemplo) la marca
// avanzaría sin que el rango haya entrado entero. Por eso corre última, después
// de las dimensiones de acá abajo y de las ventanas.
const ORDEN_DIMENSIONES = DIMENSIONES.filter((d) => d !== "total");

async function registrar(base: PrismaClient, corrida: Rango & { ok: boolean; detalle: string }) {
  await base.sincronizacionMetricas.create({
    data: { desde: fechaUTC(corrida.desde), hasta: fechaUTC(corrida.hasta), ok: corrida.ok, detalle: corrida.detalle },
  });
  return { ok: corrida.ok, detalle: corrida.detalle };
}

async function guardarFila(base: PrismaClient, fila: FilaDiaria) {
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
}): Promise<{ ok: boolean; detalle: string }> {
  const ultimo = await base.metricaDiaria.findFirst({ where: { dimension: "total" }, orderBy: { fecha: "desc" } });
  const ayer = ayerUTC(hoy);
  let rango = rangoFaltante({ ultimoGuardado: ultimo ? diaISO(ultimo.fecha) : null, hoy });
  // Una función de Vercel tiene un tiempo máximo: minimoDias nunca pide más
  // días de los que ya acepta una corrida.
  const minimo = Math.min(minimoDias, MAXIMO_DIAS_POR_CORRIDA);
  if (minimo > 0) {
    const desdeMinimo = sumarDias(ayer, -(minimo - 1));
    rango = { desde: rango && rango.desde < desdeMinimo ? rango.desde : desdeMinimo, hasta: ayer };
  }
  if (!rango) return registrar(base, { desde: ayer, hasta: ayer, ok: true, detalle: "Nada nuevo: ya estaba al día." });

  try {
    let filas = 0;
    for (const dimension of ORDEN_DIMENSIONES) {
      // Las filas de un mismo llamado son upserts independientes a nuestra
      // base (claves distintas): van juntas. La pausa que sigue es la que
      // protege el ritmo de llamadas a la API externa de Vercel.
      const filasDia = await cliente.porDia(rango, dimension);
      await Promise.all(filasDia.map((fila) => guardarFila(base, fila)));
      filas += filasDia.length;
      await pausa();
    }
    let ventanas = 0;
    for (const v of ventanasDe(rango.hasta)) {
      const medida = await cliente.ventana({ desde: v.desde, hasta: v.fechaFin });
      const clave = { fechaFin: fechaUTC(v.fechaFin), dias: v.dias };
      await base.metricaVentana.upsert({ where: { fechaFin_dias: clave }, create: { ...clave, ...medida }, update: medida });
      ventanas++;
      await pausa();
    }
    // `total` cierra la corrida, después de las dimensiones y las ventanas: es
    // la marca de agua que decide el rango de la próxima (ver el comentario de
    // ORDEN_DIMENSIONES). Mismo patrón de upserts independientes que el resto.
    const filasTotal = await cliente.porDia(rango, "total");
    await Promise.all(filasTotal.map((fila) => guardarFila(base, fila)));
    filas += filasTotal.length;
    const dias = Math.round((fechaUTC(rango.hasta).getTime() - fechaUTC(rango.desde).getTime()) / 86_400_000) + 1;
    return registrar(base, { ...rango, ok: true, detalle: `${dias} días, ${filas} filas, ${ventanas} ventanas.` });
  } catch (e) {
    return registrar(base, { ...rango, ok: false, detalle: e instanceof Error ? e.message : String(e) });
  }
}

/**
 * Lo que llama el cron: arma el cliente con las variables del entorno. Si
 * faltan, deja la corrida registrada como fallida (para que el panel lo
 * muestre) y no toca la API.
 */
export async function sincronizarDesdeEntorno(): Promise<{ ok: boolean; detalle: string }> {
  const cliente = clienteDesdeEntorno();
  if (!cliente) {
    const hoy = diaISO(new Date());
    return registrar(baseDeLaApp, { desde: hoy, hasta: hoy, ok: false, detalle: "Faltan VERCEL_TOKEN y/o VERCEL_ANALYTICS_PROJECT_ID: ver el README." });
  }
  return sincronizarMetricas({ cliente, base: baseDeLaApp });
}
