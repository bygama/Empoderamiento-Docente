import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config as cargarEntorno } from "dotenv";
import { z } from "zod";
import type { Novedad as Fila } from "@/../prisma/generado/client";
import { borradorVacio } from "@/features/novedades/contenido/modelo";
import { foto } from "@/lib/contenido/campos";
import { completarPagina, type RegistroDePaginas } from "@/lib/contenido/documento";

// Una foto de Blob de otro store (otro token, una mudanza de host, local
// leyendo una base con fotos de Blob): lo guardado se sigue leyendo —no se
// esconde una novedad ni vuelve una sección a su contenido inicial—, porque
// next/image y la CSP ya no la dejan mostrar; pero guardarla desde el admin
// se rechaza. La regla del store propio vive solo en el camino de guardar
// (`validarAlGuardar`).

cargarEntorno({ path: [".env.local"], quiet: true });
const sinBase = { skip: !process.env.DATABASE_URL && "sin DATABASE_URL" };

const PROPIA = "https://propio.public.blob.vercel-storage.com/fotos/a.webp";
const AJENA = "https://otro-store.public.blob.vercel-storage.com/fotos/a.webp";
const imagen = (src: string) => ({ src, alt: "Una formadora explica", foco: { x: 0.5, y: 0.5 } });

const tokenAntes = process.env.BLOB_READ_WRITE_TOKEN;
before(() => {
  process.env.BLOB_READ_WRITE_TOKEN = "vercel_blob_rw_propio_secreto";
});
after(async () => {
  if (tokenAntes === undefined) delete process.env.BLOB_READ_WRITE_TOKEN;
  else process.env.BLOB_READ_WRITE_TOKEN = tokenAntes;
  if (!process.env.DATABASE_URL) return;
  const { base } = await import("@/datos/cliente");
  await base.novedad.deleteMany({ where: { borrador: { path: ["slug"], string_starts_with: "prueba-otro-store" } } });
});

test("una novedad publicada con una foto de otro store se sigue leyendo; guardarla, no", sinBase, async () => {
  const { novedadesVisibles } = await import("@/datos/consultas/novedades");
  const { base } = await import("@/datos/cliente");
  const { crearNovedadEnBase } = await import("./editar-novedades");
  const fila: Fila = {
    id: "id-otro-store",
    slug: "prueba-otro-store",
    titulo: "Una novedad",
    bajada: "Una bajada.",
    fecha: "2026",
    categoria: "publicaciones",
    imagen: imagen(AJENA),
    cuerpo: null,
    destacada: false,
    materialId: null,
    imagenParaRedes: null,
    publicada: true,
    publicadaEn: new Date(),
    publicadaPor: null,
    borrador: null,
    borradorEn: null,
    borradorPor: null,
    creadaEn: new Date(),
    creadaPor: null,
  };
  assert.deepEqual(novedadesVisibles([fila], false).map((n) => n.slug), ["prueba-otro-store"]);

  const contenido = (src: string) => ({ ...borradorVacio("2026-09-30"), slug: "prueba-otro-store", titulo: "Prueba", bajada: "Una bajada.", imagen: imagen(src) });
  const ajena = await crearNovedadEnBase(base, { contenido: contenido(AJENA), quien: "Ana" });
  assert.equal(ajena.ok, false);
  assert.deepEqual(!ajena.ok && ajena.errores?.map((e) => e.camino), ["imagen.src"]);
  assert.equal((await crearNovedadEnBase(base, { contenido: contenido(PROPIA), quien: "Ana" })).ok, true);
});

test("una sección con una foto de otro store no vuelve al contenido inicial; guardarla, no", async () => {
  const { guardarBorradorEnBase } = await import("./editar-paginas");
  const { base } = await import("@/datos/cliente");
  const registro: RegistroDePaginas = {
    prueba: { ruta: "/prueba", nombre: "Prueba", secciones: { hero: { nombre: "Hero", esquema: z.object({ foto: foto() }), inicial: { foto: imagen("/fotos/a.webp") } } } },
  };
  const avisos: string[] = [];
  assert.deepEqual(completarPagina(registro.prueba!, { hero: { foto: imagen(AJENA) } }, (m) => avisos.push(m)), { hero: { foto: imagen(AJENA) } });
  assert.deepEqual(avisos, []);
  // Rechazado por el esquema, antes de tocar la base.
  const guardada = await guardarBorradorEnBase(base, { slug: "prueba", seccion: "hero", contenido: { foto: imagen(AJENA) }, borradorEnVisto: null, quien: "Ana" }, registro);
  assert.equal(guardada.ok, false);
});

test("cada guardado del admin valida con la regla de guardar (`validarAlGuardar`)", () => {
  const aqui = path.dirname(fileURLToPath(import.meta.url));
  const guardados = readdirSync(aqui).filter((a) => /^editar-.*\.ts$/.test(a) && !a.endsWith(".test.ts"));
  assert.ok(guardados.length >= 6, guardados.join(", "));
  for (const archivo of guardados) {
    const codigo = readFileSync(path.join(aqui, archivo), "utf8");
    for (const [linea] of codigo.matchAll(/^.*\.safeParse\(contenido\b.*$/gm)) {
      assert.match(linea, /validarAlGuardar\(\(\) => /, `${archivo}: «${linea.trim()}» valida sin la regla de guardar`);
    }
  }
});
