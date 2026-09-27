import { after, test } from "node:test";
import assert from "node:assert/strict";
import { config as cargarEntorno } from "dotenv";
import { SIN_PERMISO } from "@ed/auth";

// El ciclo de un aliado y su marca contra el Postgres local. El de prueba se
// llama «Prueba aliado» y se borra al final; mover lo lleva y lo trae, así los
// cinco de verdad quedan en su orden.

cargarEntorno({ path: [".env.local"], quiet: true });
const sinBase = { skip: !process.env.DATABASE_URL && "sin DATABASE_URL" };

async function modulos() {
  const { base } = await import("@/datos/cliente");
  const editar = await import("./editar-aliados");
  const publicar = await import("./publicar-aliados");
  const autorizar = await import("./autorizar-aliados");
  return { base, ...editar, ...publicar, ...autorizar };
}

const aliado = { nombre: "Prueba aliado", logo: { src: "/aliados/unesco.png", alt: "Prueba aliado", foco: { x: 0.5, y: 0.5 } }, tamano: "chico", url: "" };

after(async () => {
  if (!process.env.DATABASE_URL) return;
  const { base } = await modulos();
  await base.aliado.deleteMany({ where: { OR: [{ nombre: "Prueba aliado" }, { borrador: { path: ["nombre"], equals: "Prueba aliado" } }] } });
});

test("crear, que sin la marca no se publique, que quien edita no la ponga, y el ciclo entero", sinBase, async () => {
  const m = await modulos();
  const creado = await m.crearAliadoEnBase(m.base, { contenido: aliado, quien: "Ana" });
  assert.equal(creado.ok, true);
  if (!creado.ok) return;
  const fila = await m.base.aliado.findUniqueOrThrow({ where: { id: creado.id } });
  assert.deepEqual([fila.autorizado, fila.publicado, fila.orden], [false, false, 6]);

  // Sin la marca no se publica, ni con un borrador completo.
  const sinMarca = await m.publicarAliadoEnBase(m.base, { id: creado.id, borradorEnVisto: creado.borradorEn, quien: "Ana" });
  assert.match(!sinMarca.ok ? sinMarca.detalle : "", /Sin la autorización, el logo no se publica/);
  // Quien edita no la pone, aunque llegue hasta acá; quien administra, sin nota, tampoco.
  assert.deepEqual(await m.autorizarAliadoEnBase(m.base, { id: creado.id, autorizado: true, nota: "La carta", rol: "edita", quien: "Eli" }), { ok: false, detalle: SIN_PERMISO });
  assert.equal((await m.autorizarAliadoEnBase(m.base, { id: creado.id, autorizado: true, nota: " ", rol: "administra", quien: "Ana" })).ok, false);
  const marcado = await m.autorizarAliadoEnBase(m.base, { id: creado.id, autorizado: true, nota: "La carta del 1 de octubre", rol: "administra", quien: "Ana" });
  assert.equal(marcado.ok && marcado.cambio, true);

  // Con la marca se publica: lo publicado pasa a columnas.
  const publicado = await m.publicarAliadoEnBase(m.base, { id: creado.id, borradorEnVisto: creado.borradorEn, quien: "Ana" });
  assert.equal(publicado.ok, true);
  const despues = await m.base.aliado.findUniqueOrThrow({ where: { id: creado.id } });
  assert.deepEqual([despues.publicado, despues.nombre, despues.borrador, despues.autorizadoPor], [true, "Prueba aliado", null, "Ana"]);

  // Moverlo antes y volverlo: la tira queda como estaba.
  assert.deepEqual(await m.moverAliadoEnBase(m.base, { id: creado.id, hacia: "antes" }), { ok: true, movio: true });
  assert.equal((await m.base.aliado.findUniqueOrThrow({ where: { id: creado.id } })).orden, 5);
  assert.deepEqual(await m.moverAliadoEnBase(m.base, { id: creado.id, hacia: "despues" }), { ok: true, movio: true });
  assert.deepEqual(await m.moverAliadoEnBase(m.base, { id: creado.id, hacia: "despues" }), { ok: true, movio: false });

  // Quitar la marca lo saca de la tira aunque siga publicado; despublicar y borrar.
  const quitada = await m.autorizarAliadoEnBase(m.base, { id: creado.id, autorizado: false, nota: "", rol: "dirige", quien: "Ana" });
  assert.equal(quitada.ok && quitada.cambio, true);
  assert.equal((await m.despublicarAliadoEnBase(m.base, { id: creado.id, borradorEnVisto: null })).ok, true);
  const borrado = await m.borrarAliadoEnBase(m.base, { id: creado.id, borradorEnVisto: null });
  assert.deepEqual(borrado, { ok: true, nombre: "Prueba aliado", estabaEnElSitio: false });
  const ordenes = (await m.base.aliado.findMany({ orderBy: { orden: "asc" }, select: { nombre: true, orden: true } })).map((a) => `${a.orden}:${a.nombre}`);
  assert.deepEqual(ordenes, ["1:UNESCO", "2:Techint", "3:Bloom", "4:UCSH", "5:Science Up"]);
});
