import { test } from "node:test";
import assert from "node:assert/strict";
import { COLUMNAS_DEL_CV, camposDelCV, cvAbierto } from "./cv";

// La lista del CV es provisoria y va a cambiar cuando ED la confirme. Lo que
// no puede cambiar es que haya a quién responder.

const CAMPOS_DEL_CV = camposDelCV(["Chile", "Perú"]);

test("la lista del CV tiene nombre y correo, obligatorios", () => {
  const campo = (clave: string) => CAMPOS_DEL_CV.find((c) => c.clave === clave);
  assert.equal(campo("nombre")?.obligatorio, true);
  assert.equal(campo("correo")?.obligatorio, true);
  assert.equal(campo("correo")?.tipo, "correo");
});

test("cada clave aparece una vez, y las columnas son de la lista", () => {
  const claves = CAMPOS_DEL_CV.map((c) => c.clave);
  assert.equal(new Set(claves).size, claves.length);
  for (const columna of COLUMNAS_DEL_CV) assert.ok((claves as readonly string[]).includes(columna), `${columna} no está en la lista`);
});

test("la entrada pública está apagada salvo CV_ABIERTO=si", () => {
  assert.equal(cvAbierto({}), false);
  assert.equal(cvAbierto({ CV_ABIERTO: "true" }), false);
  assert.equal(cvAbierto({ CV_ABIERTO: "si" }), true);
});

test("el país ofrece los países que recibe, en su orden, y «Otro»", () => {
  assert.deepEqual(CAMPOS_DEL_CV.find((c) => c.clave === "pais")?.opciones, ["Chile", "Perú", "Otro"]);
});
