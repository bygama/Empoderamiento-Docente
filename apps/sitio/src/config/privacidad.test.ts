import { test } from "node:test";
import assert from "node:assert/strict";
import { bordeDeGuarda, bordeDelSpam, seBorraEl } from "./privacidad";

const LLEGO = new Date("2026-09-21T14:05:00.000Z");

test("Contacto se borra a los 24 meses de llegar y un CV a los 12", () => {
  const base = { estado: "nuevo" as const, recibidoEn: LLEGO, estadoEn: LLEGO };
  assert.equal(seBorraEl({ ...base, bandeja: "contacto" }).toISOString(), "2028-09-21T14:05:00.000Z");
  assert.equal(seBorraEl({ ...base, bandeja: "cv" }).toISOString(), "2027-09-21T14:05:00.000Z");
});

test("el spam se borra a los 30 días de marcado, salvo que su plazo llegue antes", () => {
  const marcado = new Date("2026-10-01T00:00:00.000Z");
  assert.equal(seBorraEl({ bandeja: "contacto", estado: "spam", recibidoEn: LLEGO, estadoEn: marcado }).toISOString(), "2026-10-31T00:00:00.000Z");
  const tarde = new Date("2027-09-10T00:00:00.000Z");
  assert.equal(seBorraEl({ bandeja: "cv", estado: "spam", recibidoEn: LLEGO, estadoEn: tarde }).toISOString(), "2027-09-21T14:05:00.000Z");
});

test("los bordes de las tareas son los mismos plazos contados hacia atrás", () => {
  const hoy = new Date("2028-09-21T14:05:00.000Z");
  assert.equal(bordeDeGuarda("contacto", hoy).toISOString(), "2026-09-21T14:05:00.000Z");
  assert.equal(bordeDeGuarda("cv", hoy).toISOString(), "2027-09-21T14:05:00.000Z");
  assert.equal(bordeDelSpam(hoy).toISOString(), "2028-08-22T14:05:00.000Z");
});
