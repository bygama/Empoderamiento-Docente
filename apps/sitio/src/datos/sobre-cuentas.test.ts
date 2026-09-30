import { after, test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { config as cargarEntorno } from "dotenv";

// Contra la base de verdad: borrar lo decide la clave foránea de `actividad`,
// que solo existe ahí.
cargarEntorno({ path: [".env.local"], quiet: true });
const hayBase = Boolean(process.env.DATABASE_URL);
const sinBase = { skip: !hayBase && "sin DATABASE_URL" };

const creadas: string[] = [];

async function cuenta(): Promise<string> {
  const { base } = await import("@/datos/cliente");
  const id = randomUUID();
  creadas.push(id);
  await base.user.create({ data: { id, name: "Prueba", email: `prueba-${id}@ed.test` } });
  await base.verification.create({ data: { id, identifier: `enlace-${id}`, value: id, expiresAt: new Date(Date.now() + 3_600_000) } });
  return id;
}

after(async () => {
  if (!hayBase) return;
  const { base } = await import("@/datos/cliente");
  await base.actividad.deleteMany({ where: { cuentaId: { in: creadas } } });
  await base.verification.deleteMany({ where: { value: { in: creadas } } });
  await base.user.deleteMany({ where: { id: { in: creadas } } });
  await base.$disconnect();
});

test("una cuenta que nunca hizo nada se borra, con sus enlaces", sinBase, async () => {
  const { base } = await import("@/datos/cliente");
  const { borrarSiNuncaHizoNada } = await import("./sobre-cuentas");
  const id = await cuenta();
  assert.equal(await borrarSiNuncaHizoNada(id), "borrada");
  assert.equal(await base.user.findUnique({ where: { id } }), null);
  assert.equal(await base.verification.count({ where: { value: id } }), 0);
});

test("cerrarle el acceso a una cuenta borra sus sesiones, sus enlaces y sus dispositivos recordados, y nada de otra", sinBase, async () => {
  const { base } = await import("@/datos/cliente");
  const { cerrarElAcceso } = await import("./sobre-cuentas");
  const [id, ajena] = [await cuenta(), await cuenta()];
  const sesion = (userId: string) => ({ id: randomUUID(), token: randomUUID(), userId, expiresAt: new Date(Date.now() + 3_600_000) });
  const [propia, otra, deLaAjena] = [sesion(id), sesion(id), sesion(ajena)];
  await base.session.createMany({ data: [propia, otra, deLaAjena] });
  // El dispositivo recordado del segundo factor: better-auth le pone el id de la cuenta como valor, como a los enlaces.
  await base.verification.create({ data: { id: randomUUID(), identifier: `recordado-${id}`, value: id, expiresAt: new Date(Date.now() + 3_600_000) } });

  await cerrarElAcceso(id, propia.id);
  assert.deepEqual((await base.session.findMany({ where: { userId: id }, select: { id: true } })).map((s) => s.id), [propia.id]);
  assert.equal(await base.verification.count({ where: { value: id } }), 0);

  await cerrarElAcceso(id);
  assert.equal(await base.session.count({ where: { userId: id } }), 0);
  assert.equal(await base.session.count({ where: { userId: ajena } }), 1);
  assert.equal(await base.verification.count({ where: { value: ajena } }), 1);
});

test("una con actividad no: la clave foránea contesta y la cuenta queda entera", sinBase, async () => {
  const { base } = await import("@/datos/cliente");
  const { borrarSiNuncaHizoNada } = await import("./sobre-cuentas");
  const id = await cuenta();
  await base.actividad.create({ data: { cuentaId: id, tipo: "entro" } });
  assert.equal(await borrarSiNuncaHizoNada(id), "tiene-historia");
  assert.ok(await base.user.findUnique({ where: { id } }));
  assert.equal(await base.verification.count({ where: { value: id } }), 1);
});
