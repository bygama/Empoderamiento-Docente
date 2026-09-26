import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { config as cargarEntorno } from "dotenv";

cargarEntorno({ path: [".env.local"], quiet: true });
const hayBase = Boolean(process.env.DATABASE_URL);
const sinBase = { skip: !hayBase && "sin DATABASE_URL" };

// Tres cuentas de prueba: una que administra, una que edita y una que
// administra pero apagó el aviso de CV. Solo se miran las suyas: la base
// puede tener otras.
const CUENTAS = [
  { id: randomUUID(), rol: "administra" },
  { id: randomUUID(), rol: "edita" },
  { id: randomUUID(), rol: "administra" },
];
const [ADMINISTRA, EDITA, CALLADA] = CUENTAS.map((c) => c.id);
const nuestras = (ids: string[]) => ids.filter((id) => CUENTAS.some((c) => c.id === id)).sort();
const correoDe = (id: string) => `prueba-${id}@ed.test`;

before(async () => {
  if (!hayBase) return;
  const { base } = await import("@/datos/cliente");
  await base.user.createMany({ data: CUENTAS.map(({ id, rol }) => ({ id, rol, name: `Prueba ${rol}`, email: correoDe(id) })) });
  await base.aviso.create({ data: { cuentaId: CALLADA, aviso: "cv", activo: false } });
});

after(async () => {
  if (!hayBase) return;
  const { base } = await import("@/datos/cliente");
  await base.mensaje.deleteMany({ where: { correo: "zoe-secreta@ed.test" } });
  await base.user.deleteMany({ where: { id: { in: CUENTAS.map((c) => c.id) } } });
  await base.$disconnect();
});

test("reciben las cuentas cuyo rol ve la bandeja y no apagaron su aviso", sinBase, async () => {
  const { destinatariosDe } = await import("./avisos");
  assert.deepEqual(nuestras((await destinatariosDe("cv")).map((d) => d.id)), [ADMINISTRA]);
  assert.deepEqual(nuestras((await destinatariosDe("contacto")).map((d) => d.id)), [ADMINISTRA, EDITA, CALLADA].sort());
});

test("cada cuenta ve un aviso por bandeja que su rol ve, activado de fábrica", sinBase, async () => {
  const { avisosDe, guardarAviso } = await import("./avisos");
  assert.deepEqual(await avisosDe(EDITA, "edita"), [{ bandeja: "contacto", activo: true }]);
  assert.deepEqual(await avisosDe(CALLADA, "administra"), [
    { bandeja: "contacto", activo: true },
    { bandeja: "cv", activo: false },
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
