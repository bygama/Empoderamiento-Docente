import { test } from "node:test";
import assert from "node:assert/strict";
import { claveDeLimite, ipDelPedido } from "./limite";

const ip = (cabeceras: Record<string, string>) => ipDelPedido(new Headers(cabeceras));

test("la IP sale de x-real-ip, la que pisa el proxy de delante; x-forwarded-for no se lee", () => {
  assert.equal(ip({ "x-real-ip": " 203.0.113.8 " }), "203.0.113.8");
  assert.equal(ip({ "x-real-ip": "203.0.113.8", "x-forwarded-for": "198.51.100.1" }), "203.0.113.8");
  assert.equal(ip({ "x-forwarded-for": "198.51.100.1" }), "desconocida");
});

test("sin una IP válida, todas comparten un cupo", () => {
  assert.equal(ip({}), "desconocida");
  assert.equal(ip({ "x-real-ip": "no-es-una-ip" }), "desconocida");
  assert.equal(ip({ "x-real-ip": "203.0.113.8, 198.51.100.1" }), "desconocida");
});

test("una IPv6 cuenta por su /64; una IPv4 escrita como IPv6, como la IPv4", () => {
  const red = "2001:db8:abcd:12::/64";
  assert.equal(ip({ "x-real-ip": "2001:db8:abcd:12:1:2:3:4" }), red);
  assert.equal(ip({ "x-real-ip": "2001:DB8:ABCD:0012::99" }), red);
  assert.equal(ip({ "x-real-ip": "2001:db8::1" }), "2001:db8::/64");
  assert.notEqual(ip({ "x-real-ip": "2001:db8:abcd:13::1" }), red);
  assert.equal(ip({ "x-real-ip": "::ffff:203.0.113.9" }), "203.0.113.9");
});

test("la clave no deja ver la IP y separa un formulario del otro", () => {
  const contacto = claveDeLimite("contacto", "203.0.113.7", "secreto");
  assert.match(contacto, /^[0-9a-f]{64}$/);
  assert.ok(!contacto.includes("203"));
  assert.notEqual(contacto, claveDeLimite("cv", "203.0.113.7", "secreto"));
  assert.equal(contacto, claveDeLimite("contacto", "203.0.113.7", "secreto"));
});
