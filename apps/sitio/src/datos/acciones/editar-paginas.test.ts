import { after, test } from "node:test";
import assert from "node:assert/strict";
import { config as cargarEntorno } from "dotenv";
import { z } from "zod";
import type { PrismaClient } from "@/../prisma/generado/client";
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

async function modulos() {
  const { base } = await import("@/datos/cliente");
  const editar = await import("./editar-paginas");
  const { publicarEnBase } = await import("./publicar-paginas");
  return { base, ...editar, publicarEnBase };
}

const guardar = (titulo: string, borradorEnVisto: string | null, quien: string) => ({ slug: SLUG, seccion: "bloque", contenido: { titulo }, borradorEnVisto, quien });

test("guardar, chocar, publicar y descartar", { skip: !hayBase && "sin DATABASE_URL" }, async () => {
  const { base, descartarBorradorEnBase, guardarBorradorEnBase, publicarEnBase } = await modulos();
  await base.pagina.deleteMany({ where: { slug: SLUG } });

  // Sin fila: el primer guardado la crea.
  const r1 = await guardarBorradorEnBase(base, guardar("Uno", null, "Gastón"), registro);
  assert.equal(r1.ok, true);
  if (!r1.ok) return;
  assert.equal(r1.borradorPor, "Gastón");

  // Otra pantalla que abrió antes (vio null) no pisa: avisa quién guardó, y que recargar lo resuelve.
  const choque = await guardarBorradorEnBase(base, guardar("Dos", null, "Raquel"), registro);
  assert.equal(choque.ok, false);
  if (choque.ok) return;
  assert.match(choque.detalle, /Gastón guardó este borrador hace un momento/);
  assert.equal(choque.choque, true);

  // Con el borradorEn correcto sí guarda; un contenido inválido no, y no es un choque.
  const invalido = await guardarBorradorEnBase(base, guardar("", r1.borradorEn, "Raquel"), registro);
  assert.equal(invalido.ok, false);
  if (invalido.ok) return;
  assert.match(invalido.detalle, /vacío/);
  assert.equal(invalido.choque, undefined);
  const r2 = await guardarBorradorEnBase(base, guardar("Dos", r1.borradorEn, "Raquel"), registro);
  assert.equal(r2.ok, true);
  if (!r2.ok) return;

  // Publicar y descartar también chocan si no vieron el último borrador.
  const publicarViejo = await publicarEnBase(base, { slug: SLUG, quien: "Daniela", borradorEnVisto: r1.borradorEn }, registro);
  assert.equal(publicarViejo.ok, false);
  assert.equal(!publicarViejo.ok && publicarViejo.choque, true);
  const descartarViejo = await descartarBorradorEnBase(base, { slug: SLUG, borradorEnVisto: null }, registro);
  assert.equal(!descartarViejo.ok && descartarViejo.choque, true);

  // Publicar copia el borrador y lo deja en null.
  const pub = await publicarEnBase(base, { slug: SLUG, quien: "Raquel", borradorEnVisto: r2.borradorEn }, registro);
  assert.equal(pub.ok, true);
  if (!pub.ok) return;
  assert.deepEqual(pub.rutas, ["/prueba-edicion"]);
  const fila = await base.pagina.findUnique({ where: { slug: SLUG } });
  assert.deepEqual(fila?.publicado, { bloque: { titulo: "Dos" } });
  assert.equal(fila?.publicadoPor, "Raquel");
  assert.equal(fila?.borrador, null);
  assert.equal(fila?.borradorEn, null);

  // Sin borrador no hay nada que publicar; un borrador nuevo se descarta y vuelve a null.
  assert.equal((await publicarEnBase(base, { slug: SLUG, quien: "Raquel", borradorEnVisto: null }, registro)).ok, false);
  const r3 = await guardarBorradorEnBase(base, guardar("Tres", null, "Daniela"), registro);
  assert.equal(r3.ok, true);
  if (!r3.ok) return;
  assert.equal((await descartarBorradorEnBase(base, { slug: SLUG, borradorEnVisto: r3.borradorEn }, registro)).ok, true);
  const despues = await base.pagina.findUnique({ where: { slug: SLUG } });
  assert.equal(despues?.borrador, null);
  assert.deepEqual(despues?.publicado, { bloque: { titulo: "Dos" } });
});

