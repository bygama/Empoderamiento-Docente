import { after, test } from "node:test";
import assert from "node:assert/strict";
import { config as cargarEntorno } from "dotenv";
import { z } from "zod";
import { textoCorto } from "@/lib/contenido/campos";
import type { RegistroDePaginas } from "@/lib/contenido/documento";

cargarEntorno({ path: [".env.local"], quiet: true });
const hayBase = Boolean(process.env.DATABASE_URL);

// Un slug propio: node --test corre los archivos en paralelo, y editar-paginas.test.ts usa otro.
const SLUG = "prueba-versiones";
const registro: RegistroDePaginas = {
  [SLUG]: {
    ruta: "/prueba-versiones",
    nombre: "Prueba de versiones",
    secciones: { bloque: { nombre: "Bloque", esquema: z.object({ titulo: textoCorto({ maximo: 10 }) }), inicial: { titulo: "Inicial" } } },
  },
};

test("cada publicación deja su versión y quedan las últimas diez", { skip: !hayBase && "sin DATABASE_URL" }, async () => {
  const { base } = await import("@/datos/cliente");
  const { guardarBorradorEnBase } = await import("./editar-paginas");
  const { MAXIMO_DE_VERSIONES, publicarEnBase } = await import("./publicar-paginas");
  await base.pagina.deleteMany({ where: { slug: SLUG } });

  for (let i = 1; i <= MAXIMO_DE_VERSIONES + 1; i++) {
    const guardado = await guardarBorradorEnBase(base, { slug: SLUG, seccion: "bloque", contenido: { titulo: `Versión ${i}` }, borradorEnVisto: null, quien: "Raquel" }, registro);
    assert.equal(guardado.ok, true);
    if (!guardado.ok) return;
    const publicado = await publicarEnBase(base, { slug: SLUG, quien: i % 2 ? "Raquel" : "Gastón", borradorEnVisto: guardado.borradorEn }, registro);
    assert.equal(publicado.ok, true);
  }

  const versiones = await base.versionDePagina.findMany({ where: { slug: SLUG }, orderBy: { publicadoEn: "desc" } });
  assert.equal(versiones.length, MAXIMO_DE_VERSIONES);
  // La más nueva es lo que quedó publicado, con quién y cuándo; la primera se podó.
  const fila = await base.pagina.findUnique({ where: { slug: SLUG } });
  assert.deepEqual(versiones[0]?.documento, fila?.publicado);
  assert.equal(versiones[0]?.publicadoPor, fila?.publicadoPor);
  assert.equal(versiones[0]?.publicadoEn.getTime(), fila?.publicadoEn?.getTime());
  assert.deepEqual(versiones.at(-1)?.documento, { bloque: { titulo: "Versión 2" } });
});

test("una publicación que choca no deja versión", { skip: !hayBase && "sin DATABASE_URL" }, async () => {
  const { base } = await import("@/datos/cliente");
  const { guardarBorradorEnBase } = await import("./editar-paginas");
  const { publicarEnBase } = await import("./publicar-paginas");
  await base.pagina.deleteMany({ where: { slug: SLUG } });
  const guardado = await guardarBorradorEnBase(base, { slug: SLUG, seccion: "bloque", contenido: { titulo: "Uno" }, borradorEnVisto: null, quien: "Raquel" }, registro);
  assert.equal(guardado.ok, true);
  const choque = await publicarEnBase(base, { slug: SLUG, quien: "Gastón", borradorEnVisto: null }, registro);
  assert.equal(!choque.ok && choque.choque, true);
  assert.equal(await base.versionDePagina.count({ where: { slug: SLUG } }), 0);
});

test("publicar la dueña de lo compartido devuelve también las rutas que lo muestran", { skip: !hayBase && "sin DATABASE_URL" }, async () => {
  const { base } = await import("@/datos/cliente");
  const { guardarBorradorEnBase } = await import("./editar-paginas");
  const { publicarEnBase } = await import("./publicar-paginas");
  const conQuienUsa: RegistroDePaginas = {
    ...registro,
    "prueba-usa": {
      ruta: "/prueba-usa",
      nombre: "Prueba que usa",
      secciones: { suya: { nombre: "Suya", esquema: z.object({}), inicial: {}, usa: { pagina: SLUG, seccion: "bloque", que: "Los bloques" } } },
    },
  };
  await base.pagina.deleteMany({ where: { slug: SLUG } });
  const guardado = await guardarBorradorEnBase(base, { slug: SLUG, seccion: "bloque", contenido: { titulo: "Compartido" }, borradorEnVisto: null, quien: "Raquel" }, conQuienUsa);
  assert.equal(guardado.ok, true);
  if (!guardado.ok) return;
  const publicado = await publicarEnBase(base, { slug: SLUG, quien: "Raquel", borradorEnVisto: guardado.borradorEn }, conQuienUsa);
  assert.equal(publicado.ok, true);
  if (publicado.ok) assert.deepEqual(publicado.rutas, ["/prueba-versiones", "/prueba-usa"]);
});

after(async () => {
  if (!hayBase) return;
  const { base } = await import("@/datos/cliente");
  // Las versiones se van con la fila: la relación borra en cascada.
  await base.pagina.deleteMany({ where: { slug: SLUG } });
  await base.$disconnect();
});
