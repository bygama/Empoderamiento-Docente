import { after, test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { config as cargarEntorno } from "dotenv";

cargarEntorno({ path: [".env.local"], quiet: true });
const hayBase = Boolean(process.env.DATABASE_URL);
const sinBase = { skip: !hayBase && "sin DATABASE_URL" };

const HORA = 60 * 60 * 1000;
const clave = `prueba-${randomUUID()}`;

after(async () => {
  if (!hayBase) return;
  const { base } = await import("@/datos/cliente");
  await base.limitePorIp.deleteMany({ where: { clave } });
  await base.$disconnect();
});

test("diez envíos a la vez cuentan diez, sin perder ninguno", sinBase, async () => {
  const { sumarEnvio } = await import("./limites-por-ip");
  const ahora = new Date("2026-09-26T12:00:00.000Z");
  const cuentas = await Promise.all(Array.from({ length: 10 }, () => sumarEnvio(clave, HORA, ahora)));
  assert.deepEqual([...cuentas].sort((a, b) => a - b), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
});

test("dentro de la ventana suma; vencida, empieza otra", sinBase, async () => {
  const { sumarEnvio } = await import("./limites-por-ip");
  assert.equal(await sumarEnvio(clave, HORA, new Date("2026-09-26T12:59:00.000Z")), 11);
  assert.equal(await sumarEnvio(clave, HORA, new Date("2026-09-26T13:00:00.000Z")), 1);
  assert.equal(await sumarEnvio(clave, HORA, new Date("2026-09-26T13:30:00.000Z")), 2);
});

test("la poda borra las ventanas viejas y deja las demás", sinBase, async () => {
  const { base } = await import("@/datos/cliente");
  const { podarLimites } = await import("./limites-por-ip");
  const vieja = `${clave}-vieja`;
  await base.limitePorIp.create({ data: { clave: vieja, envios: 1, desde: new Date("2000-01-01T00:00:00.000Z") } });
  // Solo las de esta prueba: el borde es el año 2001, así no toca filas de verdad.
  assert.equal(await podarLimites(new Date("2001-01-01T00:00:00.000Z")), 1);
  assert.equal(await base.limitePorIp.count({ where: { clave } }), 1);
});
