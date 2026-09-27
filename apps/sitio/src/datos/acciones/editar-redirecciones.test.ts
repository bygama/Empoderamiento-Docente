import { after, test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { config as cargarEntorno } from "dotenv";

cargarEntorno({ path: [".env.local"], quiet: true });
const sinBase = { skip: !process.env.DATABASE_URL && "sin DATABASE_URL" };

// Agregar y borrar redirecciones a mano contra el Postgres local, con rutas
// propias de esta prueba.
const PREFIJO = `/prueba-redirecciones-${randomUUID()}`;
const RUTAS = ["/", "/contacto"];

after(async () => {
  if (sinBase.skip) return;
  const { base } = await import("@/datos/cliente");
  await base.redireccion.deleteMany({ where: { desde: { startsWith: PREFIJO } } });
  await base.$disconnect();
});

test("una a mano se guarda marcada, el sitio la encuentra, y se borra", sinBase, async () => {
  const { base } = await import("@/datos/cliente");
  const { agregarRedireccionEnBase, borrarRedireccionEnBase } = await import("./editar-redirecciones");
  const { redireccionDe } = await import("@/datos/consultas/redirecciones");
  const desde = `${PREFIJO}/taller`;
  assert.deepEqual(await agregarRedireccionEnBase(base, { desde: `${desde}/`, hacia: "/contacto" }, RUTAS), { ok: true, redireccion: { desde, hacia: "/contacto" } });
  const fila = await base.redireccion.findUniqueOrThrow({ where: { desde } });
  assert.equal(fila.aMano, true);
  assert.equal(await redireccionDe(desde), "/contacto");
  assert.deepEqual(await agregarRedireccionEnBase(base, { desde, hacia: "/" }, RUTAS), {
    ok: false,
    campo: "desde",
    detalle: `Ya hay una redirección desde «${desde}».`,
  });
  assert.deepEqual(await borrarRedireccionEnBase(base, fila.id, RUTAS), {
    ok: true,
    redireccion: { desde, hacia: "/contacto" },
    detalle: `Se borró la redirección desde ${desde}: esa ruta vuelve a dar la página de error.`,
  });
  assert.equal(await redireccionDe(desde), null);
});

test("una automática no se borra desde Ajustes", sinBase, async () => {
  const { base } = await import("@/datos/cliente");
  const { borrarRedireccionEnBase } = await import("./editar-redirecciones");
  const { id } = await base.redireccion.create({ data: { desde: `${PREFIJO}/novedad-vieja`, hacia: "/novedades" } });
  const r = await borrarRedireccionEnBase(base, id, RUTAS);
  assert.equal(r.ok, false);
  assert.ok(await base.redireccion.findUnique({ where: { id } }), "la borró");
});

test("hacia una ruta que no existe no se guarda", sinBase, async () => {
  const { base } = await import("@/datos/cliente");
  const { agregarRedireccionEnBase } = await import("./editar-redirecciones");
  const r = await agregarRedireccionEnBase(base, { desde: `${PREFIJO}/x`, hacia: "/no-existe" }, RUTAS);
  assert.equal(r.ok, false);
  assert.equal(await base.redireccion.count({ where: { desde: `${PREFIJO}/x` } }), 0);
});

test("desde una ruta que el sitio ya contesta no se guarda, y la base no cambia", sinBase, async () => {
  const { base } = await import("@/datos/cliente");
  const { agregarRedireccionEnBase } = await import("./editar-redirecciones");
  // Solo la de esa ruta: los otros tests escriben las suyas a la vez.
  const deAhi = () => base.redireccion.count({ where: { desde: "/sitemap.xml" } });
  const antes = await deAhi();
  const r = await agregarRedireccionEnBase(base, { desde: "/sitemap.xml", hacia: "/contacto" }, RUTAS);
  assert.deepEqual(r, { ok: false, campo: "desde", detalle: "«/sitemap.xml» ya existe en el sitio: una redirección ahí nunca se aplicaría." });
  assert.equal(await deAhi(), antes);
});

test("borrar una que el sitio tapó después dice que no cambia nada", sinBase, async () => {
  const { base } = await import("@/datos/cliente");
  const { borrarRedireccionEnBase } = await import("./editar-redirecciones");
  // Se guardó cuando la ruta no existía; después se publicó una página ahí.
  const desde = `${PREFIJO}/tapada`;
  const { id } = await base.redireccion.create({ data: { desde, hacia: "/contacto", aMano: true } });
  const r = await borrarRedireccionEnBase(base, id, [...RUTAS, desde]);
  assert.deepEqual(r, {
    ok: true,
    redireccion: { desde, hacia: "/contacto" },
    detalle: `Se borró la redirección desde ${desde}, que no se aplicaba: esa ruta la contesta el sitio, y ahí no cambia nada.`,
  });
});
