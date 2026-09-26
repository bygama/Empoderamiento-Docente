import { after, test } from "node:test";
import assert from "node:assert/strict";
import { config as cargarEntorno } from "dotenv";
import { fechaUTC } from "@/lib/metricas/periodos";

cargarEntorno({ path: [".env.local"], quiet: true });
const hayBase = Boolean(process.env.DATABASE_URL);

// 1999, y no 2001: los tests de la copia (que corren en otro proceso, a la vez)
// siembran y borran las filas de 2001.
const EN_1999 = { fecha: { gte: fechaUTC("1998-12-01"), lte: fechaUTC("1999-12-31") } };
const fila = (fecha: string, dimension: string, valor: string, clics: number, impresiones: number, posicion: number) => ({
  fecha: fechaUTC(fecha),
  dimension,
  valor,
  clics,
  impresiones,
  sumaDePosiciones: posicion * impresiones,
});

test("el período suma sus 28 días, re-promedia la posición por impresión y compara con los 28 anteriores", { skip: !hayBase && "sin DATABASE_URL" }, async () => {
  const { base } = await import("@/datos/cliente");
  const { resumenDeBusquedas } = await import("./busquedas");
  await base.busquedaDiaria.createMany({
    data: [
      fila("1999-01-10", "total", "", 6, 100, 2),
      fila("1999-01-20", "total", "", 4, 10, 20),
      fila("1998-12-20", "total", "", 5, 50, 9),
      fila("1999-01-10", "consulta", "matemática educativa", 6, 100, 2),
      fila("1999-01-20", "consulta", "matemática educativa", 0, 10, 20),
      fila("1999-01-20", "consulta", "talleres para docentes", 0, 30, 12),
      fila("1999-01-20", "pais", "chl", 4, 10, 20),
    ],
  });

  const r = await resumenDeBusquedas("1999-01-28");
  assert.equal(r.desde, "1999-01-01");
  assert.equal(r.clics, 10);
  assert.equal(r.impresiones, 110);
  // (2 × 100 + 20 × 10) / 110, no (2 + 20) / 2.
  assert.equal(Math.round(r.posicion! * 100) / 100, 3.64);
  assert.equal(r.variacionClics, "+100 %");
  assert.equal(r.variacionImpresiones, "+120 %");
  assert.deepEqual(
    r.consultas.map((c) => [c.valor, c.clics, c.impresiones]),
    [
      ["matemática educativa", 6, 110],
      ["talleres para docentes", 0, 30],
    ],
  );
  assert.deepEqual(
    r.casi.map((c) => c.valor),
    ["talleres para docentes"],
  );
  assert.deepEqual(r.paises[0], { valor: "chl", clics: 4, impresiones: 10, posicion: 20 });
});

after(async () => {
  if (!hayBase) return;
  const { base } = await import("@/datos/cliente");
  await base.busquedaDiaria.deleteMany({ where: EN_1999 });
  await base.$disconnect();
});
