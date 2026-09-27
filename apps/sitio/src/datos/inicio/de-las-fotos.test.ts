import { test } from "node:test";
import assert from "node:assert/strict";
import { filaDeFotosSinAlt } from "./de-las-fotos";
import { PENDIENTES } from "./pendientes";
import { enOrden, visiblesPara } from "./registro";

// Lo que Fotos le suma al Inicio: las sin texto alternativo, cómo se dice,
// quién lo ve y adónde lleva.

test("la fila aparece con algo, en singular y en plural", () => {
  assert.equal(filaDeFotosSinAlt(0), null);
  assert.deepEqual(filaDeFotosSinAlt(1), { titulo: "1 foto sin texto alternativo", detalle: "Un lector de pantalla no puede decir qué muestra." });
  assert.equal(filaDeFotosSinAlt(3)?.titulo, "3 fotos sin texto alternativo");
});

test("la ven los tres roles, y lleva a la grilla con el filtro puesto", () => {
  for (const rol of ["dirige", "administra", "edita"]) {
    assert.ok(visiblesPara(enOrden(PENDIENTES), rol).some((p) => p.clave === "fotos-sin-alt"), rol);
  }
  assert.equal(PENDIENTES["fotos-sin-alt"].href, "/admin/contenido/fotos?filtro=sin-alt");
});
