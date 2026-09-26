import { after, test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { config as cargarEntorno } from "dotenv";

cargarEntorno({ path: [".env.local"], quiet: true });
const hayBase = Boolean(process.env.DATABASE_URL);
const sinBase = { skip: !hayBase && "sin DATABASE_URL" };

after(async () => {
  if (!hayBase) return;
  const { base } = await import("@/datos/cliente");
  await base.$disconnect();
});

test("diez fallos al mismo tiempo cuentan diez", sinBase, async () => {
  const { almacenDeBloqueos } = await import("./bloqueos-de-acceso");
  const clave = `prueba-${randomUUID()}`;
  const desde = new Date();
  try {
    await Promise.all(
      Array.from({ length: 10 }, () =>
        almacenDeBloqueos.actualizar(clave, (actual) => ({
          fallos: (actual?.fallos ?? 0) + 1,
          desde: actual?.desde ?? desde,
          bloqueos: 0,
          hasta: null,
        })),
      ),
    );
    assert.equal((await almacenDeBloqueos.leer(clave))?.fallos, 10);
  } finally {
    await almacenDeBloqueos.borrar(clave);
  }
  assert.equal(await almacenDeBloqueos.leer(clave), null);
});

test("podar borra lo quieto y deja lo frenado", sinBase, async () => {
  const { almacenDeBloqueos } = await import("./bloqueos-de-acceso");
  const hace2Dias = new Date(Date.now() - 48 * 60 * 60 * 1000);
  const quieta = `prueba-${randomUUID()}`;
  const frenada = `prueba-${randomUUID()}`;
  try {
    await almacenDeBloqueos.actualizar(quieta, () => ({ fallos: 2, desde: hace2Dias, bloqueos: 1, hasta: null }));
    await almacenDeBloqueos.actualizar(frenada, () => ({ fallos: 0, desde: hace2Dias, bloqueos: 3, hasta: new Date(Date.now() + 60_000) }));
    await almacenDeBloqueos.podar(new Date(Date.now() - 24 * 60 * 60 * 1000));
    assert.equal(await almacenDeBloqueos.leer(quieta), null);
    assert.notEqual(await almacenDeBloqueos.leer(frenada), null);
  } finally {
    await almacenDeBloqueos.borrar(quieta);
    await almacenDeBloqueos.borrar(frenada);
  }
});
