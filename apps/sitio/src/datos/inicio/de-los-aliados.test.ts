import { test } from "node:test";
import assert from "node:assert/strict";
import { filaDeAliadosSinAutorizar } from "./de-los-aliados";
import { PENDIENTES } from "./pendientes";
import { enOrden, visiblesPara } from "./registro";

// Lo que Aliados le suma al Inicio: los sin autorizar, cómo se dice y quién
// lo ve (solo quien puede ponerles la marca).

test("la fila aparece con algo y nombra a los aliados", () => {
  assert.equal(filaDeAliadosSinAutorizar([]), null);
  assert.deepEqual(filaDeAliadosSinAutorizar(["OEA"]), { titulo: "1 aliado sin autorizar", detalle: "OEA" });
  assert.deepEqual(filaDeAliadosSinAutorizar(["OEA", "CENEVAL"]), { titulo: "2 aliados sin autorizar", detalle: "OEA y CENEVAL" });
});

test("la ven quien dirige y quien administra, y no quien edita", () => {
  const la = (rol: string) => visiblesPara(enOrden(PENDIENTES), rol).some((p) => p.clave === "aliados-sin-autorizar");
  assert.equal(la("dirige"), true);
  assert.equal(la("administra"), true);
  assert.equal(la("edita"), false);
});
