import { after, test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { almacenPrivado, almacenPrivadoEnDisco, claveValida } from "./almacen-privado";

const carpetas: string[] = [];
after(async () => {
  for (const c of carpetas) await rm(c, { recursive: true, force: true });
});

async function enDisco() {
  const carpeta = await mkdtemp(path.join(tmpdir(), "ed-almacen-"));
  carpetas.push(carpeta);
  return almacenPrivadoEnDisco(carpeta);
}

test("guarda, lee y borra; borrar lo que ya no está no es un error", async () => {
  const almacen = await enDisco();
  const clave = `cv/${randomUUID()}.pdf`;
  await almacen.guardar(clave, new TextEncoder().encode("%PDF-1.7 hola"), "application/pdf");
  const leido = await almacen.leer(clave);
  assert.equal(leido?.bytes, 13);
  assert.equal(await new Response(leido?.stream).text(), "%PDF-1.7 hola");
  await almacen.borrar(clave);
  assert.equal(await almacen.leer(clave), null);
  await almacen.borrar(clave);
});

test("una clave que no es carpeta/uuid.ext no llega al disco", async () => {
  const almacen = await enDisco();
  assert.equal(claveValida("../.env.local"), false);
  assert.equal(claveValida(`cv/${randomUUID()}.pdf`), true);
  await assert.rejects(almacen.leer("cv/../../.env.local"), /no tiene la forma/);
});

test("sin token en producción no hay almacén: nunca el disco de una función", () => {
  assert.throws(() => almacenPrivado({ carpeta: ".cv", produccion: true }), /Falta el token/);
  assert.doesNotThrow(() => almacenPrivado({ carpeta: ".cv", produccion: false }));
});
