import { after, test } from "node:test";
import assert from "node:assert/strict";
import { config as cargarEntorno } from "dotenv";

cargarEntorno({ path: [".env.local"], quiet: true });
const hayBase = Boolean(process.env.DATABASE_URL);

const RECIEN = "prueba-a-mano-recien";
const OTRA = "prueba-a-mano-otra";

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

after(async () => {
  if (!hayBase) return;
  const { base } = await import("@/datos/cliente");
  await base.corridaDeTarea.deleteMany({ where: { tarea: { in: [RECIEN, OTRA] } } });
  await base.$disconnect();
});
