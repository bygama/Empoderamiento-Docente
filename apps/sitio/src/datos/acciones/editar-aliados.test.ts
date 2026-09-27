import { after, test } from "node:test";
import assert from "node:assert/strict";
import { config as cargarEntorno } from "dotenv";
import { SIN_PERMISO } from "@ed/auth";

// El ciclo de un aliado y su marca contra el Postgres local. **El test crea
// sus propios aliados y mide contra ellos**, nunca contra el estado de la
// tabla: los archivos de tests corren a la vez y otros suman o borran aliados
// en el medio (ronda de arreglos 2, DECISIONS). El lugar en la tira se mira
// como el orden de los dos que crea; la punta, con `unPasoMovido` (lib/orden.ts),
// que es pura.

cargarEntorno({ path: [".env.local"], quiet: true });
const sinBase = { skip: !process.env.DATABASE_URL && "sin DATABASE_URL" };

async function modulos() {
  const { base } = await import("@/datos/cliente");
  const editar = await import("./editar-aliados");
  const publicar = await import("./publicar-aliados");
  const autorizar = await import("./autorizar-aliados");
  return { base, ...editar, ...publicar, ...autorizar };
}

const aliado = (nombre: string) => ({ nombre, logo: { src: "/aliados/unesco.png", alt: nombre, foco: { x: 0.5, y: 0.5 } }, tamano: "chico", url: "" });
const creados: string[] = [];

after(async () => {
  if (!process.env.DATABASE_URL) return;
  const { base } = await modulos();
  await base.aliado.deleteMany({ where: { id: { in: creados } } });
});

test("crear, que sin la marca no se publique, que quien edita no la ponga, y el ciclo entero", sinBase, async () => {
  const m = await modulos();
  const primero = await m.crearAliadoEnBase(m.base, { contenido: aliado("Prueba aliado primero"), quien: "Ana" });
  const creado = await m.crearAliadoEnBase(m.base, { contenido: aliado("Prueba aliado"), quien: "Ana" });
  assert.equal(primero.ok && creado.ok, true);
  if (!primero.ok || !creado.ok) return;
  creados.push(primero.id, creado.id);
  // El orden de los dos que creó el test: crear pone al nuevo después del anterior.
  const orden = async () => {
    const filas = await m.base.aliado.findMany({ where: { id: { in: [primero.id, creado.id] } }, orderBy: [{ orden: "asc" }, { creadoEn: "asc" }], select: { id: true } });
    return filas.map((f) => (f.id === creado.id ? "creado" : "primero"));
  };
  const fila = await m.base.aliado.findUniqueOrThrow({ where: { id: creado.id } });
  assert.deepEqual([fila.autorizado, fila.publicado], [false, false]);
  assert.deepEqual(await orden(), ["primero", "creado"]);

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

  // Moverlo antes y volverlo: pasa delante del que se creó antes, y vuelve atrás.
  assert.deepEqual(await m.moverAliadoEnBase(m.base, { id: creado.id, hacia: "antes" }), { ok: true, movio: true });
  assert.deepEqual(await orden(), ["creado", "primero"]);
  assert.deepEqual(await m.moverAliadoEnBase(m.base, { id: creado.id, hacia: "despues" }), { ok: true, movio: true });
  assert.deepEqual(await orden(), ["primero", "creado"]);

  // Quitar la marca lo saca de la tira aunque siga publicado; despublicar y borrar.
  const quitada = await m.autorizarAliadoEnBase(m.base, { id: creado.id, autorizado: false, nota: "", rol: "dirige", quien: "Ana" });
  assert.equal(quitada.ok && quitada.cambio, true);
  assert.equal((await m.despublicarAliadoEnBase(m.base, { id: creado.id, borradorEnVisto: null })).ok, true);
  const borrado = await m.borrarAliadoEnBase(m.base, { id: creado.id, borradorEnVisto: null });
  assert.deepEqual(borrado, { ok: true, nombre: "Prueba aliado", estabaEnElSitio: false });
  assert.equal(await m.base.aliado.count({ where: { id: creado.id } }), 0);
});
