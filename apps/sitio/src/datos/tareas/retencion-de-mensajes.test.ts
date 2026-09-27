import { after, test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { config as cargarEntorno } from "dotenv";

cargarEntorno({ path: [".env.local"], quiet: true });
const hayBase = Boolean(process.env.DATABASE_URL);
const sinBase = { skip: !hayBase && "sin DATABASE_URL" };

// Un «hoy» de 2001, como la poda de la actividad: los bordes caen en 1999 y
// 2000, y la retención no alcanza ninguna fila de verdad, solo las de acá.
const HOY = new Date("2001-01-15T12:00:00.000Z");
const correo = `prueba-${randomUUID()}@ed.test`;
const carpetas: string[] = [];
const empezo = new Date();
const fecha = (iso: string) => new Date(`${iso}T00:00:00.000Z`);

after(async () => {
  if (!hayBase) return;
  const { base } = await import("@/datos/cliente");
  await base.mensaje.deleteMany({ where: { correo } });
  await base.corridaDeTarea.deleteMany({ where: { tarea: { in: ["retencion-de-contacto", "retencion-de-cv"] }, corridaEn: { gte: empezo } } });
  for (const c of carpetas) await rm(c, { recursive: true, force: true });
  await base.$disconnect();
});

test("Contacto: se va lo de más de 24 meses y el spam de más de 30 días, queda lo demás", sinBase, async () => {
  const { base } = await import("@/datos/cliente");
  const { retenerContacto } = await import("./retencion-de-mensajes");
  const fila = (nombre: string, recibido: string, estado = "nuevo", marcado = recibido) =>
    ({ bandeja: "contacto", nombre, correo, estado, recibidoEn: fecha(recibido), estadoEn: fecha(marcado) });
  await base.mensaje.createMany({
    data: [
      fila("vieja", "1999-01-01"),
      fila("queda", "1999-06-01", "cerrado"),
      fila("spam-viejo", "2000-10-01", "spam", "2000-12-01"),
      fila("spam-nuevo", "2000-10-01", "spam", "2001-01-10"),
    ],
  });
  const r = await retenerContacto(HOY);
  assert.deepEqual(r, { ok: true, detalle: "Se borraron 2 mensajes de Contacto: 1 de más de 24 meses y 1 de spam de más de 30 días." });
  const quedan = await base.mensaje.findMany({ where: { correo, bandeja: "contacto" }, select: { nombre: true }, orderBy: { nombre: "asc" } });
  assert.deepEqual(quedan.map((q) => q.nombre), ["queda", "spam-nuevo"]);
});

test("CV: el vencido se va con su archivo; el que no, se queda, y la corrida queda registrada", sinBase, async () => {
  const { base } = await import("@/datos/cliente");
  const { almacenPrivadoEnDisco } = await import("@/lib/formularios/almacen-privado");
  const { correrTareas } = await import("@/lib/tareas/corredor");
  const { registrarCorrida } = await import("./corridas");
  const { TAREAS_DIARIAS } = await import("./diarias");
  const { retencionDeCV, retenerCV } = await import("./retencion-de-mensajes");
  assert.ok(TAREAS_DIARIAS.includes(retencionDeCV), "la retención de CV no está en las tareas del cron diario");

  const carpeta = await mkdtemp(path.join(tmpdir(), "ed-retencion-"));
  carpetas.push(carpeta);
  const almacen = almacenPrivadoEnDisco(carpeta);
  const [vencido, vigente] = [randomUUID(), randomUUID()];
  for (const id of [vencido, vigente]) await almacen.guardar(`cv/${id}.pdf`, new TextEncoder().encode("%PDF-1.7"), "application/pdf");
  await base.mensaje.createMany({
    data: [
      { id: vencido, bandeja: "cv", nombre: "vencido", correo, archivo: `cv/${vencido}.pdf`, recibidoEn: fecha("1999-12-01") },
      { id: vigente, bandeja: "cv", nombre: "vigente", correo, archivo: `cv/${vigente}.pdf`, recibidoEn: fecha("2000-06-01") },
    ],
  });

  const [corrida] = await correrTareas([{ ...retencionDeCV, correr: () => retenerCV(HOY, () => almacen) }], { registrar: registrarCorrida, limiteMs: 10_000 });
  assert.deepEqual(corrida, { clave: "retencion-de-cv", ok: true, detalle: "Se borró 1 CV con su archivo." });
  assert.equal(await almacen.leer(`cv/${vencido}.pdf`), null);
  assert.notEqual(await almacen.leer(`cv/${vigente}.pdf`), null);
  assert.deepEqual((await base.mensaje.findMany({ where: { correo, bandeja: "cv" } })).map((m) => m.nombre), ["vigente"]);
  const registrada = await base.corridaDeTarea.findFirst({ where: { tarea: "retencion-de-cv", corridaEn: { gte: empezo } } });
  assert.equal(registrada?.detalle, "Se borró 1 CV con su archivo.");
});
