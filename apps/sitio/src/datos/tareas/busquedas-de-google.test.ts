import { after, test } from "node:test";
import assert from "node:assert/strict";
import { config as cargarEntorno } from "dotenv";
import type { ClienteDeBusquedas } from "@/lib/busquedas/search-console";
import { fechaUTC } from "@/lib/metricas/periodos";

cargarEntorno({ path: [".env.local"], quiet: true });
const hayBase = Boolean(process.env.DATABASE_URL);

// Fechas de 2001, lejos de cualquier dato real, y `minimoDias` en cada
// corrida: si la base ya tiene una fila `total` más nueva, el rango quedaría
// vacío y el test dependería de lo que haya copiado el cron antes.
const HOY = new Date("2001-01-11T12:00:00.000Z");
const EN_2001 = { fecha: { gte: fechaUTC("2001-01-01"), lte: fechaUTC("2001-12-31") } };

/** Un cliente que devuelve una fila por día del rango en cada dimensión. */
function clienteFalso(rota?: string): ClienteDeBusquedas {
  return {
    async porDia(rango, dimension) {
      if (dimension === rota) throw new Error("Google respondió 429: demasiadas consultas, esperá un rato.");
      const dias = [rango.desde, rango.hasta];
      return dias.map((fecha) => ({ fecha, dimension, valor: dimension === "total" ? "" : `${dimension} de prueba`, clics: 1, impresiones: 20, sumaDePosiciones: 180 }));
    },
  };
}

test("correr dos veces deja las mismas filas y dice qué días copió", { skip: !hayBase && "sin DATABASE_URL" }, async () => {
  const { base } = await import("@/datos/cliente");
  const { sincronizarBusquedas } = await import("./busquedas-de-google");
  const r1 = await sincronizarBusquedas({ cliente: clienteFalso(), base, hoy: HOY, minimoDias: 2 });
  const r2 = await sincronizarBusquedas({ cliente: clienteFalso(), base, hoy: HOY, minimoDias: 2 });
  assert.equal(r1.ok, true);
  assert.equal(r2.detalle, "Del 2001-01-09 al 2001-01-10: 2 días con datos, 8 filas.");
  assert.equal(await base.busquedaDiaria.count({ where: EN_2001 }), 8);
  const fila = await base.busquedaDiaria.findFirst({ where: { ...EN_2001, dimension: "pais" } });
  assert.equal(fila?.sumaDePosiciones, 180);
});

test("si una dimensión falla, la corrida sale fallida y la marca de agua no avanza", { skip: !hayBase && "sin DATABASE_URL" }, async () => {
  const { base } = await import("@/datos/cliente");
  const { sincronizarBusquedas } = await import("./busquedas-de-google");
  await base.busquedaDiaria.deleteMany({ where: EN_2001 });
  const r = await sincronizarBusquedas({ cliente: clienteFalso("pais"), base, hoy: HOY, minimoDias: 2 });
  assert.equal(r.ok, false);
  assert.match(r.detalle, /429/);
  assert.equal(await base.busquedaDiaria.count({ where: { ...EN_2001, dimension: "total" } }), 0);
});

after(async () => {
  if (!hayBase) return;
  const { base } = await import("@/datos/cliente");
  await base.busquedaDiaria.deleteMany({ where: EN_2001 });
  await base.$disconnect();
});
