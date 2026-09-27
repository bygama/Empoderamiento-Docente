import { after, test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readdirSync } from "node:fs";
import { rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { config as cargarEntorno } from "dotenv";
import sharp from "sharp";
import type { UsosDeUnModulo } from "@/datos/fotos/uso";
import { almacenEnDisco } from "@/lib/contenido/almacen-en-disco";

// Editar el alt, reemplazar el archivo y borrar una foto contra el Postgres
// local, con los archivos en una carpeta temporal. Lo de prueba lleva el alt
// «Prueba editar…» o el slug `prueba-editar-foto` y se borra al final.

cargarEntorno({ path: [".env.local"], quiet: true });
const sinBase = { skip: !process.env.DATABASE_URL && "sin DATABASE_URL" };
const carpeta = mkdtempSync(path.join(os.tmpdir(), "ed-editar-fotos-"));
const almacen = almacenEnDisco(carpeta);

async function modulos() {
  const { base } = await import("@/datos/cliente");
  const { subirFotoEnBase } = await import("./subir-foto");
  const editar = await import("./editar-fotos");
  const { reemplazarFotoEnBase } = await import("./reemplazar-foto");
  return { base, subirFotoEnBase, reemplazarFotoEnBase, ...editar };
}

const webp = async (color: string) => new File([new Uint8Array(await sharp({ create: { width: 4, height: 3, channels: 3, background: color } }).webp().toBuffer())], "f.webp");

async function subida(alt: string) {
  const { base, subirFotoEnBase } = await modulos();
  const r = await subirFotoEnBase(base, almacen, { archivo: await webp("#1f2a44"), alt, quien: "Ana" });
  if (!r.ok) throw new Error(r.detalle);
  return r.foto;
}

/** Un registro de mentira que dice que la foto se usa en el contenido del código. */
const enElCodigo = (src: string): UsosDeUnModulo[] => [
  { modulo: "Prueba", buscar: async () => [{ src, donde: "Inicio › Hero", enlace: "/admin", en: "codigo", alt: "x" }], reemplazar: async () => [] },
];

test("el alt se edita, sin saltos ni vacío", sinBase, async () => {
  const { base, editarAltEnBase } = await modulos();
  const foto = await subida("Prueba editar alt");
  assert.deepEqual(await editarAltEnBase(base, { id: foto.id, alt: "  " }), { ok: false, detalle: "El texto alternativo es obligatorio." });
  assert.deepEqual(await editarAltEnBase(base, { id: foto.id, alt: " Prueba editar alt, nuevo " }), { ok: true, alt: "Prueba editar alt, nuevo" });
});

test("borrar frena si se usa, y si no se usa se lleva la fila y el archivo", sinBase, async () => {
  const { base, borrarFotoEnBase } = await modulos();
  const foto = await subida("Prueba editar borrar");
  const frenada = await borrarFotoEnBase(base, almacen, { id: foto.id, registro: enElCodigo(foto.src) });
  assert.deepEqual(frenada, { ok: false, detalle: "No se puede borrar: se usa en Inicio › Hero. Sacala de ahí primero." });
  assert.deepEqual(await borrarFotoEnBase(base, almacen, { id: foto.id }), { ok: true, alt: "Prueba editar borrar", delRepositorio: false });
  assert.equal(await base.foto.count({ where: { id: foto.id } }), 0);
  assert.equal(readdirSync(carpeta).some((a) => a.startsWith(foto.id)), false);
});

test("reemplazar cambia el archivo en cada uso y en la fila, y borra el viejo después", sinBase, async () => {
  const { base, reemplazarFotoEnBase } = await modulos();
  const foto = await subida("Prueba editar reemplazar");
  await base.novedad.create({ data: { slug: "prueba-editar-foto", titulo: "Prueba", imagen: { src: foto.src, alt: "En la novedad", foco: { x: 0.5, y: 0.5 } }, publicada: true } });
  // Con un uso en el código no se reemplaza, y no deja archivo nuevo.
  const antes = readdirSync(carpeta).length;
  const frenada = await reemplazarFotoEnBase(base, almacen, { id: foto.id, archivo: await webp("#e36c2d"), registro: enElCodigo(foto.src) });
  assert.equal(frenada.ok, false);
  assert.match(!frenada.ok ? frenada.detalle : "", /contenido del código/);
  assert.equal(readdirSync(carpeta).length, antes);

  const r = await reemplazarFotoEnBase(base, almacen, { id: foto.id, archivo: await webp("#e36c2d") });
  assert.equal(r.ok, true);
  const fila = await base.foto.findUniqueOrThrow({ where: { id: foto.id } });
  assert.notEqual(fila.url, foto.src);
  const novedad = await base.novedad.findFirstOrThrow({ where: { slug: "prueba-editar-foto" } });
  assert.deepEqual(novedad.imagen, { src: fila.url, alt: "En la novedad", foco: { x: 0.5, y: 0.5 } });
  assert.ok(r.ok && r.regenerar.some((x) => x.ruta === "/novedades"));
  // El viejo no está; el nuevo sí.
  assert.equal(readdirSync(carpeta).some((a) => a.startsWith(path.basename(foto.src))), false);
  assert.equal(readdirSync(carpeta).some((a) => a.startsWith(path.basename(fila.url))), true);
});

after(async () => {
  if (process.env.DATABASE_URL) {
    const { base } = await modulos();
    await base.novedad.deleteMany({ where: { slug: "prueba-editar-foto" } });
    await base.foto.deleteMany({ where: { alt: { startsWith: "Prueba editar" } } });
  }
  await rm(carpeta, { recursive: true, force: true });
});
