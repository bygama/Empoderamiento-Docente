import { test } from "node:test";
import assert from "node:assert/strict";
import { claveDeLimite, ipDelPedido } from "./limite";

test("la IP sale de x-forwarded-for, después de x-real-ip, y si no hay, un cupo común", () => {
  assert.equal(ipDelPedido(new Headers({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" })), "203.0.113.7");
  assert.equal(ipDelPedido(new Headers({ "x-real-ip": "203.0.113.8" })), "203.0.113.8");
  assert.equal(ipDelPedido(new Headers()), "desconocida");
});

test("la clave no deja ver la IP y separa un formulario del otro", () => {
  const contacto = claveDeLimite("contacto", "203.0.113.7", "secreto");
  assert.match(contacto, /^[0-9a-f]{64}$/);
  assert.ok(!contacto.includes("203"));
  assert.notEqual(contacto, claveDeLimite("cv", "203.0.113.7", "secreto"));
  assert.equal(contacto, claveDeLimite("contacto", "203.0.113.7", "secreto"));
});
