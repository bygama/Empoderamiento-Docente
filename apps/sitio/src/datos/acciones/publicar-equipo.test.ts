import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { config as cargarEntorno } from "dotenv";
import { limpiarEquipo, materialDePrueba, perfil } from "./equipo-de-prueba";

// Publicar y despublicar un perfil del Equipo contra el Postgres local, con
// los 15 de la migración como vecinos (la Dirección general y la Dirección ya
// están llenas). Lo de prueba se borra antes y después.

cargarEntorno({ path: [".env.local"], quiet: true });
const sinBase = { skip: !process.env.DATABASE_URL && "sin DATABASE_URL" };
const PREFIJO = "prueba-publicar-perfil";

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

test("publicar copia a columnas, deja al perfil último en su nivel, y otra URL deja el 308", sinBase, async () => {
  const { base, crearPersonaEnBase, guardarPersonaEnBase, publicarPersonaEnBase } = await modulos();
  const creado = await crearPersonaEnBase(base, { contenido: perfil("prueba-publicar-perfil-c", 4), quien: "Ana" });
  if (!creado.ok) return assert.fail(creado.detalle);
  const publicado = await publicarPersonaEnBase(base, { id: creado.id, borradorEnVisto: creado.borradorEn, quien: "Ana" });
  assert.equal(publicado.ok, true);
  // «Último» contra los perfiles que no son de prueba: otros tests suman y borran los suyos en el nivel 4 en el medio.
  const { _max } = await base.persona.aggregate({ where: { nivel: 4, NOT: { slug: { startsWith: "prueba-" } } }, _max: { orden: true } });
  const fila = await base.persona.findUnique({ where: { id: creado.id } });
  assert.deepEqual([fila?.publicado, fila?.nivel, fila?.titular], [true, 4, null]);
  assert.ok((fila?.orden ?? -1) > (_max.orden ?? -1), `orden ${fila?.orden}, el último de los de verdad ${_max.orden}`);
  const otraUrl = await guardarPersonaEnBase(base, { id: creado.id, contenido: perfil("prueba-publicar-perfil-d", 4), borradorEnVisto: null, quien: "Ana" });
  if (!otraUrl.ok) return assert.fail(otraUrl.detalle);
  await publicarPersonaEnBase(base, { id: creado.id, borradorEnVisto: otraUrl.borradorEn, quien: "Ana" });
  assert.equal((await base.redireccion.findUnique({ where: { desde: "/quienes-somos/equipo/prueba-publicar-perfil-c" } }))?.hacia, "/quienes-somos/equipo/prueba-publicar-perfil-d");
});

test("la Dirección general lleva una sola persona y la Dirección, tres", sinBase, async () => {
  const { base, crearPersonaEnBase, publicarPersonaEnBase } = await modulos();
  // En el orden del sitio: Wendolyne Ríos va entre Karla y Raquel (migración 20261001134000).
  for (const [nivel, quienes] of [[1, /hoy es Daniela Reyes/], [2, /Dirección lleva 3 personas en el sitio, y hoy son Karla Gómez, Wendolyne Ríos y Raquel Ayala/]] as const) {
    const creado = await crearPersonaEnBase(base, { contenido: perfil(`prueba-publicar-perfil-nivel-${nivel}`, nivel), quien: "Ana" });
    if (!creado.ok) return assert.fail(creado.detalle);
    const r = await publicarPersonaEnBase(base, { id: creado.id, borradorEnVisto: creado.borradorEn, quien: "Ana" });
    assert.match(!r.ok ? r.detalle : "", quienes);
  }
});

