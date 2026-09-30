import { test } from "node:test";
import assert from "node:assert/strict";
import { hostDelBlob } from "./host-del-blob";

test("con token, el host es el del store propio, en minúsculas como lo arma @vercel/blob", () => {
  assert.equal(hostDelBlob("vercel_blob_rw_AbC123xYz_unSecretoCualquiera"), "abc123xyz.public.blob.vercel-storage.com");
});

test("sin token no hay Blob: las fotos se sirven del mismo origen", () => {
  assert.equal(hostDelBlob(undefined), null);
  assert.equal(hostDelBlob(""), null);
});

test("un token con otra forma deja el dominio de Blob entero, no las fotos rotas", () => {
  assert.equal(hostDelBlob("otra-forma-de-token"), "*.public.blob.vercel-storage.com");
});
