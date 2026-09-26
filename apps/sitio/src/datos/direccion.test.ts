import { after, test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { config as cargarEntorno } from "dotenv";
import { ROL_DE_LA_DIRECCION, segundoFactorObligatorio } from "@ed/auth";

// Contra la base de verdad: lo que se prueba es el índice único parcial, que
// no existe en ningún otro lado.
cargarEntorno({ path: [".env.local"], quiet: true });
const hayBase = Boolean(process.env.DATABASE_URL);
const sinBase = { skip: !hayBase && "sin DATABASE_URL" };

const creadas: string[] = [];

async function crearCuenta(rol: string) {
  const { base } = await import("@/datos/cliente");
  const id = randomUUID();
  creadas.push(id);
  const correo = `prueba-${id}@ed.test`;
  // Dirige y administra no existen sin el segundo factor (el CHECK de la base).
  await base.user.create({ data: { id, name: `Prueba ${id.slice(0, 8)}`, email: correo, rol, twoFactorEnabled: segundoFactorObligatorio(rol) } });
  return correo;
}

after(async () => {
  if (!hayBase) return;
  const { base } = await import("@/datos/cliente");
  await base.user.deleteMany({ where: { id: { in: creadas } } });
  await base.$disconnect();
});

test("la base no deja que haya dos personas que dirigen", sinBase, async () => {
  const { quienDirige } = await import("./direccion");
  if (!(await quienDirige())) await crearCuenta(ROL_DE_LA_DIRECCION);
  await assert.rejects(crearCuenta(ROL_DE_LA_DIRECCION), (e: { code?: string }) => e.code === "P2002");
});

test("nombrar la dirección se niega si el correo no tiene cuenta", sinBase, async () => {
  const { nombrarDireccion } = await import("./direccion");
  const resultado = await nombrarDireccion(`nadie-${randomUUID()}@ed.test`);
  assert.equal(resultado.ok, false);
  assert.match(!resultado.ok ? resultado.motivo : "", /No hay ninguna cuenta/);
});

test("nombrar la dirección se niega si ya hay quien dirige", sinBase, async () => {
  const { nombrarDireccion, quienDirige } = await import("./direccion");
  if (!(await quienDirige())) await crearCuenta(ROL_DE_LA_DIRECCION);
  const resultado = await nombrarDireccion(await crearCuenta("administra"));
  assert.equal(resultado.ok, false);
  assert.match(!resultado.ok ? resultado.motivo : "", /Ya dirige/);
});

test("nombrar la dirección pasa a dirige una cuenta que ya existe", sinBase, async (t) => {
  const { base } = await import("@/datos/cliente");
  const { nombrarDireccion, quienDirige } = await import("./direccion");
  // Solo sin nadie que dirija: la prueba no le saca la dirección a nadie.
  const ya = await quienDirige();
  if (ya && !creadas.some((id) => ya.correo === `prueba-${id}@ed.test`)) return t.skip("ya hay quien dirige en esta base");
  if (ya) await base.user.updateMany({ where: { email: ya.correo }, data: { rol: "administra" } });
  const correo = await crearCuenta("edita");
  assert.deepEqual(await nombrarDireccion(correo.toUpperCase()), { ok: true, nombre: `Prueba ${correo.slice(7, 15)}` });
  assert.equal((await quienDirige())?.correo, correo);
});
