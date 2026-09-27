import { test } from "node:test";
import assert from "node:assert/strict";
import { config as cargarEntorno } from "dotenv";
import { filaDeBorradoresViejos, novedadesEnBorradorViejas } from "./de-las-novedades";
import { PENDIENTES } from "./pendientes";
import { enOrden, visiblesPara } from "./registro";

// Lo que Novedades le suma al Inicio: el pendiente de los borradores que nadie
// toca, cómo se dice y quién lo ve.
cargarEntorno({ path: [".env.local"], quiet: true });
const sinBase = { skip: !process.env.DATABASE_URL && "sin DATABASE_URL" };

test("la fila aparece con algo y se dice con los títulos", () => {
  assert.equal(filaDeBorradoresViejos([]), null);
  assert.deepEqual(filaDeBorradoresViejos(["Una"]), { titulo: "1 novedad en borrador hace más de 7 días", detalle: "«Una»" });
  assert.equal(filaDeBorradoresViejos(["Una", "Otra"])?.detalle, "«Una» y «Otra»");
});

test("la ven los tres roles, que editan novedades", () => {
  for (const rol of ["dirige", "administra", "edita"]) {
    assert.ok(visiblesPara(enOrden(PENDIENTES), rol).some((p) => p.clave === "novedades-en-borrador"), rol);
  }
});

test("cuenta los borradores quietos hace más de 7 días, y no los recientes", sinBase, async () => {
  const { base } = await import("@/datos/cliente");
  const dias = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);
  const vieja = await base.novedad.create({ data: { borrador: { titulo: "Prueba inicio vieja", slug: "" }, borradorEn: dias(8) } });
  const nueva = await base.novedad.create({ data: { borrador: { titulo: "Prueba inicio nueva", slug: "" }, borradorEn: dias(2) } });
  try {
    const fila = await novedadesEnBorradorViejas();
    assert.match(fila?.detalle ?? "", /«Prueba inicio vieja»/);
    assert.doesNotMatch(fila?.detalle ?? "", /Prueba inicio nueva/);
  } finally {
    await base.novedad.deleteMany({ where: { id: { in: [vieja.id, nueva.id] } } });
  }
});
