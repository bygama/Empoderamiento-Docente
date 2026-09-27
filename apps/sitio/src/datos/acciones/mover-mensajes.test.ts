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

const cuenta = randomUUID();
const correo = `prueba-${randomUUID()}@ed.test`;
const carpetas: string[] = [];

after(async () => {
  if (!hayBase) return;
  const { base } = await import("@/datos/cliente");
  await base.mensaje.deleteMany({ where: { correo } });
  await base.actividad.deleteMany({ where: { cuentaId: cuenta } });
  await base.user.deleteMany({ where: { id: cuenta } });
  for (const c of carpetas) await rm(c, { recursive: true, force: true });
  await base.$disconnect();
});

async function preparar() {
  const { base } = await import("@/datos/cliente");
  if (!(await base.user.findUnique({ where: { id: cuenta } }))) {
    // Administra no existe sin el segundo factor (el CHECK de la base).
    await base.user.create({ data: { id: cuenta, name: "Prueba", email: `cuenta-${cuenta}@ed.test`, rol: "administra", twoFactorEnabled: true } });
  }
  return base;
}

const actividadDe = async (id?: string) => {
  const { base } = await import("@/datos/cliente");
  return base.actividad.findMany({ where: { cuentaId: cuenta, ...(id ? { sobreId: id } : {}) }, orderBy: { en: "asc" }, select: { tipo: true, sobre: true, sobreId: true } });
};

test("tomar, cerrar, marcar y volver a tomar un contacto, con su actividad por el tema", sinBase, async () => {
  const base = await preparar();
  const { moverMensaje } = await import("./mover-mensajes");
  const { id } = await base.mensaje.create({ data: { bandeja: "contacto", nombre: "Zoe", correo, tema: "Investigación", mensaje: "hola" } });
  const cual = { bandeja: "contacto" as const, id };

  assert.equal((await moverMensaje(cuenta, cual, "tomar")).ok, true);
  const tomado = await base.mensaje.findUniqueOrThrow({ where: { id } });
  assert.equal(tomado.estado, "en-curso");
  assert.equal(tomado.tomadoPorId, cuenta);
  assert.equal((await moverMensaje(cuenta, cual, "cerrar")).ok, true);
  assert.match((await moverMensaje(cuenta, cual, "cerrar")).detalle, /cambió mientras lo mirabas/);
  assert.equal((await moverMensaje(cuenta, cual, "spam")).ok, true);
  assert.equal((await moverMensaje(cuenta, cual, "tomar")).ok, true);

  assert.deepEqual(
    (await actividadDe(id)).map((a) => [a.tipo, a.sobre]),
    [
      ["tomo-un-mensaje", "Investigación"],
      ["cerro-un-mensaje", "Investigación"],
      ["marco-un-mensaje-como-spam", "Investigación"],
      ["tomo-un-mensaje", "Investigación"],
    ],
  );
});

test("una bandeja que no es la del mensaje no lo encuentra", sinBase, async () => {
  const base = await preparar();
  const { moverMensaje } = await import("./mover-mensajes");
  const { id } = await base.mensaje.create({ data: { bandeja: "contacto", nombre: "Zoe", correo } });
  assert.match((await moverMensaje(cuenta, { bandeja: "cv", id }, "tomar")).detalle, /ya no está/);
  assert.equal((await base.mensaje.findUniqueOrThrow({ where: { id } })).estado, "nuevo");
});

test("de un CV no se anota tomarlo; borrarlo se lleva el archivo y deja solo que se borró", sinBase, async () => {
  const base = await preparar();
  const { almacenPrivadoEnDisco } = await import("@/lib/formularios/almacen-privado");
  const { borrarMensajeEnBase, moverMensaje } = await import("./mover-mensajes");
  const carpeta = await mkdtemp(path.join(tmpdir(), "ed-cv-"));
  carpetas.push(carpeta);
  const almacen = almacenPrivadoEnDisco(carpeta);
  const id = randomUUID();
  const archivo = `cv/${id}.pdf`;
  await almacen.guardar(archivo, new TextEncoder().encode("%PDF-1.7"), "application/pdf");
  await base.mensaje.create({ data: { id, bandeja: "cv", nombre: "Zoe", correo, archivo, archivoBytes: 8 } });

  assert.equal((await moverMensaje(cuenta, { bandeja: "cv", id }, "tomar")).ok, true);
  assert.deepEqual(await actividadDe(id), []);
  assert.equal((await borrarMensajeEnBase(cuenta, { bandeja: "cv", id }, () => almacen)).ok, true);
  assert.equal(await almacen.leer(archivo), null);
  assert.equal(await base.mensaje.findUnique({ where: { id } }), null);
  const borrado = (await actividadDe()).filter((a) => a.tipo === "borro-un-cv");
  assert.deepEqual(borrado, [{ tipo: "borro-un-cv", sobre: null, sobreId: null }]);
});
