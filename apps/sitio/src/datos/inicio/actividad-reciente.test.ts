import { after, test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { config as cargarEntorno } from "dotenv";

// Contra la base de verdad: lo que decide `VA_AL_INICIO` tiene que llegar a
// la consulta. Las filas van fechadas en el futuro para quedar primeras
// aunque otros tests escriban en la tabla a la vez.
cargarEntorno({ path: [".env.local"], quiet: true });
const sinBase = { skip: !process.env.DATABASE_URL && "sin DATABASE_URL" };

let cuenta: string | null = null;

after(async () => {
  if (!process.env.DATABASE_URL || !cuenta) return;
  const { base } = await import("@/datos/cliente");
  await base.actividad.deleteMany({ where: { cuentaId: cuenta } });
  await base.user.delete({ where: { id: cuenta } });
  await base.$disconnect();
});

test("en el Inicio aparece un «publicó» y no un «entró», para cualquier rol", sinBase, async () => {
  const { base } = await import("@/datos/cliente");
  const { actividadReciente } = await import("./actividad-reciente");
  cuenta = randomUUID();
  await base.user.create({ data: { id: cuenta, name: "Prueba", email: `prueba-${cuenta}@ed.test` } });
  const entro = await base.actividad.create({ data: { cuentaId: cuenta, tipo: "entro", en: new Date("2999-01-02T00:00:00Z") } });
  const publico = await base.actividad.create({
    data: { cuentaId: cuenta, tipo: "publico-una-pagina", sobre: "Inicio", sobreId: "inicio", en: new Date("2999-01-01T00:00:00Z") },
  });
  for (const rol of ["dirige", "edita"]) {
    const ids = (await actividadReciente(rol)).map((e) => e.id);
    assert.ok(ids.includes(publico.id), `${rol} ve el «publicó»`);
    assert.ok(!ids.includes(entro.id), `${rol} no ve el «entró»`);
  }
});
