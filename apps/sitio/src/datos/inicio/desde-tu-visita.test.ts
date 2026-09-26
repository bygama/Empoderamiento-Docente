import { after, test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { config as cargarEntorno } from "dotenv";

// Contra la base de verdad: qué cuenta como «tu última visita» sale de la
// tabla `actividad`, con sus fechas.
cargarEntorno({ path: [".env.local"], quiet: true });
const sinBase = { skip: !process.env.DATABASE_URL && "sin DATABASE_URL" };

const creadas: string[] = [];
const HORA = 3_600_000;

async function crearCuenta(): Promise<string> {
  const { base } = await import("@/datos/cliente");
  const id = randomUUID();
  creadas.push(id);
  await base.user.create({ data: { id, name: "Prueba", email: `prueba-${id}@ed.test` } });
  return id;
}

async function anotar(cuentaId: string, tipo: string, en: Date): Promise<void> {
  const { base } = await import("@/datos/cliente");
  await base.actividad.create({ data: { cuentaId, tipo, en } });
}

after(async () => {
  if (!process.env.DATABASE_URL) return;
  const { base } = await import("@/datos/cliente");
  await base.actividad.deleteMany({ where: { cuentaId: { in: creadas } } });
  await base.user.deleteMany({ where: { id: { in: creadas } } });
  await base.$disconnect();
});

test("la última visita es la vez anterior que entró, no la de esta sesión ni lo de otras cuentas", sinBase, async () => {
  const { ultimaVisita } = await import("./desde-tu-visita");
  const yo = await crearCuenta();
  const otra = await crearCuenta();
  const comienzo = new Date();
  await anotar(yo, "entro", new Date(comienzo.getTime() - 48 * HORA));
  await anotar(yo, "entro", new Date(comienzo.getTime() - 24 * HORA));
  await anotar(yo, "salio", new Date(comienzo.getTime() - 20 * HORA));
  await anotar(otra, "entro", new Date(comienzo.getTime() - 2 * HORA));
  // La «entro» de esta sesión se escribe después de crearla.
  await anotar(yo, "entro", new Date(comienzo.getTime() + 5));
  assert.deepEqual(await ultimaVisita(yo, comienzo), new Date(comienzo.getTime() - 24 * HORA));
});

test("sin una entrada anterior no hay última visita", sinBase, async () => {
  const { ultimaVisita } = await import("./desde-tu-visita");
  const yo = await crearCuenta();
  const comienzo = new Date();
  await anotar(yo, "entro", new Date(comienzo.getTime() + 5));
  assert.equal(await ultimaVisita(yo, comienzo), null);
});
