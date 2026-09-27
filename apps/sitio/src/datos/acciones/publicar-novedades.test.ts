import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { config as cargarEntorno } from "dotenv";
import { borradorVacio } from "@/features/novedades/contenido/modelo";

// Publicar y despublicar contra el Postgres local. Las filas de prueba llevan
// slugs `prueba-publicar-*`; la destacada de verdad (si hay) se guarda antes y
// se devuelve después, porque publicar una destacada la suelta.

cargarEntorno({ path: [".env.local"], quiet: true });
const sinBase = { skip: !process.env.DATABASE_URL && "sin DATABASE_URL" };

async function modulos() {
  const { base } = await import("@/datos/cliente");
  const { crearNovedadEnBase, guardarNovedadEnBase } = await import("./editar-novedades");
  const publicar = await import("./publicar-novedades");
  return { base, crearNovedadEnBase, guardarNovedadEnBase, ...publicar };
}

const completa = (slug: string, otros: object = {}) => ({
  ...borradorVacio("2026-09-26"),
  slug,
  titulo: `Prueba ${slug}`,
  bajada: "Una bajada de prueba.",
  imagen: { src: "/fotos/formadora-explica.webp", alt: "Una formadora explica", foco: { x: 0.5, y: 0.5 } },
  ...otros,
});

let destacadaDeVerdad: string | null = null;
async function limpiar() {
  const { base } = await modulos();
  await base.novedad.deleteMany({ where: { OR: [{ slug: { startsWith: "prueba-publicar" } }, { borrador: { path: ["slug"], string_starts_with: "prueba-publicar" } }] } });
  await base.redireccion.deleteMany({ where: { desde: { startsWith: "/novedades/prueba-publicar" } } });
}
before(async () => {
  if (!process.env.DATABASE_URL) return;
  await limpiar();
  destacadaDeVerdad = (await (await modulos()).base.novedad.findFirst({ where: { destacada: true } }))?.id ?? null;
});
after(async () => {
  if (!process.env.DATABASE_URL) return;
  await limpiar();
  if (destacadaDeVerdad) await (await modulos()).base.novedad.update({ where: { id: destacadaDeVerdad }, data: { destacada: true } });
});

/** Crea y publica una novedad de prueba; da su id. */
async function publicada(slug: string, otros: object = {}) {
  const { base, crearNovedadEnBase, publicarNovedadEnBase } = await modulos();
  const creada = await crearNovedadEnBase(base, { contenido: completa(slug, otros), quien: "Ana" });
  if (!creada.ok) throw new Error(creada.detalle);
  const r = await publicarNovedadEnBase(base, { id: creada.id, borradorEnVisto: creada.borradorEn, quien: "Ana" });
  if (!r.ok) throw new Error(r.detalle);
  return creada.id;
}

test("publicar valida entera la novedad y la copia a las columnas", sinBase, async () => {
  const { base, crearNovedadEnBase, publicarNovedadEnBase } = await modulos();
  const creada = await crearNovedadEnBase(base, { contenido: { ...borradorVacio("2026-09-26"), slug: "prueba-publicar-a" }, quien: "Ana" });
  if (!creada.ok) return assert.fail(creada.detalle);
  const incompleta = await publicarNovedadEnBase(base, { id: creada.id, borradorEnVisto: creada.borradorEn, quien: "Ana" });
  assert.deepEqual(!incompleta.ok && incompleta.errores?.map((e) => e.camino).sort(), ["bajada", "imagen.alt", "imagen.src", "titulo"]);
  const id = await publicada("prueba-publicar-b");
  const fila = await base.novedad.findUnique({ where: { id } });
  assert.deepEqual([fila?.publicada, fila?.slug, fila?.titulo, fila?.borrador, fila?.publicadaPor], [true, "prueba-publicar-b", "Prueba prueba-publicar-b", null, "Ana"]);
});

test("la destacada es una sola, también en los borradores", sinBase, async () => {
  const { base, guardarNovedadEnBase, publicarNovedadEnBase } = await modulos();
  const a = await publicada("prueba-publicar-c", { destacada: true });
  assert.equal(await base.novedad.count({ where: { destacada: true } }), 1);
  // La vieja destacada tiene un borrador que todavía dice destacada: publicar otra lo suelta también ahí.
  await guardarNovedadEnBase(base, { id: a, contenido: completa("prueba-publicar-c", { destacada: true, bajada: "Otra bajada." }), borradorEnVisto: null, quien: "Ana" });
  const b = await base.novedad.create({ data: { borrador: completa("prueba-publicar-d", { destacada: true }), borradorEn: new Date(), borradorPor: "Beto" } });
  const r = await publicarNovedadEnBase(base, { id: b.id, borradorEnVisto: b.borradorEn?.toISOString() ?? null, quien: "Beto" });
  assert.match(r.ok ? r.detalle : r.detalle, /«Prueba prueba-publicar-c» dejó de ser la destacada/);
  const vieja = await base.novedad.findUnique({ where: { id: a } });
  assert.equal(vieja?.destacada, false);
  assert.equal((vieja?.borrador as { destacada?: boolean } | null)?.destacada, false);
});

test("cambiar la URL deja el 308 del viejo al nuevo, sin cadenas", sinBase, async () => {
  const { base, guardarNovedadEnBase, publicarNovedadEnBase } = await modulos();
  const id = await publicada("prueba-publicar-e1");
  for (const slug of ["prueba-publicar-e2", "prueba-publicar-e3", "prueba-publicar-e1"]) {
    const g = await guardarNovedadEnBase(base, { id, contenido: completa(slug), borradorEnVisto: null, quien: "Ana" });
    if (!g.ok) return assert.fail(g.detalle);
    const p = await publicarNovedadEnBase(base, { id, borradorEnVisto: g.borradorEn, quien: "Ana" });
    if (!p.ok) return assert.fail(p.detalle);
  }
  const redirecciones = await base.redireccion.findMany({ where: { desde: { startsWith: "/novedades/prueba-publicar-e" } }, orderBy: { desde: "asc" } });
  // Volvió a e1: e2 y e3 llevan a e1, y nada sale de e1.
  assert.deepEqual(
    redirecciones.map((r) => [r.desde, r.hacia]),
    [
      ["/novedades/prueba-publicar-e2", "/novedades/prueba-publicar-e1"],
      ["/novedades/prueba-publicar-e3", "/novedades/prueba-publicar-e1"],
    ],
  );
});

test("despublicar la saca del sitio, conserva las columnas y suelta la destacada", sinBase, async () => {
  const { base, despublicarNovedadEnBase } = await modulos();
  const id = await publicada("prueba-publicar-f", { destacada: true });
  const r = await despublicarNovedadEnBase(base, { id, borradorEnVisto: null });
  assert.match(r.ok ? r.detalle : "", /dejó de ser la destacada/);
  const fila = await base.novedad.findUnique({ where: { id } });
  assert.deepEqual([fila?.publicada, fila?.destacada, fila?.titulo], [false, false, "Prueba prueba-publicar-f"]);
});
