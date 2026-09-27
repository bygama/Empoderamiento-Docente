import { after, test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { config as cargarEntorno } from "dotenv";

cargarEntorno({ path: [".env.local"], quiet: true });
const hayBase = Boolean(process.env.DATABASE_URL);
const sinBase = { skip: !hayBase && "sin DATABASE_URL" };

const marca = `prueba ${randomUUID().slice(0, 8)}`;

after(async () => {
  if (!hayBase) return;
  const { base } = await import("@/datos/cliente");
  await base.enlace.deleteMany({ where: { creadoPor: marca } });
  await base.$disconnect();
});

test("dos links con el mismo nombre toman códigos distintos, y borrar dice cuál era", sinBase, async () => {
  const { borrarEnlace, crearEnlace, enlacePorCodigo } = await import("./enlaces");
  const nombre = `Taller ${marca}`;
  const datos = { nombre, destino: "/que-hacemos", canal: "linkedin" as const, creadoPor: marca };
  const [uno, otro] = [await crearEnlace(datos), await crearEnlace(datos)];
  assert.equal(otro.codigo, `${uno.codigo}-2`);
  assert.equal((await enlacePorCodigo(otro.codigo))?.id, otro.id);
  assert.deepEqual(await borrarEnlace(uno.id), { nombre });
  assert.equal(await borrarEnlace(uno.id), null);
  assert.equal(await enlacePorCodigo(uno.codigo), null);
});
