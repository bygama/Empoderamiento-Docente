import { test } from "node:test";
import assert from "node:assert/strict";
import { codigoDesde, pareceCodigo } from "./codigo";

test("el código sale del nombre: minúsculas, sin tildes, hasta 40", () => {
  assert.equal(codigoDesde("Taller en Monterrey"), "taller-en-monterrey");
  assert.equal(codigoDesde("¡Convocatoria 2027: sumate!"), "convocatoria-2027-sumate");
  assert.equal(codigoDesde("Educación matemática en el aula de secundaria, edición 2027"), "educacion-matematica-en-el-aula-de-secun");
  assert.equal(codigoDesde("???"), "link");
});

test("solo se busca lo que tiene forma de código", () => {
  assert.equal(pareceCodigo("taller-en-monterrey"), true);
  assert.equal(pareceCodigo("taller-2"), true);
  assert.equal(pareceCodigo("Taller"), false);
  assert.equal(pareceCodigo("../admin"), false);
  assert.equal(pareceCodigo(""), false);
});
