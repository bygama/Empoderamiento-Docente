import { after, test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { config as cargarEntorno } from "dotenv";

// Contra la base de verdad: el estado sale de la credencial y de
// `suspendida`, y el último acceso, de `actividad` y de `session`.
cargarEntorno({ path: [".env.local"], quiet: true });
const hayBase = Boolean(process.env.DATABASE_URL);
const sinBase = { skip: !hayBase && "sin DATABASE_URL" };

const creadas: string[] = [];

async function cuenta({ conContrasena = false, suspendida = false } = {}): Promise<string> {
  const { base } = await import("@/datos/cliente");
  const id = randomUUID();
  creadas.push(id);
  await base.user.create({ data: { id, name: `Prueba ${id.slice(0, 8)}`, email: `prueba-${id}@ed.test`, suspendida } });
  if (conContrasena) await base.account.create({ data: { id, userId: id, accountId: id, providerId: "credential", password: "un-hash" } });
  return id;
}

after(async () => {
  if (!hayBase) return;
  const { base } = await import("@/datos/cliente");
  await base.actividad.deleteMany({ where: { cuentaId: { in: creadas } } });
  await base.user.deleteMany({ where: { id: { in: creadas } } });
  await base.$disconnect();
});

test("pendiente sin contraseña, activa con ella, y suspendida gana a las dos", sinBase, async () => {
  const { unaCuenta } = await import("./cuentas");
  assert.equal((await unaCuenta(await cuenta()))?.estado, "pendiente");
  assert.equal((await unaCuenta(await cuenta({ conContrasena: true })))?.estado, "activa");
  assert.equal((await unaCuenta(await cuenta({ conContrasena: true, suspendida: true })))?.estado, "suspendida");
  assert.equal(await unaCuenta(randomUUID()), null);
});

test("el último acceso es lo más nuevo entre su último «entró» y sus sesiones abiertas", sinBase, async () => {
  const { base } = await import("@/datos/cliente");
  const { unaCuenta, listarCuentas } = await import("./cuentas");
  const id = await cuenta({ conContrasena: true });
  assert.equal((await unaCuenta(id))?.ultimoAcceso, null);

  const entro = new Date("2026-09-01T10:00:00.000Z");
  await base.actividad.create({ data: { cuentaId: id, tipo: "entro", en: entro } });
  assert.equal((await unaCuenta(id))?.ultimoAcceso, entro.toISOString());

  await base.session.create({ data: { id, token: id, userId: id, expiresAt: new Date(Date.now() + 3_600_000) } });
  const ficha = await unaCuenta(id);
  assert.ok(ficha?.ultimoAcceso && new Date(ficha.ultimoAcceso) > entro);
  assert.equal(ficha?.tieneActividad, true);
  assert.equal(ficha?.sesiones.length, 1);
  assert.equal((await listarCuentas()).find((c) => c.id === id)?.ultimoAcceso, ficha?.ultimoAcceso);
});
