import { after, test } from "node:test";
import assert from "node:assert/strict";
import { config as cargarEntorno } from "dotenv";
import { fechaUTC } from "@/lib/metricas/periodos";
import type { ClienteDeAnaliticas } from "@/lib/metricas/vercel";

cargarEntorno({ path: [".env.local"], quiet: true });
const hayBase = Boolean(process.env.DATABASE_URL);

const HOY = new Date("2001-01-11T12:00:00.000Z");

const clienteFalso: ClienteDeAnaliticas = {
  async porDia(rango, dimension) {
    if (dimension !== "total") return [];
    return [{ fecha: rango.hasta, dimension, valor: "", agrupado: false, vistas: 10, visitantes: 8 }];
  },
  async ventana() {
    return { vistas: 30, visitantes: 20 };
  },
};

const clienteRoto: ClienteDeAnaliticas = {
  async porDia() {
    throw new Error("Vercel respondió 401: el token no sirve o venció.");
  },
  async ventana() {
    throw new Error("no debería llegar acá");
  },
};

test("correr dos veces deja las mismas filas y registra cada corrida", { skip: !hayBase && "sin DATABASE_URL" }, async () => {
  const { base } = await import("@/datos/cliente");
  const { sincronizarMetricas } = await import("./sincronizar-metricas");
  const antes = await base.sincronizacionMetricas.count();
  // minimoDias en las dos corridas: si la base ya tiene una fila `total` real
  // (mucho más nueva que 2001), rangoFaltante da null y sin esto el test
  // dependería de qué haya sincronizado el cron antes. Con minimoDias el
  // rango de los últimos días queda forzado pase lo que pase.
  const r1 = await sincronizarMetricas({ cliente: clienteFalso, base, hoy: HOY, minimoDias: 3 });
  const r2 = await sincronizarMetricas({ cliente: clienteFalso, base, hoy: HOY, minimoDias: 3 });
  assert.equal(r1.ok, true);
  assert.equal(r2.ok, true);
  const filas = await base.metricaDiaria.count({ where: { fecha: { gte: fechaUTC("2000-12-01"), lte: fechaUTC("2001-01-10") } } });
  assert.equal(filas, 1);
  const ventanas = await base.metricaVentana.count({ where: { fechaFin: { gte: fechaUTC("2000-12-01"), lte: fechaUTC("2001-01-10") } } });
  assert.equal(ventanas, 4);
  assert.equal(await base.sincronizacionMetricas.count(), antes + 2);
});

test("si la API falla, queda la fila de error y nada más", { skip: !hayBase && "sin DATABASE_URL" }, async () => {
  const { base } = await import("@/datos/cliente");
  const { sincronizarMetricas } = await import("./sincronizar-metricas");
  // minimoDias por la misma razón que arriba: sin esto, una marca de agua
  // real y lejana haría "Nada nuevo" antes de llamar a la API rota, y el
  // error nunca se vería.
  const r = await sincronizarMetricas({ cliente: clienteRoto, base, hoy: new Date("2001-02-11T12:00:00.000Z"), minimoDias: 1 });
  assert.equal(r.ok, false);
  assert.match(r.detalle, /401/);
  const filas = await base.metricaDiaria.count({ where: { fecha: { gte: fechaUTC("2001-01-11"), lte: fechaUTC("2001-02-10") } } });
  assert.equal(filas, 0);
  const ventanas = await base.metricaVentana.count({ where: { fechaFin: { gte: fechaUTC("2001-01-11"), lte: fechaUTC("2001-02-10") } } });
  assert.equal(ventanas, 0);
});

after(async () => {
  if (!hayBase) return;
  const { base } = await import("@/datos/cliente");
  await base.metricaDiaria.deleteMany({ where: { fecha: { lte: fechaUTC("2001-12-31") } } });
  await base.metricaVentana.deleteMany({ where: { fechaFin: { lte: fechaUTC("2001-12-31") } } });
  await base.sincronizacionMetricas.deleteMany({ where: { hasta: { lte: fechaUTC("2001-12-31") } } });
  await base.$disconnect();
});
