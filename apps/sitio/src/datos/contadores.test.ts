import { after, test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { config as cargarEntorno } from "dotenv";
import { fechaUTC } from "@/lib/metricas/periodos";

cargarEntorno({ path: [".env.local"], quiet: true });
const hayBase = Boolean(process.env.DATABASE_URL);
const sinBase = { skip: !hayBase && "sin DATABASE_URL" };

// Una clave propia y días de 2001: nada de esto se cruza con datos de verdad.
const clave = `prueba-${randomUUID()}`;
const DIA = new Date("2001-05-10T15:00:00.000Z");

after(async () => {
  if (!hayBase) return;
  const { base } = await import("@/datos/cliente");
  await base.contador.deleteMany({ where: { clave } });
  await base.$disconnect();
});

test("diez eventos a la vez suman diez, sin perder ninguno", sinBase, async () => {
  const { base } = await import("@/datos/cliente");
  const { sumarContador } = await import("./contadores");
  await Promise.all(Array.from({ length: 10 }, () => sumarContador({ evento: "cv-envio", canal: "redes", clave, ahora: DIA })));
  const fila = await base.contador.findUnique({ where: { fecha_evento_canal_clave: { fecha: fechaUTC("2001-05-10"), evento: "cv-envio", canal: "redes", clave } } });
  assert.equal(fila?.cuenta, 10);
});

test("un evento sin canal guarda el canal vacío aunque le llegue uno", sinBase, async () => {
  const { base } = await import("@/datos/cliente");
  const { sumarContador } = await import("./contadores");
  await sumarContador({ evento: "material-consultado", canal: "buscador", clave, ahora: DIA });
  const filas = await base.contador.findMany({ where: { clave, evento: "material-consultado" } });
  assert.deepEqual(
    filas.map((f) => [f.canal, f.cuenta]),
    [["", 1]],
  );
});

test("las sumas de un período juntan los días y respetan los bordes", sinBase, async () => {
  const { sumarContador, sumasDe, totalDe } = await import("./contadores");
  await sumarContador({ evento: "cv-envio", canal: "redes", clave, ahora: new Date("2001-05-11T02:00:00.000Z") });
  await sumarContador({ evento: "cv-envio", canal: "directo", clave, ahora: new Date("2001-05-12T02:00:00.000Z") });
  const sumas = (await sumasDe({ eventos: ["cv-envio"], desde: "2001-05-10", hasta: "2001-05-11" })).filter((s) => s.clave === clave);
  assert.deepEqual(sumas, [{ evento: "cv-envio", canal: "redes", clave, cuenta: 11 }]);
  assert.equal(totalDe(sumas, "cv-envio"), 11);
  assert.equal(totalDe(sumas, "cv-vio"), 0);
});
