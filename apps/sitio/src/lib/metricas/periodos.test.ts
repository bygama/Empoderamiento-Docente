import { test } from "node:test";
import assert from "node:assert/strict";
import { ayerUTC, diaISO, rangoFaltante, sumarDias, variacion, ventanasDe } from "./periodos";

test("diaISO y sumarDias trabajan en UTC", () => {
  assert.equal(diaISO(new Date("2026-09-21T23:30:00.000Z")), "2026-09-21");
  assert.equal(sumarDias("2026-03-01", -1), "2026-02-28");
  assert.equal(sumarDias("2026-12-31", 1), "2027-01-01");
});

test("ayerUTC es el día anterior en UTC, no en la zona local", () => {
  assert.equal(ayerUTC(new Date("2026-09-21T00:30:00.000Z")), "2026-09-20");
});

test("sin nada guardado, el rango son los últimos 30 días hasta ayer", () => {
  assert.deepEqual(rangoFaltante({ ultimoGuardado: null, hoy: new Date("2026-09-21T12:00:00.000Z") }), {
    desde: "2026-08-22",
    hasta: "2026-09-20",
  });
});

test("con datos, el rango arranca el día siguiente al último guardado", () => {
  assert.deepEqual(rangoFaltante({ ultimoGuardado: "2026-09-17", hoy: new Date("2026-09-21T12:00:00.000Z") }), {
    desde: "2026-09-18",
    hasta: "2026-09-20",
  });
});

test("al día, no hay rango", () => {
  assert.equal(rangoFaltante({ ultimoGuardado: "2026-09-20", hoy: new Date("2026-09-21T12:00:00.000Z") }), null);
});

test("nunca más de 31 días por corrida", () => {
  const r = rangoFaltante({ ultimoGuardado: "2026-01-01", hoy: new Date("2026-09-21T12:00:00.000Z") });
  assert.deepEqual(r, { desde: "2026-08-21", hasta: "2026-09-20" });
});

test("las cuatro ventanas: 7 y 30 días hasta el fin, y las anteriores", () => {
  assert.deepEqual(ventanasDe("2026-09-20"), [
    { fechaFin: "2026-09-20", dias: 7, desde: "2026-09-14" },
    { fechaFin: "2026-09-20", dias: 30, desde: "2026-08-22" },
    { fechaFin: "2026-09-13", dias: 7, desde: "2026-09-07" },
    { fechaFin: "2026-08-21", dias: 30, desde: "2026-07-23" },
  ]);
});

test("la variación se lee como la leería una persona", () => {
  assert.equal(variacion(112, 100), "+12 %");
  assert.equal(variacion(97, 100), "−3 %");
  assert.equal(variacion(100, 100), "igual");
  assert.equal(variacion(5, 0), "sin datos previos");
  assert.equal(variacion(5, null), "sin datos previos");
});
