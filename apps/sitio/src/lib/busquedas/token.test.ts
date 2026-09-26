import { test } from "node:test";
import assert from "node:assert/strict";
import { generateKeyPairSync, verify } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { firmarJwt, pedirToken } from "./token";
import { ErrorDeBusquedas } from "./tipos";

// Una clave de verdad, generada para el test: la firma se verifica con su
// pública, sin credenciales de Google.
const { privateKey: CLAVE, publicKey: PUBLICA } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
  publicKeyEncoding: { type: "spki", format: "pem" },
});
const CORREO = "lectura@proyecto.iam.gserviceaccount.com";
const ALCANCE = "https://www.googleapis.com/auth/webmasters.readonly";
const AHORA = Date.UTC(2026, 8, 26, 12, 0, 0);
const FIXTURES = path.join(path.dirname(fileURLToPath(import.meta.url)), "__fixtures__");

const decodificar = (parte: string) => JSON.parse(Buffer.from(parte, "base64url").toString("utf8"));

test("el JWT lleva lo que pide Google y su firma RS256 verifica con la clave pública", () => {
  const [encabezado, reclamos, firma] = firmarJwt({ correo: CORREO, clave: CLAVE, alcance: ALCANCE, ahora: AHORA }).split(".");
  assert.deepEqual(decodificar(encabezado), { alg: "RS256", typ: "JWT" });
  const iat = AHORA / 1000;
  assert.deepEqual(decodificar(reclamos), { iss: CORREO, scope: ALCANCE, aud: "https://oauth2.googleapis.com/token", iat, exp: iat + 3600 });
  assert.ok(verify("sha256", Buffer.from(`${encabezado}.${reclamos}`), PUBLICA, Buffer.from(firma, "base64url")));
});

test("la clave con los \\n escritos, como queda en una variable, firma igual", () => {
  const escrita = CLAVE.replace(/\n/g, "\\n");
  assert.ok(!escrita.includes("\n"));
  assert.equal(firmarJwt({ correo: CORREO, clave: escrita, alcance: ALCANCE, ahora: AHORA }), firmarJwt({ correo: CORREO, clave: CLAVE, alcance: ALCANCE, ahora: AHORA }));
});

test("una clave que no se puede leer se explica en llano", () => {
  assert.throws(
    () => firmarJwt({ correo: CORREO, clave: "no es una clave", alcance: ALCANCE, ahora: AHORA }),
    (e: unknown) => e instanceof ErrorDeBusquedas && /no se pudo leer/.test(e.message),
  );
});

test("el canje manda el JWT como pide Google y devuelve el access token", async () => {
  const pedidos: Array<{ url: string; init?: RequestInit }> = [];
  const token = await pedirToken({
    correo: CORREO,
    clave: CLAVE,
    alcance: ALCANCE,
    ahora: AHORA,
    fetchImpl: async (url, init) => {
      pedidos.push({ url: String(url), init });
      return new Response(readFileSync(path.join(FIXTURES, "token.json")), { status: 200 });
    },
  });
  assert.equal(token, "ya29.c.respuesta-grabada-de-prueba");
  assert.equal(pedidos.length, 1);
  assert.equal(pedidos[0].url, "https://oauth2.googleapis.com/token");
  assert.equal(pedidos[0].init?.method, "POST");
  assert.deepEqual(pedidos[0].init?.headers, { "Content-Type": "application/x-www-form-urlencoded" });
  const cuerpo = pedidos[0].init?.body as URLSearchParams;
  assert.equal(cuerpo.get("grant_type"), "urn:ietf:params:oauth:grant-type:jwt-bearer");
  assert.equal(cuerpo.get("assertion")?.split(".").length, 3);
});

test("un invalid_grant se explica en llano", async () => {
  const pedido = pedirToken({
    correo: CORREO,
    clave: CLAVE,
    alcance: ALCANCE,
    ahora: AHORA,
    fetchImpl: async () => Response.json({ error: "invalid_grant", error_description: "Invalid JWT Signature." }, { status: 400 }),
  });
  await assert.rejects(pedido, (e: unknown) => e instanceof ErrorDeBusquedas && e.estado === 400 && /la clave no es de ese correo/.test(e.message));
});
