import { after, test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdtempSync, readdirSync, utimesSync } from "node:fs";
import { rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { config as cargarEntorno } from "dotenv";
import { almacenEnDisco } from "@/lib/contenido/almacen-en-disco";

// La tarea contra el Postgres local, con los archivos en una carpeta
// temporal: tres archivos —uno que usa una fila, uno suelto de hace dos días
// y uno suelto de recién— y solo se va el suelto viejo.

cargarEntorno({ path: [".env.local"], quiet: true });
const sinBase = { skip: !process.env.DATABASE_URL && "sin DATABASE_URL" };
const carpeta = mkdtempSync(path.join(os.tmpdir(), "ed-sueltos-"));
const almacen = almacenEnDisco(carpeta);
const [usado, viejo, nuevo] = [randomUUID(), randomUUID(), randomUUID()];

test("borra el archivo que ninguna fila usa y tiene más de un día; deja el usado y el recién subido", sinBase, async () => {
  const { base } = await import("@/datos/cliente");
  const { TAREAS_DIARIAS } = await import("./diarias");
  const { archivosDeFotosSueltos, borrarArchivosSueltos } = await import("./archivos-de-fotos-sueltos");
  assert.ok(TAREAS_DIARIAS.includes(archivosDeFotosSueltos), "la tarea no está en el cron diario");

  for (const id of [usado, viejo, nuevo]) await almacen.guardar({ id, tipo: "image/webp", bytes: Buffer.from("RIFF") });
  await base.foto.create({ data: { id: usado, url: `/api/fotos/${usado}`, alt: "Prueba sueltos", ancho: 1, alto: 1, bytes: 4, tipo: "image/webp" } });
  const hace = (horas: number) => new Date(Date.now() - horas * 60 * 60 * 1000);
  utimesSync(path.join(carpeta, `${usado}.webp`), hace(48), hace(48));
  utimesSync(path.join(carpeta, `${viejo}.webp`), hace(48), hace(48));

  const r = await borrarArchivosSueltos({ base, almacen });
  assert.deepEqual(r, { ok: true, detalle: "Se borró 1 archivo de fotos que ninguna fila usa." });
  assert.deepEqual(readdirSync(carpeta).sort(), [`${usado}.webp`, `${nuevo}.webp`].sort());
  assert.deepEqual(await borrarArchivosSueltos({ base, almacen }), { ok: true, detalle: "No había archivos de fotos sueltos." });
});

after(async () => {
  if (process.env.DATABASE_URL) {
    const { base } = await import("@/datos/cliente");
    await base.foto.deleteMany({ where: { id: usado } });
  }
  await rm(carpeta, { recursive: true, force: true });
});
