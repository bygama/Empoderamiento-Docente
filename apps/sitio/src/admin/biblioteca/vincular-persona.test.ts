import { test } from "node:test";
import assert from "node:assert/strict";
import { nombraA, vincularPersona } from "./vincular-persona";

const LUIS = { id: "a6cde7aa-bccc-4c38-bff9-44abb6387ad4", nombre: "Luis Cabrera" };

test("compara palabra por palabra, sin mayúsculas ni tildes, y nunca por subcadena", () => {
  assert.equal(nombraA("Luis Manuel Cabrera Chim", "Luis Cabrera"), true);
  assert.equal(nombraA("Ivan Perez", "Iván Pérez"), true);
  assert.equal(nombraA("Daniela Reyes-Gasperini", "Daniela Reyes"), true);
  assert.equal(nombraA("Mariana Pérez", "Ana Pérez"), false);
  assert.equal(nombraA("L. Cabrera", "Luis Cabrera"), false);
});

test("vincula al primer autor que la nombra, y si ninguno la nombra no la agrega", () => {
  const autores = [
    { nombre: "Rodrigo Rojas Viveros", persona: null },
    { nombre: "Luis Manuel Cabrera Chim", persona: null },
  ];
  assert.deepEqual(vincularPersona(autores, LUIS), { autorias: [autores[0], { ...autores[1], persona: LUIS.id }], vinculada: true });
  assert.deepEqual(vincularPersona([autores[0]], LUIS), { autorias: [autores[0]], vinculada: false });
});
