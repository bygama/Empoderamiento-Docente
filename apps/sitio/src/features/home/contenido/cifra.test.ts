import { test } from "node:test";
import assert from "node:assert/strict";
import { partirCifra } from "./cifra";

test("partirCifra separa el prefijo, el número y el sufijo", () => {
  assert.deepEqual(partirCifra("+14.000"), { prefijo: "+", valor: 14000, sufijo: "" });
  assert.deepEqual(partirCifra("500"), { prefijo: "", valor: 500, sufijo: "" });
  assert.deepEqual(partirCifra("90%"), { prefijo: "", valor: 90, sufijo: "%" });
  assert.deepEqual(partirCifra("+14000"), { prefijo: "+", valor: 14000, sufijo: "" });
});

test("partirCifra no acepta lo que no es un número entero", () => {
  assert.equal(partirCifra("muchos"), null);
  assert.equal(partirCifra("1.5"), null);
  assert.equal(partirCifra("2 y 3"), null);
});
