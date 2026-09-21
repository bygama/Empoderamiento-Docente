import { test } from "node:test";
import assert from "node:assert/strict";
import { esUnPreviewDeVercel } from "./dominio";

test("en producción no se cierra", () => {
  assert.equal(esUnPreviewDeVercel("production"), false);
});

test("en un preview de Vercel se cierra", () => {
  assert.equal(esUnPreviewDeVercel("preview"), true);
});

test("en development se cierra", () => {
  assert.equal(esUnPreviewDeVercel("development"), true);
});

test("una VERCEL_ENV vacía por accidente tampoco cierra nada", () => {
  assert.equal(esUnPreviewDeVercel(""), false);
});

test("sin VERCEL_ENV (local) no se cierra", () => {
  assert.equal(esUnPreviewDeVercel(undefined), false);
});
