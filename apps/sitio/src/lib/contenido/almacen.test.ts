import { after, test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { almacenEnDisco, buscarEnDisco } from "./almacen";

// Sincrónico a propósito: un await de nivel superior depende de que el
// archivo se cargue como ESM, y eso lo decide el package.json más cercano.
const carpeta = mkdtempSync(path.join(os.tmpdir(), "ed-fotos-"));
const ID = "0f0e0d0c-0b0a-4908-8706-050403020100";

test("guardar deja el archivo con su extensión y devuelve la URL local", async () => {
  const { url } = await almacenEnDisco(carpeta).guardar({ id: ID, tipo: "image/webp", bytes: Buffer.from("RIFF") });
  assert.equal(url, `/api/fotos/${ID}`);
  assert.equal((await readFile(path.join(carpeta, `${ID}.webp`))).toString(), "RIFF");
  assert.deepEqual(await buscarEnDisco(carpeta, ID), { ruta: path.join(carpeta, `${ID}.webp`), tipo: "image/webp" });
});

test("borrar saca el archivo del disco y buscarEnDisco deja de encontrarlo", async () => {
  const almacen = almacenEnDisco(carpeta);
  const idPropio = "1a2b3c4d-5e6f-4708-8706-050403020199";
  const { url } = await almacen.guardar({ id: idPropio, tipo: "image/png", bytes: Buffer.from("PNG") });
  await almacen.borrar(url);
  assert.equal(await buscarEnDisco(carpeta, idPropio), null);
});

test("buscarEnDisco no acepta ids raros ni encuentra lo que no está", async () => {
  assert.equal(await buscarEnDisco(carpeta, "../../.env.local"), null);
  assert.equal(await buscarEnDisco(carpeta, "0f0e0d0c-0b0a-4908-8706-050403020199"), null);
});

after(() => rm(carpeta, { recursive: true, force: true }));
