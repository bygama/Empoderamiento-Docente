import { after, test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readdirSync } from "node:fs";
import { rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { config as cargarEntorno } from "dotenv";
import sharp from "sharp";
import { almacenEnDisco } from "@/lib/contenido/almacen";

// Subir contra el Postgres local, con los archivos en una carpeta temporal.
// Las filas de prueba llevan el alt «Prueba subir…» y se borran al final.

cargarEntorno({ path: [".env.local"], quiet: true });
const sinBase = { skip: !process.env.DATABASE_URL && "sin DATABASE_URL" };
const carpeta = mkdtempSync(path.join(os.tmpdir(), "ed-subir-"));

async function modulos() {
  const { base } = await import("@/datos/cliente");
  const { subirFotoEnBase } = await import("./subir-foto");
  return { base, subirFotoEnBase };
}

const SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><script>alert(1)</script><rect width="10" height="10"/></svg>`;

test("un SVG no se sube aunque diga ser un png: el tipo sale de los bytes", sinBase, async () => {
  const { base, subirFotoEnBase } = await modulos();
  const archivo = new File([SVG], "logo.png", { type: "image/png" });
  const r = await subirFotoEnBase(base, almacenEnDisco(carpeta), { archivo, alt: "Prueba subir svg", quien: "Ana" });
  assert.deepEqual(r, { ok: false, detalle: "El archivo no es una imagen jpg, png o webp." });
  assert.equal(await base.foto.count({ where: { alt: "Prueba subir svg" } }), 0);
  assert.deepEqual(readdirSync(carpeta), []);
});

test("un webp con su alt crea la fila, con quién la subió, y deja el archivo", sinBase, async () => {
  const { base, subirFotoEnBase } = await modulos();
  const bytes = await sharp({ create: { width: 4, height: 3, channels: 3, background: "#1f2a44" } }).webp().toBuffer();
  const r = await subirFotoEnBase(base, almacenEnDisco(carpeta), { archivo: new File([new Uint8Array(bytes)], "aula.webp"), alt: "Prueba subir webp", quien: "Ana" });
  assert.equal(r.ok, true);
  if (!r.ok) return;
  const fila = await base.foto.findUniqueOrThrow({ where: { id: r.foto.id } });
  assert.deepEqual([fila.url, fila.ancho, fila.alto, fila.tipo, fila.subidaPor], [`/api/fotos/${r.foto.id}`, 4, 3, "image/webp", "Ana"]);
  assert.deepEqual(readdirSync(carpeta), [`${r.foto.id}.webp`]);
});

test("sin alt no se sube", sinBase, async () => {
  const { base, subirFotoEnBase } = await modulos();
  const r = await subirFotoEnBase(base, almacenEnDisco(carpeta), { archivo: new File(["x"], "a.webp"), alt: "  ", quien: "Ana" });
  assert.deepEqual(r, { ok: false, detalle: "El texto alternativo es obligatorio." });
});

after(async () => {
  if (process.env.DATABASE_URL) {
    const { base } = await modulos();
    await base.foto.deleteMany({ where: { alt: { startsWith: "Prueba subir" } } });
  }
  await rm(carpeta, { recursive: true, force: true });
});
