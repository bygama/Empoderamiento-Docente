import { after, test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { config as cargarEntorno } from "dotenv";

cargarEntorno({ path: [".env.local"], quiet: true });
const hayBase = Boolean(process.env.DATABASE_URL);
const sinBase = { skip: !hayBase && "sin DATABASE_URL" };

// Un «hoy» de 2001: el borde queda en enero de 2000 y la poda no alcanza
// ninguna fila de verdad, solo las de la cuenta de prueba.
const HOY = new Date("2001-01-15T12:00:00.000Z");
const cuenta = randomUUID();
const empezo = new Date();

after(async () => {
  if (!hayBase) return;
  const { base } = await import("@/datos/cliente");
  await base.actividad.deleteMany({ where: { cuentaId: cuenta } });
  await base.user.deleteMany({ where: { id: cuenta } });
  await base.corridaDeTarea.deleteMany({ where: { tarea: "poda-de-actividad", corridaEn: { gte: empezo } } });
  await base.$disconnect();
});

test("el borde son doce meses de calendario", async () => {
  const { limiteDeActividad } = await import("./poda-de-actividad");
  assert.equal(limiteDeActividad(HOY).toISOString(), "2000-01-15T12:00:00.000Z");
});

test("borra lo de más de 12 meses, deja lo demás, y la corrida queda registrada", sinBase, async () => {
  const { base } = await import("@/datos/cliente");
  const { correrTareas } = await import("@/lib/tareas/corredor");
  const { registrarCorrida } = await import("./corridas");
  const { TAREAS_DIARIAS } = await import("./diarias");
  const { podaDeActividad, podarActividad } = await import("./poda-de-actividad");
  assert.ok(TAREAS_DIARIAS.includes(podaDeActividad), "la poda no está en las tareas del cron diario");

  await base.user.create({ data: { id: cuenta, name: "Prueba", email: `prueba-${cuenta}@ed.test` } });
  await base.actividad.createMany({
    data: [
      { cuentaId: cuenta, tipo: "entro", en: new Date("1999-12-01T00:00:00.000Z") },
      { cuentaId: cuenta, tipo: "salio", en: new Date("2000-06-01T00:00:00.000Z") },
    ],
  });
  // Por el corredor, como en el cron, con el «hoy» de la prueba.
  const [corrida] = await correrTareas([{ ...podaDeActividad, correr: () => podarActividad(HOY) }], { registrar: registrarCorrida, limiteMs: 10_000 });

  assert.deepEqual(corrida, { clave: "poda-de-actividad", ok: true, detalle: "Se borró 1 fila de actividad de más de 12 meses." });
  assert.deepEqual((await base.actividad.findMany({ where: { cuentaId: cuenta } })).map((f) => f.tipo), ["salio"]);
  const registrada = await base.corridaDeTarea.findFirst({ where: { tarea: "poda-de-actividad", corridaEn: { gte: empezo } } });
  assert.equal(registrada?.ok, true);
});
