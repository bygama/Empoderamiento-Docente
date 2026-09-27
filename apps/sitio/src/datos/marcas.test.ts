import { test } from "node:test";
import assert from "node:assert/strict";
import { fechaDeMarcaValida } from "./marcas";

const HOY = new Date("2026-09-27T15:00:00.000Z");

test("una marca va en un día que existe, de hoy para atrás", () => {
  assert.equal(fechaDeMarcaValida("2026-09-27", HOY), true);
  assert.equal(fechaDeMarcaValida("2026-09-01", HOY), true);
  assert.equal(fechaDeMarcaValida("2026-09-28", HOY), false);
  assert.equal(fechaDeMarcaValida("2026-02-30", HOY), false);
  assert.equal(fechaDeMarcaValida("27/09/2026", HOY), false);
  assert.equal(fechaDeMarcaValida("1999-12-31", HOY), false);
});
