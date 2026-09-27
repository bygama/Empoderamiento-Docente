import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { config as cargarEntorno } from "dotenv";
import { personaVacia } from "@/features/quienes-somos/contenido/persona-vacia";
import { limpiarEquipo, materialDePrueba, perfil } from "./equipo-de-prueba";

// Crear, guardar, descartar y borrar un perfil del Equipo contra el Postgres
// local. Lo de prueba se borra antes y después (equipo-de-prueba.ts).

cargarEntorno({ path: [".env.local"], quiet: true });
const sinBase = { skip: !process.env.DATABASE_URL && "sin DATABASE_URL" };
const PREFIJO = "prueba-editar-perfil";

async function modulos() {
  const { base } = await import("@/datos/cliente");
  return { base, ...(await import("./editar-equipo")), ...(await import("./publicar-equipo")) };
}

before(async () => {
  if (process.env.DATABASE_URL) await limpiarEquipo((await modulos()).base, PREFIJO);
});
after(async () => {
  if (process.env.DATABASE_URL) await limpiarEquipo((await modulos()).base, PREFIJO);
});

test("crear, guardar, chocar, y una URL que ya usa otro perfil", sinBase, async () => {
  const { base, crearPersonaEnBase, guardarPersonaEnBase } = await modulos();
  const creado = await crearPersonaEnBase(base, { contenido: { ...personaVacia(), slug: "prueba-editar-perfil-a" }, quien: "Ana" });
  if (!creado.ok) return assert.fail(creado.detalle);
  const repetida = await guardarPersonaEnBase(base, { id: creado.id, contenido: perfil("daniela-reyes", 4), borradorEnVisto: creado.borradorEn, quien: "Ana" });
  assert.match(!repetida.ok ? repetida.detalle : "", /URL — Esa URL ya la usa el perfil de Daniela Reyes/);
  const bien = await guardarPersonaEnBase(base, { id: creado.id, contenido: perfil("prueba-editar-perfil-a", 4), borradorEnVisto: creado.borradorEn, quien: "Ana" });
  assert.equal(bien.ok, true);
  // Quien guarda con lo que vio antes choca con el guardado de recién.
  const tarde = await guardarPersonaEnBase(base, { id: creado.id, contenido: perfil("prueba-editar-perfil-a", 4), borradorEnVisto: creado.borradorEn, quien: "Beto" });
  assert.equal(!tarde.ok && tarde.choque, true);
});

test("descartar vuelve a lo publicado; borrar deja sus autorías de afuera y se lleva sus redirecciones", sinBase, async () => {
  const { base, crearPersonaEnBase, guardarPersonaEnBase, publicarPersonaEnBase, descartarCambiosEnBase, borrarPersonaEnBase } = await modulos();
  const creado = await crearPersonaEnBase(base, { contenido: perfil("prueba-editar-perfil-b", 4), quien: "Ana" });
  if (!creado.ok) return assert.fail(creado.detalle);
  // Nunca publicado, no hay a qué volver.
  assert.equal((await descartarCambiosEnBase(base, { id: creado.id, borradorEnVisto: creado.borradorEn })).ok, false);
  await publicarPersonaEnBase(base, { id: creado.id, borradorEnVisto: creado.borradorEn, quien: "Ana" });
  const cambio = await guardarPersonaEnBase(base, { id: creado.id, contenido: { ...perfil("prueba-editar-perfil-b", 4), rol: "Otro rol" }, borradorEnVisto: null, quien: "Ana" });
  if (!cambio.ok) return assert.fail(cambio.detalle);
  const descarte = await descartarCambiosEnBase(base, { id: creado.id, borradorEnVisto: cambio.borradorEn });
  assert.equal(descarte.ok && descarte.descarto, true);
  assert.equal((await base.persona.findUnique({ where: { id: creado.id } }))?.rol, "Facilitadora");
  // Una autoría publicada, un borrador de material que la nombra y una redirección hacia su ficha.
  const firmado = await materialDePrueba(base, `${PREFIJO}-material-b`, creado.id);
  const conBorrador = await materialDePrueba(base, `${PREFIJO}-material-b2`, null);
  await base.material.update({ where: { id: conBorrador }, data: { borrador: { titulo: "Prueba perfil b2", autorias: [{ nombre: "Alguien", persona: creado.id }] } } });
  await base.redireccion.create({ data: { desde: "/quienes-somos/equipo/prueba-editar-perfil-viejo", hacia: "/quienes-somos/equipo/prueba-editar-perfil-b" } });
  const borrado = await borrarPersonaEnBase(base, { id: creado.id, borradorEnVisto: null });
  assert.deepEqual(borrado.ok && [borrado.nombre, borrado.estabaPublicada], ["Prueba b", true]);
  assert.deepEqual((await base.autoria.findMany({ where: { materialId: firmado } })).map((a) => [a.nombre, a.personaId]), [["Una Persona de Prueba", null]]);
  const borrador = (await base.material.findUnique({ where: { id: conBorrador } }))?.borrador as { autorias: Array<{ persona: string | null }> };
  assert.equal(borrador.autorias[0].persona, null);
  assert.equal(await base.redireccion.count({ where: { hacia: "/quienes-somos/equipo/prueba-editar-perfil-b" } }), 0);
});