test("dos pantallas que crean la fila a la vez: la segunda choca, no tira", { skip: !hayBase && "sin DATABASE_URL" }, async () => {
  const { base, guardarBorradorEnBase } = await modulos();
  await base.pagina.deleteMany({ where: { slug: SLUG } });
  const primera = await guardarBorradorEnBase(base, guardar("Uno", null, "Gastón"), registro);
  assert.equal(primera.ok, true);

  // La segunda leyó antes de que la primera insertara: su primera lectura no
  // ve la fila. El alta tiene que chocar en la base, no tirar por la clave.
  // El `as` arma un cliente a medida para el test: solo lo que la función usa.
  let primeraLectura = true;
  const vieja = {
    pagina: {
      findUnique: (args: Parameters<PrismaClient["pagina"]["findUnique"]>[0]) => {
        if (!primeraLectura) return base.pagina.findUnique(args);
        primeraLectura = false;
        return Promise.resolve(null);
      },
      createMany: (args: Parameters<PrismaClient["pagina"]["createMany"]>[0]) => base.pagina.createMany(args),
      updateMany: (args: Parameters<PrismaClient["pagina"]["updateMany"]>[0]) => base.pagina.updateMany(args),
    },
  } as unknown as PrismaClient;
  const segunda = await guardarBorradorEnBase(vieja, guardar("Dos", null, "Raquel"), registro);
  assert.equal(segunda.ok, false);
  if (segunda.ok) return;
  assert.equal(segunda.choque, true);
  assert.match(segunda.detalle, /Gastón guardó este borrador/);
  const fila = await base.pagina.findUnique({ where: { slug: SLUG } });
  assert.deepEqual(fila?.borrador, { bloque: { titulo: "Uno" } });
});

test("descartar sin borrador no escribe y lo dice, en vez de mentir que descartó (M-4)", { skip: !hayBase && "sin DATABASE_URL" }, async () => {
  const { base, descartarBorradorEnBase, guardarBorradorEnBase, publicarEnBase } = await modulos();
  await base.pagina.deleteMany({ where: { slug: SLUG } });

  // Fila con `publicado` pero sin borrador: exactamente el caso de M-4.
  const r = await guardarBorradorEnBase(base, guardar("Cuatro", null, "Gastón"), registro);
  assert.equal(r.ok, true);
  if (!r.ok) return;
  await publicarEnBase(base, { slug: SLUG, quien: "Gastón", borradorEnVisto: r.borradorEn }, registro);

  const descarte = await descartarBorradorEnBase(base, { slug: SLUG, borradorEnVisto: null }, registro);
  assert.equal(descarte.ok, true);
  assert.equal(descarte.detalle, "No había borrador que descartar.");

  // No escribió de más: sigue publicado igual que antes de llamar.
  const fila = await base.pagina.findUnique({ where: { slug: SLUG } });
  assert.deepEqual(fila?.publicado, { bloque: { titulo: "Cuatro" } });
});

test("una página o sección que no está en el registro no se guarda", { skip: !hayBase && "sin DATABASE_URL" }, async () => {
  const { base, guardarBorradorEnBase } = await modulos();
  const r = await guardarBorradorEnBase(base, { slug: "no-existe", seccion: "bloque", contenido: {}, borradorEnVisto: null, quien: "Gastón" }, registro);
  assert.equal(r.ok, false);
});

test("una sección __proto__ no cuela como si fuera real", { skip: !hayBase && "sin DATABASE_URL" }, async () => {
  const { base, guardarBorradorEnBase } = await modulos();
  const r = await guardarBorradorEnBase(base, { slug: SLUG, seccion: "__proto__", contenido: {}, borradorEnVisto: null, quien: "Gastón" }, registro);
  assert.equal(r.ok, false);
});

after(async () => {
  if (!hayBase) return;
  const { base } = await import("@/datos/cliente");
  await base.pagina.deleteMany({ where: { slug: SLUG } });
  await base.$disconnect();
});
