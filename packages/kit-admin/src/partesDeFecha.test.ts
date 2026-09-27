import { test } from "node:test";
import assert from "node:assert/strict";
import { diasDelMes, fechaDePartes, partesDeFecha } from "./partesDeFecha";

test("las tres precisiones van y vuelven", () => {
  for (const texto of ["2026-08-26", "2026-07", "2026", ""]) {
    assert.equal(fechaDePartes(partesDeFecha(texto)), texto);
  }
});

test("sin año no hay fecha, y sin mes el día no cuenta", () => {
  assert.equal(fechaDePartes({ anio: "", mes: "07", dia: "12" }), "");
  assert.equal(fechaDePartes({ anio: "2026", mes: "", dia: "12" }), "2026");
});

test("los días del mes conocen los bisiestos", () => {
  assert.equal(diasDelMes("2024", "02"), 29);
  assert.equal(diasDelMes("2026", "02"), 28);
  assert.equal(diasDelMes("2026", "04"), 30);
  // Con el año a medio escribir, no se achica la lista.
  assert.equal(diasDelMes("20", "02"), 31);
});
