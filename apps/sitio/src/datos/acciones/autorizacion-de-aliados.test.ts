import { after, test } from "node:test";
import assert from "node:assert/strict";
import { config as cargarEntorno } from "dotenv";
import { CAMBIO_DESDE_LA_AUTORIZACION } from "@/features/aliados/contenido/autorizacion";

// La marca «Autorizado» atada al logo, al nombre y al texto del logo que se
// autorizaron (rondas de arreglos 1 y 2 de `work/casos-aliados-fotos/`),
// contra el Postgres local: un test por hueco. **Cada test crea sus propios
// aliados y mide contra ellos** (por id), nunca contra el estado de la tabla:
// los archivos de tests corren a la vez. Se borran al final.

cargarEntorno({ path: [".env.local"], quiet: true });
const sinBase = { skip: !process.env.DATABASE_URL && "sin DATABASE_URL" };

async function modulos() {
  const { base } = await import("@/datos/cliente");
  const editar = await import("./editar-aliados");
  const publicar = await import("./publicar-aliados");
  const autorizar = await import("./autorizar-aliados");
  const consultas = await import("@/datos/consultas/aliados");
  return { base, ...editar, ...publicar, ...autorizar, ...consultas };
}

const foto = (src: string, alt: string) => ({ src, alt, foco: { x: 0.5, y: 0.5 } });
const documento = (nombre: string, src: string, extra: { alt?: string; tamano?: string; url?: string } = {}) => ({
  nombre,
  logo: foto(src, extra.alt ?? nombre),
  tamano: extra.tamano ?? "chico",
  url: extra.url ?? "",
});
const creados: string[] = [];

after(async () => {
  if (!process.env.DATABASE_URL) return;
  const { base } = await modulos();
  await base.aliado.deleteMany({ where: { id: { in: creados } } });
});

/** Un aliado propio, publicado y autorizado con su logo, su nombre y su alt: como uno de los cinco de hoy. */
async function autorizadoPropio(nombre: string, src: string, alt = nombre) {
  const m = await modulos();
  const fila = await m.base.aliado.create({
    data: {
      ...documento(nombre, src, { alt }),
      orden: -1,
      publicado: true,
      publicadoEn: new Date(),
      autorizado: true,
      autorizacion: "La carta de prueba",
      autorizadoLogo: src,
      autorizadoNombre: nombre,
      autorizadoAlt: alt,
    },
  });
  creados.push(fila.id);
  return fila;
}

/** Si la tira del sitio mostraría ese aliado, con y sin la vista previa. */
async function enLaTira(id: string, enVistaPrevia: boolean): Promise<boolean> {
  const m = await modulos();
  const { filas, fotos } = await m.tiraEnBase(m.base);
  return m.aliadosVisibles(filas, fotos, enVistaPrevia).some((a) => a.id === id);
}

/** Quien edita guarda un borrador sobre ese aliado e intenta publicarlo. */
async function guardarYPublicar(id: string, contenido: unknown) {
  const m = await modulos();
  const guardado = await m.guardarAliadoEnBase(m.base, { id, contenido, borradorEnVisto: null, quien: "Eli" });
  if (!guardado.ok) throw new Error(`no se guardó: ${guardado.detalle}`);
  return m.publicarAliadoEnBase(m.base, { id, borradorEnVisto: guardado.borradorEn, quien: "Eli" });
}

test("quien edita le cambia el nombre y el logo a uno autorizado: publicar se niega y la vista previa no lo muestra", sinBase, async () => {
  const fila = await autorizadoPropio("Prueba autorización UNESCO", "/aliados/unesco.png", "UNESCO");
  const r = await guardarYPublicar(fila.id, documento("Ministerio de Educación", "/aliados/bloom.png"));
  assert.deepEqual(r, { ok: false, detalle: CAMBIO_DESDE_LA_AUTORIZACION });
  assert.equal(await enLaTira(fila.id, true), false);
  // Lo publicado, que es lo autorizado, sigue en el sitio.
  assert.equal(await enLaTira(fila.id, false), true);
});

