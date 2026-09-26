import { test } from "node:test";
import assert from "node:assert/strict";
import { hash } from "@node-rs/argon2";
import { hashPassword as hashearConScrypt } from "better-auth/crypto";
import { hashear, necesitaRehash, verificar } from "./contrasenas";

const CONTRASENA = "una contraseña larga de verdad";

test("el hash es Argon2id con los parámetros de OWASP", async () => {
  const guardado = await hashear(CONTRASENA);
  assert.ok(guardado.startsWith("$argon2id$v=19$m=19456,t=2,p=1$"), guardado);
  assert.equal(necesitaRehash(guardado), false);
});

test("Argon2id verifica la contraseña y rechaza otra", async () => {
  const guardado = await hashear(CONTRASENA);
  assert.equal(await verificar({ hash: guardado, password: CONTRASENA }), true);
  assert.equal(await verificar({ hash: guardado, password: "otra contraseña cualquiera" }), false);
});

test("un hash scrypt de better-auth verifica y pide rehash", async () => {
  const viejo = await hashearConScrypt(CONTRASENA);
  assert.equal(await verificar({ hash: viejo, password: CONTRASENA }), true);
  assert.equal(await verificar({ hash: viejo, password: "otra contraseña cualquiera" }), false);
  assert.equal(necesitaRehash(viejo), true);
});

test("un Argon2id con parámetros viejos pide rehash", async () => {
  const flojo = await hash(CONTRASENA, { memoryCost: 4096, timeCost: 1, parallelism: 1 });
  assert.equal(await verificar({ hash: flojo, password: CONTRASENA }), true);
  assert.equal(necesitaRehash(flojo), true);
});

test("un formato desconocido no verifica", async () => {
  assert.equal(await verificar({ hash: "texto-en-claro", password: "texto-en-claro" }), false);
});
