import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { config as cargarEntorno } from "dotenv";
import { borradorVacio } from "@/features/novedades/contenido/modelo";

// Crear, guardar, descartar y borrar contra el Postgres local. Las filas de
// prueba llevan slugs `prueba-editar-*` y se borran antes y después.

cargarEntorno({ path: [".env.local"], quiet: true });
const sinBase = { skip: !process.env.DATABASE_URL && "sin DATABASE_URL" };

async function modulos() {
  const { base } = await import("@/datos/cliente");
  const editar = await import("./editar-novedades");
  const { publicarNovedadEnBase } = await import("./publicar-novedades");
  return { base, ...editar, publicarNovedadEnBase };
}

const completa = (slug: string) => ({
  ...borradorVacio("2026-09-26"),
  slug,
  titulo: `Prueba ${slug}`,
  bajada: "Una bajada de prueba.",
  imagen: { src: "/fotos/formadora-explica.webp", alt: "Una formadora explica", foco: { x: 0.5, y: 0.5 } },
});

async function limpiar() {
  const { base } = await modulos();
  await base.novedad.deleteMany({ where: { OR: [{ slug: { startsWith: "prueba-editar" } }, { borrador: { path: ["slug"], string_starts_with: "prueba-editar" } }] } });
  await base.redireccion.deleteMany({ where: { desde: { startsWith: "/novedades/prueba-editar" } } });
}
before(async () => {
  if (process.env.DATABASE_URL) await limpiar();
});
after(async () => {
  if (process.env.DATABASE_URL) await limpiar();
});

test("crear, guardar, chocar, y una URL que ya usa otra", sinBase, async () => {
  const { base, crearNovedadEnBase, guardarNovedadEnBase } = await modulos();
  const creada = await crearNovedadEnBase(base, { contenido: { ...borradorVacio("2026-09-26"), slug: "prueba-editar-a" }, quien: "Ana" });
  assert.equal(creada.ok, true);
  if (!creada.ok) return;
  // Un borrador vacío se guarda; uno con una fecha que no existe, no, y dice dónde.
  const mal = await guardarNovedadEnBase(base, { id: creada.id, contenido: { ...completa("prueba-editar-a"), fecha: "2026-02-30" }, borradorEnVisto: creada.borradorEn, quien: "Ana" });
  assert.equal(mal.ok, false);
  assert.deepEqual(!mal.ok && mal.errores?.map((e) => [e.camino, e.donde]), [["fecha", "Fecha"]]);
  const bien = await guardarNovedadEnBase(base, { id: creada.id, contenido: completa("prueba-editar-a"), borradorEnVisto: creada.borradorEn, quien: "Ana" });
  assert.equal(bien.ok, true);
  // Con el `borradorEn` viejo, otra pantalla no pisa: choca.
  const vieja = await guardarNovedadEnBase(base, { id: creada.id, contenido: completa("prueba-editar-a"), borradorEnVisto: creada.borradorEn, quien: "Beto" });
  assert.equal(!vieja.ok && vieja.choque, true);
  // Otra novedad no puede tomar la URL de un borrador.
  const repetida = await crearNovedadEnBase(base, { contenido: completa("prueba-editar-a"), quien: "Beto" });
  assert.match(!repetida.ok ? (repetida.errores?.[0]?.mensaje ?? "") : "", /Esa URL ya la usa «Prueba prueba-editar-a»/);
});

test("descartar vuelve a lo publicado; sin nada publicado, no hay a qué volver", sinBase, async () => {
  const { base, crearNovedadEnBase, guardarNovedadEnBase, descartarCambiosEnBase, publicarNovedadEnBase } = await modulos();
  const creada = await crearNovedadEnBase(base, { contenido: completa("prueba-editar-b"), quien: "Ana" });
  if (!creada.ok) return assert.fail(creada.detalle);
  const nunca = await descartarCambiosEnBase(base, { id: creada.id, borradorEnVisto: creada.borradorEn });
  assert.match(!nunca.ok ? nunca.detalle : "", /nunca se publicó/);
  assert.equal((await publicarNovedadEnBase(base, { id: creada.id, borradorEnVisto: creada.borradorEn, quien: "Ana" })).ok, true);
  const cambio = await guardarNovedadEnBase(base, { id: creada.id, contenido: { ...completa("prueba-editar-b"), titulo: "Otro título" }, borradorEnVisto: null, quien: "Ana" });
  if (!cambio.ok) return assert.fail(cambio.detalle);
  const descarte = await descartarCambiosEnBase(base, { id: creada.id, borradorEnVisto: cambio.borradorEn });
  assert.equal(descarte.ok && descarte.descarto, true);
  const fila = await base.novedad.findUnique({ where: { id: creada.id } });
  assert.equal(fila?.borrador, null);
  assert.equal(fila?.titulo, "Prueba prueba-editar-b");
});

test("borrar se lleva la fila y las redirecciones que llevaban a ella", sinBase, async () => {
  const { base, crearNovedadEnBase, publicarNovedadEnBase, borrarNovedadEnBase } = await modulos();
  const creada = await crearNovedadEnBase(base, { contenido: completa("prueba-editar-c"), quien: "Ana" });
  if (!creada.ok) return assert.fail(creada.detalle);
  await publicarNovedadEnBase(base, { id: creada.id, borradorEnVisto: creada.borradorEn, quien: "Ana" });
  await base.redireccion.create({ data: { desde: "/novedades/prueba-editar-vieja", hacia: "/novedades/prueba-editar-c" } });
  const borrada = await borrarNovedadEnBase(base, { id: creada.id, borradorEnVisto: null });
  assert.deepEqual(borrada.ok && [borrada.titulo, borrada.slug, borrada.estabaPublicada], ["Prueba prueba-editar-c", "prueba-editar-c", true]);
  assert.equal(await base.novedad.count({ where: { id: creada.id } }), 0);
  assert.equal(await base.redireccion.count({ where: { hacia: "/novedades/prueba-editar-c" } }), 0);
});