test("quien edita le cambia solo el texto del logo: publicar se niega y la vista previa no lo muestra", sinBase, async () => {
  // El escenario de r2: el mismo logo y el mismo nombre, con otro alt.
  const fila = await autorizadoPropio("Prueba autorización alt", "/aliados/unesco.png", "UNESCO");
  const r = await guardarYPublicar(fila.id, documento("Prueba autorización alt", "/aliados/unesco.png", { alt: "Ministerio de Educación de Chile" }));
  assert.deepEqual(r, { ok: false, detalle: CAMBIO_DESDE_LA_AUTORIZACION });
  assert.equal(await enLaTira(fila.id, true), false);
  assert.equal(await enLaTira(fila.id, false), true);
  // Lo publicado no cambió: el alt sigue siendo el autorizado.
  const { base } = await modulos();
  assert.deepEqual((await base.aliado.findUniqueOrThrow({ where: { id: fila.id } })).logo, foto("/aliados/unesco.png", "UNESCO"));
});

test("columnas publicadas con otro logo o con otro alt que los autorizados, escritas directo en la base: el sitio no lo muestra", sinBase, async () => {
  const m = await modulos();
  const conOtroLogo = await autorizadoPropio("Prueba autorización directa", "/aliados/bloom.png");
  await m.base.aliado.update({ where: { id: conOtroLogo.id }, data: { autorizadoLogo: "/aliados/ucsh.png" } });
  const conOtroAlt = await autorizadoPropio("Prueba autorización directa alt", "/aliados/bloom.png");
  await m.base.aliado.update({ where: { id: conOtroAlt.id }, data: { logo: foto("/aliados/bloom.png", "Ministerio de Educación de Chile") } });
  for (const enVistaPrevia of [false, true]) {
    assert.equal(await enLaTira(conOtroLogo.id, enVistaPrevia), false, `logo, ${enVistaPrevia}`);
    assert.equal(await enLaTira(conOtroAlt.id, enVistaPrevia), false, `alt, ${enVistaPrevia}`);
  }
  // Con lo autorizado, sí.
  await m.base.aliado.update({ where: { id: conOtroLogo.id }, data: { autorizadoLogo: "/aliados/bloom.png" } });
  assert.equal(await enLaTira(conOtroLogo.id, false), true);
});

test("autorizar guarda el logo, el nombre y el alt del borrador, no autoriza lo que no se vio, y cambiar solo la URL o el tamaño sigue publicándose", sinBase, async () => {
  const m = await modulos();
  const nombre = "Prueba autorización ciclo";
  const fila = await m.base.aliado.create({ data: { orden: -1, borrador: documento(nombre, "/aliados/science-up.png", { alt: "Science Up" }), borradorEn: new Date() } });
  creados.push(fila.id);
  const pedido = { id: fila.id, autorizado: true, nota: "La carta de prueba", rol: "administra", quien: "Ana" };

  const otroAlt = await m.autorizarAliadoEnBase(m.base, { ...pedido, visto: { logo: "/aliados/science-up.png", nombre, alt: "Otro texto" } });
  assert.match(!otroAlt.ok ? otroAlt.detalle : "", /Lo guardado cambió mientras lo mirabas/);
  const marcado = await m.autorizarAliadoEnBase(m.base, { ...pedido, visto: { logo: "/aliados/science-up.png", nombre, alt: "Science Up" } });
  assert.equal(marcado.ok && marcado.cambio, true);
  const autorizada = await m.base.aliado.findUniqueOrThrow({ where: { id: fila.id } });
  assert.deepEqual([autorizada.autorizadoLogo, autorizada.autorizadoNombre, autorizada.autorizadoAlt], ["/aliados/science-up.png", nombre, "Science Up"]);

  const primera = await m.publicarAliadoEnBase(m.base, { id: fila.id, borradorEnVisto: autorizada.borradorEn?.toISOString() ?? null, quien: "Ana" });
  assert.equal(primera.ok, true);
  // Otra URL y otro tamaño: la marca sigue valiendo.
  const r = await guardarYPublicar(fila.id, documento(nombre, "/aliados/science-up.png", { alt: "Science Up", tamano: "grande", url: "https://prueba.org" }));
  assert.equal(r.ok, true);
  assert.equal(await enLaTira(fila.id, false), true);

  // Quitar la marca vacía lo que se autorizó.
  assert.equal((await m.autorizarAliadoEnBase(m.base, { ...pedido, autorizado: false, rol: "dirige" })).ok, true);
  const quitada = await m.base.aliado.findUniqueOrThrow({ where: { id: fila.id } });
  assert.deepEqual([quitada.autorizado, quitada.autorizadoLogo, quitada.autorizadoNombre, quitada.autorizadoAlt], [false, null, null, null]);
});
