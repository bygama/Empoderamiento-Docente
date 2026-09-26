import { test } from "node:test";
import assert from "node:assert/strict";
import { TIPOS_DE_ACTIVIDAD, tiposQueVe } from "@/datos/actividad";
import { fraseDe } from "./frase";

test("cada fila se lee como una frase, con quién y sobre qué", () => {
  assert.equal(fraseDe({ tipo: "invito", quien: "Ana Pérez", sobre: "Juan Pérez" }), "Ana Pérez invitó a Juan Pérez");
  assert.equal(fraseDe({ tipo: "cambio-el-rol", quien: "Ana", sobre: "Juan, de edita a administra" }), "Ana cambió el rol de Juan, de edita a administra");
  assert.equal(fraseDe({ tipo: "entro", quien: "Ana", sobre: null }), "Ana entró");
  for (const tipo of TIPOS_DE_ACTIVIDAD) assert.match(fraseDe({ tipo, quien: "Ana", sobre: "Juan" }), /^Ana \S/, tipo);
});

test("la actividad de cuentas la ven quien dirige y quien administra, y quien edita no", () => {
  assert.deepEqual(tiposQueVe("administra"), [...TIPOS_DE_ACTIVIDAD]);
  assert.deepEqual(tiposQueVe("edita"), []);
});
