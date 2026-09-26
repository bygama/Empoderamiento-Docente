import { after, test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { config as cargarEntorno } from "dotenv";

// Contra la base de verdad: el CHECK `user_segundo_factor_obligatorio` solo
// existe ahí, y `ponerRol` es lo que lo respeta.
cargarEntorno({ path: [".env.local"], quiet: true });
const hayBase = Boolean(process.env.DATABASE_URL);
const sinBase = { skip: !hayBase && "sin DATABASE_URL" };

const creadas: string[] = [];

/** Una cuenta que edita, sin segundo factor y con una sesión abierta. */
async function editaConSesion(): Promise<string> {
  const { base } = await import("@/datos/cliente");
  const id = randomUUID();
  creadas.push(id);
  await base.user.create({ data: { id, name: "Prueba", email: `prueba-${id}@ed.test` } });
  await base.session.create({ data: { id, token: id, userId: id, expiresAt: new Date(Date.now() + 3_600_000) } });
  return id;
}

after(async () => {
  if (!hayBase) return;
  const { base } = await import("@/datos/cliente");
  await base.user.deleteMany({ where: { id: { in: creadas } } });
  await base.$disconnect();
});

test("la base no deja que alguien administre sin segundo factor", sinBase, async () => {
  const { base } = await import("@/datos/cliente");
  const id = await editaConSesion();
  await assert.rejects(base.user.update({ where: { id }, data: { rol: "administra" } }), /user_segundo_factor_obligatorio/);
});

test("subir a administra prende el segundo factor y cierra las sesiones; bajar no lo apaga", sinBase, async () => {
  const { base } = await import("@/datos/cliente");
  const { ponerRol } = await import("./roles");
  const id = await editaConSesion();

  assert.deepEqual(await ponerRol(id, "administra"), { cerroSesiones: true });
  assert.deepEqual(await base.user.findUnique({ where: { id }, select: { rol: true, twoFactorEnabled: true } }), { rol: "administra", twoFactorEnabled: true });
  assert.equal(await base.session.count({ where: { userId: id } }), 0);

  await base.session.create({ data: { id: randomUUID(), token: randomUUID(), userId: id, expiresAt: new Date(Date.now() + 3_600_000) } });
  assert.deepEqual(await ponerRol(id, "edita"), { cerroSesiones: false });
  assert.deepEqual(await base.user.findUnique({ where: { id }, select: { rol: true, twoFactorEnabled: true } }), { rol: "edita", twoFactorEnabled: true });
  assert.equal(await base.session.count({ where: { userId: id } }), 1);
});
