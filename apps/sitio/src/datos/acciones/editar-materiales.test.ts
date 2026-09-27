import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { config as cargarEntorno } from "dotenv";
import { borradorVacio } from "@/features/biblioteca/contenido/modelo";

// Crear, guardar, publicar, ocultar, descartar y borrar un material contra el
// Postgres local. Las filas de prueba se titulan «Prueba material …» y se
// borran antes y después; el destacado que el test le saca a uno de los 57 se
// le devuelve al final.

cargarEntorno({ path: [".env.local"], quiet: true });
const sinBase = { skip: !process.env.DATABASE_URL && "sin DATABASE_URL" };

async function modulos() {
  const { base } = await import("@/datos/cliente");
  return { base, ...(await import("./editar-materiales")), ...(await import("./publicar-materiales")) };
}

const completo = (letra: string) => ({
  ...borradorVacio(),
  titulo: `Prueba material ${letra}`,
  autorias: [
    { nombre: "Daniela Reyes-Gasperini", persona: "daniela-reyes" },
    { nombre: "Alguien de Afuera", persona: null },
  ],
  tipo: "Artículos",
  tema: "Geometría",
  publico: "Docentes",
  fecha: "2026",
  formato: "PDF",
  url: `https://ejemplo.org/prueba-${letra}`,
  fuente: "Una revista",
  doi: `10.99999/prueba-material-${letra}`,
});

/** Los destacados de antes de las pruebas: se devuelven al final, pase lo que pase. */
let lugares: Array<{ id: string; destacado: number | null }> = [];

async function limpiar() {
  const { base } = await modulos();
  await base.novedad.deleteMany({ where: { slug: { startsWith: "prueba-material" } } });
  await base.material.deleteMany({ where: { OR: [{ titulo: { startsWith: "Prueba material" } }, { borrador: { path: ["titulo"], string_starts_with: "Prueba material" } }] } });
}
before(async () => {
  if (!process.env.DATABASE_URL) return;
  await limpiar();
  lugares = await (await modulos()).base.material.findMany({ where: { destacado: { not: null } }, select: { id: true, destacado: true } });
});
after(async () => {
  if (!process.env.DATABASE_URL) return;
  await limpiar();
  const { base } = await modulos();
  for (const { id, destacado } of lugares) await base.material.update({ where: { id }, data: { destacado } });
});

test("crear, guardar, chocar, y un DOI que ya está", sinBase, async () => {
  const { base, crearMaterialEnBase, guardarMaterialEnBase } = await modulos();
  const creado = await crearMaterialEnBase(base, { contenido: { ...borradorVacio(), titulo: "Prueba material a" }, quien: "Ana" });
  if (!creado.ok) return assert.fail(creado.detalle);
  // Un borrador vacío se guarda; con un DOI que tiene otro material, no.
  const repetido = await guardarMaterialEnBase(base, { id: creado.id, contenido: { ...completo("a"), doi: "10.12802/relime.2025.28.e805" }, borradorEnVisto: creado.borradorEn, quien: "Ana" });
  assert.match(!repetido.ok ? repetido.detalle : "", /DOI — Ese DOI ya está en la Biblioteca: «Resignificación/);
  const bien = await guardarMaterialEnBase(base, { id: creado.id, contenido: completo("a"), borradorEnVisto: creado.borradorEn, quien: "Ana" });
  assert.equal(bien.ok, true);
  // Quien guarda con lo que vio antes choca con el guardado de recién.
  const tarde = await guardarMaterialEnBase(base, { id: creado.id, contenido: completo("a"), borradorEnVisto: creado.borradorEn, quien: "Beto" });
  assert.equal(!tarde.ok && tarde.choque, true);
});