test("una publicación que la persona no firma no se publica; una que firma, sí, con su recorrido", sinBase, async () => {
  const { base, crearPersonaEnBase, guardarPersonaEnBase, publicarPersonaEnBase } = await modulos();
  const creado = await crearPersonaEnBase(base, { contenido: perfil("prueba-publicar-perfil-e", 3), quien: "Ana" });
  if (!creado.ok) return assert.fail(creado.detalle);
  const ajeno = await materialDePrueba(base, `${PREFIJO}-material-e-ajeno`, null);
  const propio = await materialDePrueba(base, `${PREFIJO}-material-e-propio`, creado.id);
  const referencia = (material: string) => [{ origen: "biblioteca" as const, material, detalle: "", conceptos: [], destacada: true }];
  const noFirma = await guardarPersonaEnBase(base, { id: creado.id, contenido: perfil("prueba-publicar-perfil-e", 3, referencia(ajeno)), borradorEnVisto: creado.borradorEn, quien: "Ana" });
  assert.match(!noFirma.ok ? noFirma.detalle : "", /Etapa 1 › Publicación 1 › Material de la Biblioteca — Esta persona no firma ese material/);
  const firma = await guardarPersonaEnBase(base, { id: creado.id, contenido: perfil("prueba-publicar-perfil-e", 3, referencia(propio)), borradorEnVisto: creado.borradorEn, quien: "Ana" });
  if (!firma.ok) return assert.fail(firma.detalle);
  const publicado = await publicarPersonaEnBase(base, { id: creado.id, borradorEnVisto: firma.borradorEn, quien: "Ana" });
  assert.equal(publicado.ok, true);
  const fila = await base.persona.findUnique({ where: { id: creado.id } });
  assert.equal(fila?.titular, "Un titular.");
});

test("despublicar lo saca del sitio y conserva sus columnas", sinBase, async () => {
  const { base, crearPersonaEnBase, publicarPersonaEnBase, despublicarPersonaEnBase } = await modulos();
  const creado = await crearPersonaEnBase(base, { contenido: perfil("prueba-publicar-perfil-f", 4), quien: "Ana" });
  if (!creado.ok) return assert.fail(creado.detalle);
  assert.equal((await despublicarPersonaEnBase(base, { id: creado.id, borradorEnVisto: creado.borradorEn })).ok, false);
  await publicarPersonaEnBase(base, { id: creado.id, borradorEnVisto: creado.borradorEn, quien: "Ana" });
  const r = await despublicarPersonaEnBase(base, { id: creado.id, borradorEnVisto: null });
  assert.match(r.ok ? r.detalle : "", /ya no se ve/);
  assert.deepEqual(await base.persona.findUnique({ where: { id: creado.id }, select: { publicado: true, nombre: true } }), { publicado: false, nombre: "Prueba f" });
});

test("dos que publican a la vez donde queda un solo lugar: entra una", sinBase, async () => {
  const { base, crearPersonaEnBase, publicarPersonaEnBase } = await modulos();
  // Un cupo de un lugar contado solo entre las filas de este test: no toca a nadie de la carga. Sin el candado del
  // Equipo, las dos cuentan cero a la vez y entran las dos.
  const prefijo = `${PREFIJO}-lugar`;
  const cupo = { lugares: () => 1, ocupa: (slug: string | null) => Boolean(slug?.startsWith(prefijo)) };
  const creados = [];
  for (const letra of ["a", "b"]) {
    const r = await crearPersonaEnBase(base, { contenido: perfil(`${prefijo}-${letra}`, 3), quien: "Ana" });
    if (!r.ok) return assert.fail(r.detalle);
    creados.push(r);
  }
  const resultados = await Promise.all(creados.map((r) => publicarPersonaEnBase(base, { id: r.id, borradorEnVisto: r.borradorEn, quien: "Ana", cupo })));
  assert.deepEqual(resultados.map((r) => r.ok).sort(), [false, true]);
  assert.match(resultados.flatMap((r) => (r.ok ? [] : [r.detalle])).join(), /Líderes de área y proyecto lleva una sola persona en el sitio/);
  assert.equal(await base.persona.count({ where: { id: { in: creados.map((r) => r.id) }, publicado: true } }), 1);
});
