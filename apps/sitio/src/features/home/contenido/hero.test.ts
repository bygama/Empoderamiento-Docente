import { test } from "node:test";
import assert from "node:assert/strict";
import { esquemaHero, heroInicial } from "./hero";

// heroInicial es un dato, no lógica, pero es el que carga el sitio la primera
// vez y sin base: si alguien lo edita a mano y lo desincroniza del esquema (o
// de la cantidad de tarjetas que pide la geometría), el hero se rompe en
// producción. Este test lo detecta antes de eso.

test("heroInicial pasa su propio esquema", () => {
  assert.equal(esquemaHero.safeParse(heroInicial).success, true);
});

test("heroInicial trae once tarjetas de escritorio y ocho de celular", () => {
  assert.equal(heroInicial.tarjetas.length, 11);
  assert.equal(heroInicial.tarjetasCelular.length, 8);
});
