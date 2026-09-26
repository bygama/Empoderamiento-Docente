import type { PrismaClient } from "@/../prisma/generado/client";
import { base as baseDeLaApp } from "@/datos/cliente";
import { clienteDeBusquedasDesdeEntorno, SIN_CONEXION } from "@/lib/busquedas/entorno";
import type { ClienteDeBusquedas } from "@/lib/busquedas/search-console";
import type { DimensionDeBusqueda, FilaDeBusqueda, Rango } from "@/lib/busquedas/tipos";
import { ayerUTC, diaISO, fechaUTC, sumarDias } from "@/lib/metricas/periodos";
import type { ResultadoDeTarea, Tarea } from "@/lib/tareas/registro";

// Copia a nuestra base lo que Search Console tiene y todavía no guardamos
// (ADR-0011). Idempotente: correr dos veces deja lo mismo. Es una tarea del
// cron diario: devuelve qué pasó en llano, y quien la corre lo registra.

/** La primera vez y como máximo: Google guarda 16 meses, y 90 días alcanzan para el período de Búsquedas y su anterior. */
const MAXIMO_DIAS = 90;

// `total` es la marca de agua, como en la copia de Vercel: la próxima corrida
// sigue desde la fila `total` más nueva. Por eso va última: si una dimensión
// falla, la marca no avanza sin que el rango haya entrado entero.
const ORDEN: readonly DimensionDeBusqueda[] = ["consulta", "pagina", "pais", "total"];

/**
 * Del día siguiente al último guardado hasta ayer. Los días que Google todavía
 * no cerró no vuelven (`dataState: "final"`) y se piden otra vez la próxima.
 */
function rangoAPedir(ultimo: string | null, hoy: Date, minimoDias: number): Rango | null {
  const hasta = ayerUTC(hoy);
  const desdeMinimo = sumarDias(hasta, -(MAXIMO_DIAS - 1));
  let desde = ultimo ? sumarDias(ultimo, 1) : desdeMinimo;
  if (minimoDias > 0) {
    const forzado = sumarDias(hasta, -(Math.min(minimoDias, MAXIMO_DIAS) - 1));
    if (forzado < desde) desde = forzado;
  }
  if (desde < desdeMinimo) desde = desdeMinimo;
  return desde > hasta ? null : { desde, hasta };
}

/**
 * Reemplaza las filas de una dimensión en el rango por las que mandó Google,
 * en una transacción: miles de filas entran en dos consultas y no en miles de
 * upserts, y el resultado es el mismo corra las veces que corra.
 */
async function guardar(base: PrismaClient, rango: Rango, dimension: DimensionDeBusqueda, filas: FilaDeBusqueda[]) {
  await base.$transaction([
    base.busquedaDiaria.deleteMany({ where: { dimension, fecha: { gte: fechaUTC(rango.desde), lte: fechaUTC(rango.hasta) } } }),
    base.busquedaDiaria.createMany({ data: filas.map((f) => ({ ...f, fecha: fechaUTC(f.fecha) })) }),
  ]);
}

export async function sincronizarBusquedas({
  cliente,
  base,
  hoy = new Date(),
  minimoDias = 0,
}: {
  cliente: ClienteDeBusquedas;
  base: PrismaClient;
  hoy?: Date;
  /** «Actualizar ahora» pide siempre los últimos N días, por lo que Google cerró tarde. */
  minimoDias?: number;
}): Promise<ResultadoDeTarea> {
  const ultimo = await base.busquedaDiaria.findFirst({ where: { dimension: "total" }, orderBy: { fecha: "desc" } });
  const rango = rangoAPedir(ultimo ? diaISO(ultimo.fecha) : null, hoy, minimoDias);
  if (!rango) return { ok: true, detalle: "Nada nuevo: ya estaba al día." };
  try {
    let filas = 0;
    let dias = 0;
    for (const dimension of ORDEN) {
      const lote = await cliente.porDia(rango, dimension);
      await guardar(base, rango, dimension, lote);
      filas += lote.length;
      if (dimension === "total") dias = lote.length;
    }
    return { ok: true, detalle: `Del ${rango.desde} al ${rango.hasta}: ${dias} días con datos, ${filas} filas.` };
  } catch (e) {
    return { ok: false, detalle: e instanceof Error ? e.message : String(e) };
  }
}

/** Arma el cliente con las variables del entorno y copia. Sin ellas, la corrida sale fallida y no toca la API. */
export async function copiarBusquedas({ minimoDias = 0 }: { minimoDias?: number } = {}): Promise<ResultadoDeTarea> {
  const cliente = clienteDeBusquedasDesdeEntorno();
  if (!cliente) return { ok: false, detalle: SIN_CONEXION };
  return sincronizarBusquedas({ cliente, base: baseDeLaApp, minimoDias });
}

export const copiaDeSearchConsole: Tarea = { clave: "busquedas-de-google", nombre: "Copia de Search Console", correr: () => copiarBusquedas() };
