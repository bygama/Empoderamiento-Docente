import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { config as cargarEntorno } from "dotenv";
import { segundoFactorObligatorio } from "@ed/auth";

cargarEntorno({ path: [".env.local"], quiet: true });
const hayBase = Boolean(process.env.DATABASE_URL);
const sinBase = { skip: !hayBase && "sin DATABASE_URL" };

// Cuatro cuentas de prueba: una que administra, una que edita, una que
// administra pero apagó el aviso de CV y una que administra y está suspendida.
// Solo se miran las suyas: la base puede tener otras.
const CUENTAS = [
  { id: randomUUID(), rol: "administra", suspendida: false },
  { id: randomUUID(), rol: "edita", suspendida: false },
  { id: randomUUID(), rol: "administra", suspendida: false },
  { id: randomUUID(), rol: "administra", suspendida: true },
];
const [ADMINISTRA, EDITA, CALLADA, SUSPENDIDA] = CUENTAS.map((c) => c.id);
const nuestras = (ids: string[]) => ids.filter((id) => CUENTAS.some((c) => c.id === id)).sort();
const correoDe = (id: string) => `prueba-${id}@ed.test`;

before(async () => {
  if (!hayBase) return;
  const { base } = await import("@/datos/cliente");
  // Dirige y administra no existen sin el segundo factor (el CHECK de la base).
  await base.user.createMany({
    data: CUENTAS.map(({ id, rol, suspendida }) => ({ id, rol, suspendida, twoFactorEnabled: segundoFactorObligatorio(rol), name: `Prueba ${rol}`, email: correoDe(id) })),
  });
  await base.aviso.create({ data: { cuentaId: CALLADA, aviso: "cv", activo: false } });
});

after(async () => {
  if (!hayBase) return;
  const { base } = await import("@/datos/cliente");
  await base.mensaje.deleteMany({ where: { correo: "zoe-secreta@ed.test" } });
  await base.user.deleteMany({ where: { id: { in: CUENTAS.map((c) => c.id) } } });
  await base.$disconnect();
});

test("reciben las cuentas activas cuyo rol ve la bandeja y no apagaron su aviso", sinBase, async () => {
  const { destinatariosDe } = await import("./avisos");
  assert.deepEqual(nuestras((await destinatariosDe("cv")).map((d) => d.id)), [ADMINISTRA]);
  assert.deepEqual(nuestras((await destinatariosDe("contacto")).map((d) => d.id)), [ADMINISTRA, EDITA, CALLADA].sort());
});

test("cada cuenta ve un aviso por cada uno que su rol recibe: los de bandeja prendidos de fábrica, el resumen apagado", sinBase, async () => {
  const { avisosDe, guardarAviso } = await import("./avisos");
  assert.deepEqual(await avisosDe(EDITA, "edita"), [
    { aviso: "contacto", activo: true },
    { aviso: "resumen-semanal", activo: false },
  ]);
  assert.deepEqual(await avisosDe(CALLADA, "administra"), [
    { aviso: "contacto", activo: true },
    { aviso: "cv", activo: false },
    { aviso: "resumen-semanal", activo: false },
  ]);
  await guardarAviso(CALLADA, "cv", true);
  assert.equal((await avisosDe(CALLADA, "administra"))[1]?.activo, true);
  await guardarAviso(CALLADA, "cv", false);
});

test("el aviso sale a cada destinatario con el link a la ficha, y nada de quien escribió", sinBase, async () => {
  const { base } = await import("@/datos/cliente");
  const { avisarMensajeNuevo } = await import("./avisos");
  const { id } = await base.mensaje.create({
    data: { bandeja: "contacto", nombre: "Zoe Secreta", correo: "zoe-secreta@ed.test", mensaje: "un texto confidencial", tema: "Investigación" },
  });
  const enviados: Array<{ para: string; texto: string; html: string }> = [];
  await avisarMensajeNuevo({ id, bandeja: "contacto" }, { mandar: async ({ para, contenido }) => void enviados.push({ para, ...contenido }) });
  const nuestros = enviados.filter((e) => CUENTAS.some((c) => correoDe(c.id) === e.para));
  assert.equal(nuestros.length, 3);
  for (const { texto, html } of nuestros) {
    assert.ok(texto.includes(`/admin/mensajes/contacto/${id}`));
    for (const secreto of ["Zoe", "zoe-secreta", "confidencial"]) {
      assert.ok(!texto.includes(secreto) && !html.includes(secreto), `el aviso lleva «${secreto}»`);
    }
  }
});

