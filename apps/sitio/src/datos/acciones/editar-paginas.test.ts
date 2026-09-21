import { after, test } from "node:test";
import assert from "node:assert/strict";
import { config as cargarEntorno } from "dotenv";
import { z } from "zod";
import { textoCorto } from "@/lib/contenido/campos";
import type { RegistroDePaginas } from "@/lib/contenido/documento";

cargarEntorno({ path: [".env.local"], quiet: true });
const hayBase = Boolean(process.env.DATABASE_URL);

const SLUG = "prueba-edicion";
const registro: RegistroDePaginas = {
  [SLUG]: {
    ruta: "/prueba-edicion",
    nombre: "Prueba",
    secciones: {
      bloque: { nombre: "Bloque", esquema: z.object({ titulo: textoCorto({ maximo: 10 }) }), inicial: { titulo: "Inicial" } },
    },
  },
};

test("guardar, chocar, publicar y descartar", { skip: !hayBase && "sin DATABASE_URL" }, async () => {
  const { base } = await import("@/datos/cliente");
  const { descartarBorradorEnBase, guardarBorradorEnBase, publicarEnBase } = await import("./editar-paginas");
  await base.pagina.deleteMany({ where: { slug: SLUG } });

  // Sin fila: el primer guardado la crea.
  const r1 = await guardarBorradorEnBase(base, { slug: SLUG, seccion: "bloque", contenido: { titulo: "Uno" }, borradorEnVisto: null, quien: "Gastón" }, registro);
  assert.equal(r1.ok, true);
  if (!r1.ok) return;
  assert.equal(r1.borradorPor, "Gastón");

  // Otra pantalla que abrió antes (vio null) no pisa: avisa quién guardó.
  const choque = await guardarBorradorEnBase(base, { slug: SLUG, seccion: "bloque", contenido: { titulo: "Dos" }, borradorEnVisto: null, quien: "Raquel" }, registro);
  assert.equal(choque.ok, false);
  if (choque.ok) return;
  assert.match(choque.detalle, /Gastón guardó este borrador hace un momento/);

  // Con el borradorEn correcto sí guarda; un contenido inválido no.
  const invalido = await guardarBorradorEnBase(base, { slug: SLUG, seccion: "bloque", contenido: { titulo: "" }, borradorEnVisto: r1.borradorEn, quien: "Raquel" }, registro);
  assert.equal(invalido.ok, false);
  if (invalido.ok) return;
  assert.match(invalido.detalle, /vacío/);
  const r2 = await guardarBorradorEnBase(base, { slug: SLUG, seccion: "bloque", contenido: { titulo: "Dos" }, borradorEnVisto: r1.borradorEn, quien: "Raquel" }, registro);
  assert.equal(r2.ok, true);

  // Publicar copia el borrador y lo deja en null.
  const pub = await publicarEnBase(base, { slug: SLUG, quien: "Raquel" }, registro);
  assert.equal(pub.ok, true);
  if (!pub.ok) return;
  assert.equal(pub.ruta, "/prueba-edicion");
  const fila = await base.pagina.findUnique({ where: { slug: SLUG } });
  assert.deepEqual(fila?.publicado, { bloque: { titulo: "Dos" } });
  assert.equal(fila?.publicadoPor, "Raquel");
  assert.equal(fila?.borrador, null);
  assert.equal(fila?.borradorEn, null);

  // Sin borrador no hay nada que publicar; un borrador nuevo se descarta y vuelve a null.
  assert.equal((await publicarEnBase(base, { slug: SLUG, quien: "Raquel" }, registro)).ok, false);
  const r3 = await guardarBorradorEnBase(base, { slug: SLUG, seccion: "bloque", contenido: { titulo: "Tres" }, borradorEnVisto: null, quien: "Daniela" }, registro);
  assert.equal(r3.ok, true);
  assert.equal((await descartarBorradorEnBase(base, SLUG, registro)).ok, true);
  const despues = await base.pagina.findUnique({ where: { slug: SLUG } });
  assert.equal(despues?.borrador, null);
  assert.deepEqual(despues?.publicado, { bloque: { titulo: "Dos" } });
});

test("una página o sección que no está en el registro no se guarda", { skip: !hayBase && "sin DATABASE_URL" }, async () => {
  const { base } = await import("@/datos/cliente");
  const { guardarBorradorEnBase } = await import("./editar-paginas");
  const r = await guardarBorradorEnBase(base, { slug: "no-existe", seccion: "bloque", contenido: {}, borradorEnVisto: null, quien: "Gastón" }, registro);
  assert.equal(r.ok, false);
});

test("una sección __proto__ no cuela como si fuera real", { skip: !hayBase && "sin DATABASE_URL" }, async () => {
  const { base } = await import("@/datos/cliente");
  const { guardarBorradorEnBase } = await import("./editar-paginas");
  const r = await guardarBorradorEnBase(base, { slug: SLUG, seccion: "__proto__", contenido: {}, borradorEnVisto: null, quien: "Gastón" }, registro);
  assert.equal(r.ok, false);
});

after(async () => {
  if (!hayBase) return;
  const { base } = await import("@/datos/cliente");
  await base.pagina.deleteMany({ where: { slug: SLUG } });
  await base.$disconnect();
});
