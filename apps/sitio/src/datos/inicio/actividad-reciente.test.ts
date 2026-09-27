import { after, test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { config as cargarEntorno } from "dotenv";

// Contra la base de verdad: lo que decide `VA_AL_INICIO` tiene que llegar a
// la consulta. En local la base de los tests es la compartida, así que las
// filas van con la fecha de ahora y se borran en el `finally`, pase lo que
// pase: nada de lo que crea este test queda a la vista en el Inicio de nadie.
cargarEntorno({ path: [".env.local"], quiet: true });
const sinBase = { skip: !process.env.DATABASE_URL && "sin DATABASE_URL" };

after(async () => {
  if (!process.env.DATABASE_URL) return;
  const { base } = await import("@/datos/cliente");
  await base.$disconnect();
});

test("en el Inicio aparece un «publicó» y no un «entró», para cualquier rol", sinBase, async () => {
  const { base } = await import("@/datos/cliente");
  const { actividadReciente } = await import("./actividad-reciente");
  const cuenta = randomUUID();
  await base.user.create({ data: { id: cuenta, name: "Prueba", email: `prueba-${cuenta}@ed.test` } });
  try {
    const publico = await base.actividad.create({ data: { cuentaId: cuenta, tipo: "publico-una-pagina", sobre: "Inicio", sobreId: "inicio" } });
    const entro = await base.actividad.create({ data: { cuentaId: cuenta, tipo: "entro" } });
    for (const rol of ["dirige", "edita"]) {
      // Una ventana amplia: si otros tests anotan a la vez, el «publicó» sigue adentro.
      const ids = (await actividadReciente(rol, 200)).map((e) => e.id);
      assert.ok(ids.includes(publico.id), `${rol} ve el «publicó»`);
      assert.ok(!ids.includes(entro.id), `${rol} no ve el «entró»`);
    }
  } finally {
    await base.actividad.deleteMany({ where: { cuentaId: cuenta } });
    await base.user.delete({ where: { id: cuenta } });
  }
});
