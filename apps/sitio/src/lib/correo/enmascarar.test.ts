import { test } from "node:test";
import assert from "node:assert/strict";
import { enmascararCorreo } from "./enmascarar";

test("deja la primera letra y el dominio, y nada más", () => {
  assert.equal(enmascararCorreo(" daniela@gmail.com "), "d•••@gmail.com");
  assert.equal(enmascararCorreo("a@ed.test"), "a•••@ed.test");
});

test("si no parece un correo, no inventa uno", () => {
  for (const cosa of ["", "sin-arroba", "@ed.test", "ana@"]) assert.equal(enmascararCorreo(cosa), "tu correo");
});
