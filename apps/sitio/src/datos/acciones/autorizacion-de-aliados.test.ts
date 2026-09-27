import { after, test } from "node:test";
import assert from "node:assert/strict";
import { config as cargarEntorno } from "dotenv";
import { CAMBIO_DESDE_LA_AUTORIZACION } from "@/features/aliados/contenido/autorizacion";

// La marca «Autorizado» atada al logo y al nombre que se autorizaron
// (ronda de arreglos 1 de `work/casos-aliados-fotos/`), contra el Postgres
// local: un test por hueco. Lo de prueba se llama «Prueba autorización…» y va
// al principio de la tira (orden negativo), lejos del final, donde
// `editar-aliados.test.ts` mueve el suyo; UNESCO vuelve a quedar como estaba.

cargarEntorno({ path: [".env.local"], quiet: true });
const sinBase = { skip: !process.env.DATABASE_URL && "sin DATABASE_URL" };

async function modulos() {
  const { base } = await import("@/datos/cliente");
  const { Prisma } = await import("@/../prisma/generado/client");
  const editar = await import("./editar-aliados");
  const publicar = await import("./publicar-aliados");
  const autorizar = await import("./autorizar-aliados");
  const consultas = await import("@/datos/consultas/aliados");
  return { base, Prisma, ...editar, ...publicar, ...autorizar, ...consultas };
}

const foto = (src: string, alt: string) => ({ src, alt, foco: { x: 0.5, y: 0.5 } });
const documento = (nombre: string, src: string, extra: { tamano?: string; url?: string } = {}) => ({ nombre, logo: foto(src, nombre), tamano: "chico", url: "", ...extra });
const PRUEBA = "Prueba autorización";

after(async () => {
  if (!process.env.DATABASE_URL) return;
  const { base } = await modulos();
  await base.aliado.deleteMany({ where: { OR: [{ nombre: { startsWith: PRUEBA } }, { borrador: { path: ["nombre"], string_starts_with: PRUEBA } }] } });
});

/** Los ids que la tira del sitio mostraría, con y sin la vista previa. */
async function enLaTira(enVistaPrevia: boolean): Promise<string[]> {
  const m = await modulos();
  const { filas, fotos } = await m.tiraEnBase(m.base);
  return m.aliadosVisibles(filas, fotos, enVistaPrevia).map((a) => a.id);
}

test("quien edita le cambia a UNESCO el nombre y el logo: publicar se niega y la vista previa no lo muestra", sinBase, async () => {
  const m = await modulos();
  const unesco = await m.base.aliado.findFirstOrThrow({ where: { nombre: "UNESCO" } });
  try {
    const guardado = await m.guardarAliadoEnBase(m.base, {
      id: unesco.id,
      contenido: documento("Ministerio de Educación", "/aliados/bloom.png"),
      borradorEnVisto: unesco.borradorEn?.toISOString() ?? null,
      quien: "Eli",
    });
    assert.equal(guardado.ok, true);
    if (!guardado.ok) return;
    assert.deepEqual(await m.publicarAliadoEnBase(m.base, { id: unesco.id, borradorEnVisto: guardado.borradorEn, quien: "Eli" }), { ok: false, detalle: CAMBIO_DESDE_LA_AUTORIZACION });
    assert.equal((await enLaTira(true)).includes(unesco.id), false);
    // Lo publicado, que es lo autorizado, sigue en el sitio.
    assert.equal((await enLaTira(false)).includes(unesco.id), true);
  } finally {
    await m.base.aliado.update({
      where: { id: unesco.id },
      data: { borrador: unesco.borrador ?? m.Prisma.DbNull, borradorEn: unesco.borradorEn, borradorPor: unesco.borradorPor },
    });
  }
});

test("columnas publicadas con otro logo que el autorizado, escritas directo en la base: el sitio no lo muestra", sinBase, async () => {
  const m = await modulos();
  const fila = await m.base.aliado.create({
    data: { ...documento(`${PRUEBA} directa`, "/aliados/bloom.png"), orden: -2, publicado: true, autorizado: true, autorizadoLogo: "/aliados/ucsh.png", autorizadoNombre: `${PRUEBA} directa` },
  });
  for (const enVistaPrevia of [false, true]) assert.equal((await enLaTira(enVistaPrevia)).includes(fila.id), false, String(enVistaPrevia));
  // Con el logo autorizado, sí.
  await m.base.aliado.update({ where: { id: fila.id }, data: { autorizadoLogo: "/aliados/bloom.png" } });
  assert.equal((await enLaTira(false)).includes(fila.id), true);
});

test("autorizar guarda el logo y el nombre del borrador, no autoriza lo que no se vio, y cambiar solo la URL o el tamaño sigue publicándose", sinBase, async () => {
  const m = await modulos();
  const nombre = `${PRUEBA} ciclo`;
  const fila = await m.base.aliado.create({ data: { orden: -1, borrador: documento(nombre, "/aliados/science-up.png"), borradorEn: new Date() } });
  const pedido = { id: fila.id, autorizado: true, nota: "La carta de prueba", rol: "administra", quien: "Ana" };

  const noVisto = await m.autorizarAliadoEnBase(m.base, { ...pedido, visto: { logo: "/aliados/bloom.png", nombre } });
  assert.match(!noVisto.ok ? noVisto.detalle : "", /Lo guardado cambió mientras lo mirabas/);
  const marcado = await m.autorizarAliadoEnBase(m.base, { ...pedido, visto: { logo: "/aliados/science-up.png", nombre } });
  assert.equal(marcado.ok && marcado.cambio, true);
  const autorizada = await m.base.aliado.findUniqueOrThrow({ where: { id: fila.id } });
  assert.deepEqual([autorizada.autorizadoLogo, autorizada.autorizadoNombre], ["/aliados/science-up.png", nombre]);

  const primera = await m.publicarAliadoEnBase(m.base, { id: fila.id, borradorEnVisto: autorizada.borradorEn?.toISOString() ?? null, quien: "Ana" });
  assert.equal(primera.ok, true);
  // Otra URL y otro tamaño: la marca sigue valiendo.
  const cambiado = await m.guardarAliadoEnBase(m.base, { id: fila.id, contenido: documento(nombre, "/aliados/science-up.png", { tamano: "grande", url: "https://prueba.org" }), borradorEnVisto: null, quien: "Eli" });
  assert.equal(cambiado.ok, true);
  if (!cambiado.ok) return;
  assert.equal((await m.publicarAliadoEnBase(m.base, { id: fila.id, borradorEnVisto: cambiado.borradorEn, quien: "Eli" })).ok, true);
  assert.equal((await enLaTira(false)).includes(fila.id), true);

  // Quitar la marca vacía lo que se autorizó.
  assert.equal((await m.autorizarAliadoEnBase(m.base, { ...pedido, autorizado: false, rol: "dirige" })).ok, true);
  const quitada = await m.base.aliado.findUniqueOrThrow({ where: { id: fila.id } });
  assert.deepEqual([quitada.autorizado, quitada.autorizadoLogo, quitada.autorizadoNombre], [false, null, null]);
});
