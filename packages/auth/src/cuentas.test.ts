import { test } from "node:test";
import assert from "node:assert/strict";
import { ROLES_QUE_SE_ASIGNAN, queSePuede, seAsigna, type CuentaObjetivo, type LoQueSePuede } from "./cuentas";

// La tabla del SPEC de `work/cuentas/` §3, escrita de nuevo a mano. Cada caso
// dice qué se puede y todo lo demás tiene que ser que no.

type Accion = keyof LoQueSePuede;

function soloEsto(quien: string, objetivo: CuentaObjetivo, esperado: Accion[]) {
  const obtenido = Object.entries(queSePuede(quien, objetivo))
    .filter(([, si]) => si)
    .map(([accion]) => accion)
    .sort();
  assert.deepEqual(obtenido, [...esperado].sort(), `${quien} sobre ${JSON.stringify(objetivo)}`);
}

const ACTIVA = { estado: "activa", esLaPropia: false } as const;

test("sobre otra cuenta activa, dirige y administra pueden todo; solo dirige le pasa la dirección", () => {
  const todo: Accion[] = ["cambiarElRol", "cambiarElCorreo", "cerrarSusSesiones", "suspender", "borrar"];
  soloEsto("dirige", { rol: "administra", ...ACTIVA }, [...todo, "pasarleLaDireccion"]);
  soloEsto("administra", { rol: "edita", ...ACTIVA }, todo);
});

test("la cuenta de quien dirige: solo su correo, y solo ella", () => {
  soloEsto("dirige", { rol: "dirige", estado: "activa", esLaPropia: true }, ["cambiarElCorreo"]);
  soloEsto("administra", { rol: "dirige", ...ACTIVA }, []);
});

test("sobre la propia cuenta, solo el correo", () => {
  soloEsto("administra", { rol: "administra", estado: "activa", esLaPropia: true }, ["cambiarElCorreo"]);
});

test("una pendiente se reenvía o se cancela; una suspendida se reactiva", () => {
  soloEsto("administra", { rol: "edita", estado: "pendiente", esLaPropia: false }, [
    "cambiarElRol",
    "cambiarElCorreo",
    "reenviarLaInvitacion",
    "cancelarLaInvitacion",
  ]);
  soloEsto("dirige", { rol: "edita", estado: "suspendida", esLaPropia: false }, ["cambiarElRol", "cambiarElCorreo", "reactivar", "borrar"]);
});

test("quien edita, o lo que no es un rol, no puede nada", () => {
  for (const quien of ["edita", "", "DIRIGE"]) soloEsto(quien, { rol: "edita", ...ACTIVA }, []);
});

test("dirige no se asigna: se pasa", () => {
  assert.deepEqual(ROLES_QUE_SE_ASIGNAN, ["administra", "edita"]);
  assert.equal(seAsigna("dirige"), false);
  assert.equal(seAsigna("otro"), false);
});
