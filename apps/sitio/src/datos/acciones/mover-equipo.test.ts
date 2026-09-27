import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { config as cargarEntorno } from "dotenv";
import { personaVacia } from "@/features/quienes-somos/contenido/persona-vacia";
import { limpiarEquipo } from "./equipo-de-prueba";

// Mover dentro del nivel contra el Postgres local. Los perfiles de prueba van
// sin nivel todavía: ese grupo es solo de ellos, y los 15 de la migración no
// se tocan. Se borran antes y después.

cargarEntorno({ path: [".env.local"], quiet: true });
const sinBase = { skip: !process.env.DATABASE_URL && "sin DATABASE_URL" };
const PREFIJO = "prueba-mover-perfil";

async function modulos() {
  const { base } = await import("@/datos/cliente");
  return { base, ...(await import("./editar-equipo")), ...(await import("./mover-equipo")) };
}

before(async () => {
  if (process.env.DATABASE_URL) await limpiarEquipo((await modulos()).base, PREFIJO);
});
after(async () => {
  if (process.env.DATABASE_URL) await limpiarEquipo((await modulos()).base, PREFIJO);
});

test("un paso dentro del nivel, cambiando con el de al lado; en la punta no se mueve", sinBase, async () => {
  const { base, crearPersonaEnBase, moverPersonaEnBase } = await modulos();
  const crear = async (letra: string) => {
    const r = await crearPersonaEnBase(base, { contenido: { ...personaVacia(), slug: `${PREFIJO}-${letra}`, nombre: `Prueba ${letra}` }, quien: "Ana" });
    return r.ok ? r.id : assert.fail(r.detalle);
  };
  const a = await crear("a");
  const b = await crear("b");
  const orden = async () =>
    (await base.persona.findMany({ where: { slug: null, borrador: { path: ["slug"], string_starts_with: PREFIJO } }, orderBy: { orden: "asc" }, select: { id: true } })).map((f) => f.id);
  assert.deepEqual(await orden(), [a, b]);
  assert.deepEqual(await moverPersonaEnBase(base, { id: b, hacia: "antes" }), { ok: true, movio: true, nombre: "Prueba b" });
  assert.deepEqual(await orden(), [b, a]);
  assert.deepEqual(await moverPersonaEnBase(base, { id: b, hacia: "antes" }), { ok: true, movio: false, nombre: "Prueba b" });
  assert.deepEqual(await moverPersonaEnBase(base, { id: b, hacia: "despues" }), { ok: true, movio: true, nombre: "Prueba b" });
  assert.deepEqual(await orden(), [a, b]);
});
