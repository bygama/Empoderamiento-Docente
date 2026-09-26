import { test } from "node:test";
import assert from "node:assert/strict";
import { PUEDE, QUE_PUEDE, ROLES, esUnaSola, puede, quienPuede, type Capacidad, type Rol } from "./permisos";

// La tabla de permisos del SPEC de `work/mapa-del-admin/` §3, escrita de
// nuevo a mano: si alguien cambia una capacidad en permisos.ts sin cambiar la
// política, este test lo dice. D = dirige · A = administra · E = edita.
const TABLA: Record<Capacidad, string> = {
  editarContenido: "DAE",
  autorizarAliados: "DA",
  editarNovedades: "DAE",
  editarBiblioteca: "DAE",
  verContacto: "DAE",
  verCV: "DA",
  verMetricas: "DAE",
  usarCuentas: "DA",
  tocarLaCuentaDeQuienDirige: "D",
  pasarLaDireccion: "D",
  usarAjustes: "DA",
  configurarConexiones: "DA",
};

const LETRA: Record<Rol, string> = { dirige: "D", administra: "A", edita: "E" };

test("cada rol puede exactamente lo que dice la tabla del §3", () => {
  assert.deepEqual(Object.keys(PUEDE).sort(), Object.keys(TABLA).sort());
  for (const [capacidad, quienes] of Object.entries(TABLA) as [Capacidad, string][]) {
    for (const rol of ROLES) {
      assert.equal(puede(rol, capacidad), quienes.includes(LETRA[rol]), `${rol} › ${capacidad}`);
    }
  }
});

test("lo que no es uno de los tres roles no puede nada", () => {
  for (const rol of [undefined, null, "", "administrador", "DIRIGE", 1]) {
    for (const capacidad of Object.keys(PUEDE) as Capacidad[]) assert.equal(puede(rol, capacidad), false);
  }
});

test("quienPuede dice de quién es algo, en llano", () => {
  assert.equal(quienPuede("usarCuentas"), "quien dirige o administra");
  assert.equal(quienPuede("pasarLaDireccion"), "quien dirige");
  assert.equal(quienPuede("verMetricas"), "quien dirige, administra o edita");
});

test("dirige es la única de a una, y cada rol tiene su frase", () => {
  assert.deepEqual(ROLES.filter(esUnaSola), ["dirige"]);
  for (const rol of ROLES) assert.ok(QUE_PUEDE[rol].length > 0, rol);
});
