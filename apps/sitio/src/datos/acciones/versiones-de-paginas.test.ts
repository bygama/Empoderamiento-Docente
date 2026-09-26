import { after, test } from "node:test";
import assert from "node:assert/strict";
import { config as cargarEntorno } from "dotenv";
import { z } from "zod";
import { textoCorto } from "@/lib/contenido/campos";
import type { RegistroDePaginas } from "@/lib/contenido/documento";

cargarEntorno({ path: [".env.local"], quiet: true });
const hayBase = Boolean(process.env.DATABASE_URL);

// Un slug propio: node --test corre los archivos en paralelo.
const SLUG = "prueba-restaurar";
const con = (maximo: number): RegistroDePaginas => ({
  [SLUG]: {
    ruta: "/prueba-restaurar",
    nombre: "Prueba de restaurar",
    secciones: {
      bloque: { nombre: "Bloque", esquema: z.object({ titulo: textoCorto({ maximo, etiqueta: "Título" }) }), inicial: { titulo: "I" } },
      otro: { nombre: "Otro", esquema: z.object({ titulo: textoCorto({ maximo: 10 }) }), inicial: { titulo: "I" } },
    },
  },
});

async function publicarVersiones() {
  const { base } = await import("@/datos/cliente");
  const { guardarBorradorEnBase } = await import("./editar-paginas");
  const { publicarEnBase } = await import("./publicar-paginas");
  await base.pagina.deleteMany({ where: { slug: SLUG } });
  for (const titulo of ["Uno", "Dos"]) {
    const g = await guardarBorradorEnBase(base, { slug: SLUG, seccion: "bloque", contenido: { titulo }, borradorEnVisto: null, quien: "Raquel" }, con(10));
    if (!g.ok) throw new Error(g.detalle);
    await publicarEnBase(base, { slug: SLUG, quien: "Raquel", borradorEnVisto: g.borradorEn }, con(10));
  }
  const [dos, uno] = await base.versionDePagina.findMany({ where: { slug: SLUG }, orderBy: { publicadoEn: "desc" } });
  return { base, uno, dos };
}

test("restaurar pone la versión como borrador, sin publicar", { skip: !hayBase && "sin DATABASE_URL" }, async () => {
  const { base, uno } = await publicarVersiones();
  const { restaurarVersionEnBase } = await import("./versiones-de-paginas");
  const r = await restaurarVersionEnBase(base, { slug: SLUG, version: uno?.id ?? "", borradorEnVisto: null, quien: "Gastón" }, con(10));
  assert.equal(r.ok, true);
  if (!r.ok) return;
  assert.deepEqual(r.noEntraron, []);
  const fila = await base.pagina.findUnique({ where: { slug: SLUG } });
  assert.deepEqual(fila?.borrador, { bloque: { titulo: "Uno" } });
  assert.deepEqual(fila?.publicado, { bloque: { titulo: "Dos" } });
  assert.equal(fila?.borradorPor, "Gastón");

  // Con el borrador que dejó, otra restauración que no lo vio choca.
  const choque = await restaurarVersionEnBase(base, { slug: SLUG, version: uno?.id ?? "", borradorEnVisto: null, quien: "Daniela" }, con(10));
  assert.equal(!choque.ok && choque.choque, true);
});

test("lo que no pasa el esquema de hoy, o ya no existe, no entra y se dice", { skip: !hayBase && "sin DATABASE_URL" }, async () => {
  const { base, uno } = await publicarVersiones();
  const { restaurarVersionEnBase } = await import("./versiones-de-paginas");
  // Una versión vieja: trae una parte que hoy no existe y un título que hoy es largo.
  const vieja = await base.versionDePagina.create({
    data: { slug: SLUG, documento: { bloque: { titulo: "Uno" }, otro: { titulo: "Otra" }, borrada: { algo: 1 } }, publicadoPor: "Raquel", publicadoEn: new Date(Date.now() - 60_000) },
  });
  const r = await restaurarVersionEnBase(base, { slug: SLUG, version: vieja.id, borradorEnVisto: null, quien: "Gastón" }, con(2));
  assert.equal(r.ok, true);
  if (!r.ok) return;
  assert.deepEqual(r.noEntraron.map((n) => n.parte), ["Bloque", "borrada"]);
  assert.equal(r.noEntraron[0]?.motivo, "Bloque › Título — Como mucho 2 caracteres. Queda como está ahora");
  // «otro» entró; «bloque» quedó como estaba publicado.
  const fila = await base.pagina.findUnique({ where: { slug: SLUG } });
  assert.deepEqual(fila?.borrador, { bloque: { titulo: "Dos" }, otro: { titulo: "Otra" } });
  assert.ok(uno);
});

after(async () => {
  if (!hayBase) return;
  const { base } = await import("@/datos/cliente");
  await base.pagina.deleteMany({ where: { slug: SLUG } });
  await base.$disconnect();
});
