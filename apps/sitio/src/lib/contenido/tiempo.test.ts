import { test } from "node:test";
import assert from "node:assert/strict";
import { fechaYHora, haceCuanto } from "./tiempo";

const AHORA = new Date("2026-09-21T14:05:00.000Z");
const hace = (segundos: number) => new Date(AHORA.getTime() - segundos * 1000);

test("haceCuanto habla como una persona", () => {
  assert.equal(haceCuanto(hace(20), AHORA), "hace un momento");
  assert.equal(haceCuanto(hace(60), AHORA), "hace 1 minuto");
  assert.equal(haceCuanto(hace(150), AHORA), "hace 3 minutos");
  assert.equal(haceCuanto(hace(2 * 3600), AHORA), "hace 2 horas");
  assert.equal(haceCuanto(hace(5 * 86400), AHORA), "hace 5 días");
});

test("fechaYHora en la zona pedida", () => {
  assert.equal(fechaYHora("2026-09-21T14:05:00.000Z", "UTC"), "21/9 a las 14:05");
  assert.equal(fechaYHora("2026-09-21T14:05:00.000Z", "America/Argentina/Buenos_Aires"), "21/9 a las 11:05");
});
