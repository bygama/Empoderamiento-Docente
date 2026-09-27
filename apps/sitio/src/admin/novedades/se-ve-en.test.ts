import { test } from "node:test";
import assert from "node:assert/strict";
import { dondeSeVe } from "./se-ve-en";

const publicadas = [
  { id: "a", fecha: "2026-08-26", slug: "a" },
  { id: "b", fecha: "2026-07", slug: "b" },
  { id: "c", fecha: "2026-06-10", slug: "c" },
  { id: "d", fecha: "2026-05-01", slug: "d" },
  { id: "e", fecha: "2025", slug: "e" },
];
const vecinas = { destacada: { id: "c", titulo: "La C" }, publicadas };
const lugares = (r: ReturnType<typeof dondeSeVe>) => r.map((l) => `${l.lugar}: ${l.detalle}`);

test("una nueva de hoy: la segunda nota de la tapa, con su ficha y en el Inicio", () => {
  assert.deepEqual(lugares(dondeSeVe({ id: null, slug: "nueva", fecha: "2026-09-26", destacada: false, conCuerpo: true }, vecinas)), [
    "Novedades: En la tapa, como la segunda nota, y en la lista.",
    "Su ficha: /novedades/nueva",
    "Inicio: Entre las 4 más nuevas.",
  ]);
});

test("una vieja sin cuerpo: solo en la lista, sin ficha ni Inicio", () => {
  assert.deepEqual(lugares(dondeSeVe({ id: "e", slug: "e", fecha: "2025", destacada: false, conCuerpo: false }, vecinas)), [
    "Novedades: En la lista.",
    "Sin ficha: No tiene cuerpo: se ve solo en Novedades, y no tiene un link propio para compartir.",
  ]);
});

test("marcarla destacada la pone en la tapa, aunque haya otra", () => {
  const [novedades] = dondeSeVe({ id: "e", slug: "e", fecha: "2025", destacada: true, conCuerpo: true }, vecinas);
  assert.equal(novedades.detalle, "En la tapa, como la destacada, y en la lista.");
});

test("sin destacada, la tapa es la más nueva; y la que cambia de fecha se mide con la de pantalla", () => {
  const sinDestacada = { destacada: null, publicadas };
  assert.equal(dondeSeVe({ id: "a", slug: "a", fecha: "2026-08-26", destacada: false, conCuerpo: true }, sinDestacada)[0].detalle, "En la tapa, por ser la más nueva, y en la lista.");
  // «d» pasa a 2024: sale de las cuatro más nuevas del Inicio.
  assert.equal(dondeSeVe({ id: "d", slug: "d", fecha: "2024", destacada: false, conCuerpo: true }, sinDestacada).length, 2);
});