test("Ajustes ve cada aviso con las cuentas activas que lo pueden recibir; sin usarAjustes, nada", sinBase, async () => {
  const { avisosDeTodas } = await import("./avisos");
  assert.deepEqual(await avisosDeTodas("edita"), []);
  const [contacto, cv] = await avisosDeTodas("administra");
  const deCv = cv.cuentas.filter((c) => CUENTAS.some((n) => n.id === c.id));
  assert.equal(contacto.aviso, "contacto");
  assert.deepEqual(nuestras(contacto.cuentas.map((c) => c.id)), [ADMINISTRA, EDITA, CALLADA].sort());
  assert.deepEqual(nuestras(deCv.map((c) => c.id)), [ADMINISTRA, CALLADA].sort());
  assert.equal(deCv.find((c) => c.id === CALLADA)?.activo, false);
  assert.ok(!cv.cuentas.some((c) => c.id === SUSPENDIDA), "una cuenta suspendida no aparece");
});

test("poner quién recibe prende las elegidas y apaga las demás que pueden; un id que no puede, no cuenta, y repetirlo no cambia nada", sinBase, async () => {
  const { avisosDe, ponerQuienRecibe } = await import("./avisos");
  // Solo nuestras cuentas: las demás de la base quedan apagadas en esta prueba y se vuelven a prender abajo.
  const { base } = await import("@/datos/cliente");
  const antes = await base.aviso.findMany({ where: { aviso: "cv", cuentaId: { notIn: CUENTAS.map((c) => c.id) } } });
  try {
    const primera = await ponerQuienRecibe("cv", [CALLADA, EDITA]);
    assert.equal(primera.reciben, 1);
    assert.ok(primera.cambiaron >= 2, "prende la callada y apaga la que administra (y las de la base que lo tenían)");
    assert.equal((await avisosDe(CALLADA, "administra"))[1]?.activo, true);
    assert.equal((await avisosDe(ADMINISTRA, "administra"))[1]?.activo, false);
    assert.deepEqual(await avisosDe(EDITA, "edita"), [
      { aviso: "contacto", activo: true },
      { aviso: "resumen-semanal", activo: false },
    ]);
    // Guardar lo mismo otra vez no cambia nada, y la acción no lo anota en la actividad.
    assert.deepEqual(await ponerQuienRecibe("cv", [CALLADA, EDITA]), { reciben: 1, cambiaron: 0 });
  } finally {
    await base.aviso.deleteMany({ where: { aviso: "cv", cuentaId: { notIn: CUENTAS.map((c) => c.id) } } });
    if (antes.length) await base.aviso.createMany({ data: antes });
  }
});

test("el resumen semanal lo recibe solo quien lo prende, aunque su rol lo pueda recibir", sinBase, async () => {
  const { avisosDeTodas, destinatariosDe, guardarAviso, ponerQuienRecibe } = await import("./avisos");
  assert.deepEqual(nuestras((await destinatariosDe("resumen-semanal")).map((d) => d.id)), []);
  await guardarAviso(EDITA, "resumen-semanal", true);
  assert.deepEqual(nuestras((await destinatariosDe("resumen-semanal")).map((d) => d.id)), [EDITA]);
  const resumen = (await avisosDeTodas("administra")).find((a) => a.aviso === "resumen-semanal");
  assert.deepEqual(
    nuestras((resumen?.cuentas ?? []).filter((c) => c.activo).map((c) => c.id)),
    [EDITA],
  );
  // Desde Ajustes, prender a quien administra y apagar a quien edita cambia esas dos, y nada más de las nuestras.
  const { base } = await import("@/datos/cliente");
  const antes = await base.aviso.findMany({ where: { aviso: "resumen-semanal", cuentaId: { notIn: CUENTAS.map((c) => c.id) } } });
  try {
    await ponerQuienRecibe("resumen-semanal", [ADMINISTRA]);
    assert.deepEqual(nuestras((await destinatariosDe("resumen-semanal")).map((d) => d.id)), [ADMINISTRA]);
  } finally {
    await base.aviso.deleteMany({ where: { aviso: "resumen-semanal", cuentaId: { notIn: CUENTAS.map((c) => c.id) } } });
    if (antes.length) await base.aviso.createMany({ data: antes });
  }
});
