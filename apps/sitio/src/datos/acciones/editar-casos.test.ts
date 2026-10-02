import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { config as cargarEntorno } from "dotenv";
import type { Caso as Fila, Prisma as TiposDePrisma } from "@/../prisma/generado/client";

// Guardar, publicar y descartar un caso contra el Postgres local. Los casos
// son los fijos y reales: la prueba usa el `caso-04` (el 02 de la pila) y lo
// deja como estaba, con sus redirecciones de prueba borradas.

cargarEntorno({ path: [".env.local"], quiet: true });
const sinBase = { skip: !process.env.DATABASE_URL && "sin DATABASE_URL" };

async function modulos() {
  const { base } = await import("@/datos/cliente");
  const { Prisma } = await import("@/../prisma/generado/client");
  const { publicadoDeCaso } = await import("@/datos/consultas/casos");
  const editar = await import("./editar-casos");
  const { publicarCasoEnBase } = await import("./publicar-casos");
  return { base, Prisma, publicadoDeCaso, publicarCasoEnBase, ...editar };
}

let original: Fila | null = null;
const OTRO_SLUG = "prueba-caso-cuatro";

before(async () => {
  if (!process.env.DATABASE_URL) return;
  const { base } = await modulos();
  original = await base.caso.findUniqueOrThrow({ where: { id: "caso-04" } });
});

after(async () => {
  if (!process.env.DATABASE_URL || !original) return;
  const { base, Prisma } = await modulos();
  const { id, borrador, lamina, evidencias, produccionRelacionada, ...resto } = original;
  // Salieron de columnas Json de la misma fila: vuelven tal cual.
  const json = (v: TiposDePrisma.JsonValue) => v as TiposDePrisma.InputJsonValue;
  await base.caso.update({
    where: { id },
    data: { ...resto, lamina: json(lamina), evidencias: json(evidencias), produccionRelacionada: json(produccionRelacionada), borrador: borrador === null ? Prisma.DbNull : json(borrador) },
  });
  await base.redireccion.deleteMany({ where: { OR: [{ desde: { contains: OTRO_SLUG } }, { hacia: { contains: OTRO_SLUG } }] } });
});

test("guardar, chocar, la URL de otro caso, publicar con 308 y descartar", sinBase, async () => {
  const { base, publicadoDeCaso, guardarCasoEnBase, descartarCambiosDeCasoEnBase, publicarCasoEnBase } = await modulos();
  const fila = original as Fila;
  const documento = publicadoDeCaso(fila) as Record<string, unknown>;

  // Un borrador a medias se guarda; con la URL del caso 01, no.
  const aMedias = await guardarCasoEnBase(base, { id: "caso-04", contenido: { ...documento, pregunta: "" }, borradorEnVisto: null, quien: "Ana" });
  assert.equal(aMedias.ok, true);
  if (!aMedias.ok) return;
  const ocupada = await guardarCasoEnBase(base, { id: "caso-04", contenido: { ...documento, slug: "oaxaca-transformacion-colectiva" }, borradorEnVisto: aMedias.borradorEn, quien: "Ana" });
  assert.deepEqual(!ocupada.ok && ocupada.errores?.map((e) => [e.camino, e.mensaje]), [["slug", "Esa URL ya la usa el caso 01."]]);
  // Con el `borradorEn` viejo, otra pantalla no pisa.
  assert.equal((await guardarCasoEnBase(base, { id: "caso-04", contenido: documento, borradorEnVisto: null, quien: "Beto" })).ok, false);
  // Publicar lo que está a medias no pasa, y dice dónde.
  const mal = await publicarCasoEnBase(base, { id: "caso-04", borradorEnVisto: aMedias.borradorEn, quien: "Ana" });
  assert.deepEqual(!mal.ok && mal.errores?.map((e) => e.donde), ["Pregunta"]);

  // Con otra URL, se publica y deja el 308 de la vieja.
  const nuevo = await guardarCasoEnBase(base, { id: "caso-04", contenido: { ...documento, slug: OTRO_SLUG }, borradorEnVisto: aMedias.borradorEn, quien: "Ana" });
  assert.equal(nuevo.ok, true);
  if (!nuevo.ok) return;
  const publicado = await publicarCasoEnBase(base, { id: "caso-04", borradorEnVisto: nuevo.borradorEn, quien: "Ana" });
  assert.equal(publicado.ok, true);
  const despues = await base.caso.findUniqueOrThrow({ where: { id: "caso-04" } });
  assert.deepEqual([despues.slug, despues.borrador, despues.publicadoPor], [OTRO_SLUG, null, "Ana"]);
  const redireccion = await base.redireccion.findUnique({ where: { desde: `/investigacion/casos/${fila.slug}` } });
  assert.equal(redireccion?.hacia, `/investigacion/casos/${OTRO_SLUG}`);
  assert.deepEqual(await publicarCasoEnBase(base, { id: "caso-04", borradorEnVisto: null, quien: "Ana" }), { ok: false, detalle: "El caso ya está publicado así." });

  // Descartar vuelve a lo publicado.
  const otroBorrador = await guardarCasoEnBase(base, { id: "caso-04", contenido: { ...documento, slug: OTRO_SLUG, eje: "Otro eje" }, borradorEnVisto: null, quien: "Ana" });
  assert.equal(otroBorrador.ok, true);
  if (!otroBorrador.ok) return;
  const descartado = await descartarCambiosDeCasoEnBase(base, { id: "caso-04", borradorEnVisto: otroBorrador.borradorEn });
  assert.equal(descartado.ok && descartado.descarto, true);
  assert.equal((await base.caso.findUniqueOrThrow({ where: { id: "caso-04" } })).borrador, null);
});