test("publicar copia las autorías, suelta el lugar del destacado y borra el chequeo si cambió el link", sinBase, async () => {
  const { base, crearMaterialEnBase, publicarMaterialEnBase, guardarMaterialEnBase } = await modulos();
  const destacado = { ...completo("b"), destacado: 1, rotulo: "Prueba", frase: "Una frase.", detalle: "Un detalle." };
  const creado = await crearMaterialEnBase(base, { contenido: destacado, quien: "Ana" });
  if (!creado.ok) return assert.fail(creado.detalle);
  const publicado = await publicarMaterialEnBase(base, { id: creado.id, borradorEnVisto: creado.borradorEn, quien: "Ana" });
  assert.match(publicado.ok ? publicado.detalle : publicado.detalle, /dejó su lugar entre los destacados/);
  const fila = await base.material.findUnique({ where: { id: creado.id }, include: { autorias: { orderBy: { orden: "asc" } } } });
  assert.deepEqual(fila?.autorias.map((a) => [a.nombre, a.persona]), [["Daniela Reyes-Gasperini", "daniela-reyes"], ["Alguien de Afuera", null]]);
  assert.equal(fila?.destacado, 1);
  const antes = lugares.find((l) => l.destacado === 1);
  if (antes) assert.equal((await base.material.findUnique({ where: { id: antes.id } }))?.destacado, null);
  // Un chequeo hecho, y un cambio de link que lo borra al publicar.
  await base.material.update({ where: { id: creado.id }, data: { chequeoEn: new Date(), chequeo: "roto", chequeoDetalle: "Dio 404." } });
  const otro = await guardarMaterialEnBase(base, { id: creado.id, contenido: { ...destacado, url: "https://ejemplo.org/otro" }, borradorEnVisto: null, quien: "Ana" });
  if (!otro.ok) return assert.fail(otro.detalle);
  await publicarMaterialEnBase(base, { id: creado.id, borradorEnVisto: otro.borradorEn, quien: "Ana" });
  assert.equal((await base.material.findUnique({ where: { id: creado.id } }))?.chequeo, null);
});

test("ocultar suelta el lugar; descartar vuelve a lo publicado; borrar deja a la novedad sin material", sinBase, async () => {
  const { base, crearMaterialEnBase, publicarMaterialEnBase, ocultarMaterialEnBase, guardarMaterialEnBase, descartarCambiosEnBase, borrarMaterialEnBase } = await modulos();
  const creado = await crearMaterialEnBase(base, { contenido: { ...completo("c"), destacado: 2, rotulo: "R", frase: "F.", detalle: "D." }, quien: "Ana" });
  if (!creado.ok) return assert.fail(creado.detalle);
  // Sin publicar, ocultar no tiene sentido y descartar no tiene a qué volver.
  assert.equal((await ocultarMaterialEnBase(base, { id: creado.id, borradorEnVisto: creado.borradorEn })).ok, false);
  assert.equal((await descartarCambiosEnBase(base, { id: creado.id, borradorEnVisto: creado.borradorEn })).ok, false);
  await publicarMaterialEnBase(base, { id: creado.id, borradorEnVisto: creado.borradorEn, quien: "Ana" });
  const oculto = await ocultarMaterialEnBase(base, { id: creado.id, borradorEnVisto: null });
  assert.match(oculto.ok ? oculto.detalle : "", /dejó su lugar/);
  assert.deepEqual(await base.material.findUnique({ where: { id: creado.id }, select: { publicado: true, destacado: true, titulo: true } }), { publicado: false, destacado: null, titulo: "Prueba material c" });
  const cambio = await guardarMaterialEnBase(base, { id: creado.id, contenido: { ...completo("c"), titulo: "Prueba material c, otro título" }, borradorEnVisto: null, quien: "Ana" });
  if (!cambio.ok) return assert.fail(cambio.detalle);
  const descarte = await descartarCambiosEnBase(base, { id: creado.id, borradorEnVisto: cambio.borradorEn });
  assert.equal(descarte.ok && descarte.descarto, true);
  const novedad = await base.novedad.create({ data: { slug: "prueba-material-c", titulo: "Una novedad", materialId: creado.id, publicada: true } });
  const borrado = await borrarMaterialEnBase(base, { id: creado.id, borradorEnVisto: null });
  assert.deepEqual(borrado.ok && [borrado.titulo, borrado.novedades], ["Prueba material c", ["prueba-material-c"]]);
  assert.equal((await base.novedad.findUnique({ where: { id: novedad.id } }))?.materialId, null);
  assert.equal(await base.autoria.count({ where: { materialId: creado.id } }), 0);
});
