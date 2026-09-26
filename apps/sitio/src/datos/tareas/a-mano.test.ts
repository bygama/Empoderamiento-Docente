import { after, test } from "node:test";
import assert from "node:assert/strict";
import { config as cargarEntorno } from "dotenv";

cargarEntorno({ path: [".env.local"], quiet: true });
const hayBase = Boolean(process.env.DATABASE_URL);

const RECIEN = "prueba-a-mano-recien";
const OTRA = "prueba-a-mano-otra";
const A_LA_VEZ = "prueba-a-mano-a-la-vez";

test("el freno es por tarea: una corrida reciente frena a su tarea y no a otra", { skip: !hayBase && "sin DATABASE_URL" }, async () => {
  const { base } = await import("@/datos/cliente");
  const { correrAMano } = await import("./a-mano");
  await base.corridaDeTarea.create({ data: { tarea: RECIEN, ok: true, detalle: "Del cron." } });
  let corrio = false;
  const correr = async () => {
    corrio = true;
    return { ok: true, detalle: "Copiado." };
  };

  const frenada = await correrAMano(RECIEN, correr);
  assert.equal(frenada.ok, false);
  assert.match(frenada.detalle, /^La última corrida fue hace 1 minuto; esperá un rato\.$/);
  assert.equal(corrio, false);

  assert.deepEqual(await correrAMano(OTRA, correr), { ok: true, detalle: "Copiado." });
  assert.equal(corrio, true);
  const registradas = await base.corridaDeTarea.findMany({ where: { tarea: OTRA }, select: { ok: true, detalle: true } });
  assert.deepEqual(registradas, [{ ok: true, detalle: "Copiado." }]);
});

test("dos clics a la vez corren la tarea una sola vez", { skip: !hayBase && "sin DATABASE_URL" }, async () => {
  const { base } = await import("@/datos/cliente");
  const { correrAMano } = await import("./a-mano");
  let corridas = 0;
  const correr = async () => {
    corridas++;
    await new Promise((r) => setTimeout(r, 300));
    return { ok: true, detalle: "Copiado." };
  };

  const resultados = await Promise.all([correrAMano(A_LA_VEZ, correr), correrAMano(A_LA_VEZ, correr)]);
  assert.equal(corridas, 1);
  assert.deepEqual(resultados.map((r) => r.ok).sort(), [false, true]);
  assert.match(resultados.find((r) => !r.ok)!.detalle, /esperá/);
  assert.equal(await base.corridaDeTarea.count({ where: { tarea: A_LA_VEZ } }), 1);
});

after(async () => {
  if (!hayBase) return;
  const { base } = await import("@/datos/cliente");
  await base.corridaDeTarea.deleteMany({ where: { tarea: { in: [RECIEN, OTRA, A_LA_VEZ] } } });
  await base.$disconnect();
});
