import { test } from "node:test";
import assert from "node:assert/strict";
import { resumenDePaginas } from "./resumen";

const publicada = { estado: { borradorEn: null, borradorPor: null, publicadoEn: "2026-09-21T14:05:00.000Z", publicadoPor: "Ana" } };
const conBorrador = { estado: { borradorEn: "2026-09-25T10:00:00.000Z", borradorPor: "Ana", publicadoEn: null, publicadoPor: null } };

test("cuenta las páginas y las que tienen cambios sin publicar", () => {
  const filas = [conBorrador, conBorrador, publicada, publicada, publicada, publicada, publicada];
  assert.equal(resumenDePaginas(filas), "7 páginas · 2 con cambios sin publicar");
});

test("sin cambios sin publicar, dice solo cuántas son", () => {
  assert.equal(resumenDePaginas([publicada, publicada]), "2 páginas");
});

test("una sola página va en singular", () => {
  assert.equal(resumenDePaginas([conBorrador]), "1 página · 1 con cambios sin publicar");
});
