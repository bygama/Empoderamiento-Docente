import { after, test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { config as cargarEntorno } from "dotenv";
import { TIPOS_DE_ACTIVIDAD } from "@/datos/actividad";

// Contra la base de verdad: los filtros y el paginado son SQL. Cada test mira
// solo la actividad de sus cuentas (filtro por persona), así no depende de lo
// que ya haya en la base.
cargarEntorno({ path: [".env.local"], quiet: true });
const hayBase = Boolean(process.env.DATABASE_URL);
const sinBase = { skip: !hayBase && "sin DATABASE_URL" };

const creadas: string[] = [];
const TODOS = TIPOS_DE_ACTIVIDAD;

async function cuenta(nombre: string): Promise<string> {
  const { base } = await import("@/datos/cliente");
  const id = randomUUID();
  creadas.push(id);
  await base.user.create({ data: { id, name: nombre, email: `prueba-${id}@ed.test` } });
  return id;
}

after(async () => {
  if (!hayBase) return;
  const { base } = await import("@/datos/cliente");
  await base.actividad.deleteMany({ where: { cuentaId: { in: creadas } } });
  await base.user.deleteMany({ where: { id: { in: creadas } } });
  await base.$disconnect();
});

test("filtra por tipos, por persona, desde una fecha y por texto en el sobre o en el nombre", sinBase, async () => {
  const { base } = await import("@/datos/cliente");
  const { listarActividad } = await import("./actividad");
  const ana = await cuenta("Ana Filtros");
  const hace = (dias: number) => new Date(Date.now() - dias * 86_400_000);
  await base.actividad.createMany({
    data: [
      { cuentaId: ana, tipo: "entro", en: hace(40) },
      { cuentaId: ana, tipo: "invito", sobre: "Juan Pérez", en: hace(2) },
      { cuentaId: ana, tipo: "suspendio", sobre: "Luz Gómez", en: hace(1) },
    ],
  });
  const tipos = (await listarActividad("administra", { tipos: TODOS, persona: ana, pagina: 1 })).filas.map((f) => f.tipo);
  assert.deepEqual(tipos, ["suspendio", "invito", "entro"]);
  assert.equal((await listarActividad("administra", { tipos: ["invito"], persona: ana, pagina: 1 })).total, 1);
  assert.equal((await listarActividad("administra", { tipos: TODOS, persona: ana, dias: 7, pagina: 1 })).total, 2);
  assert.deepEqual((await listarActividad("administra", { tipos: TODOS, persona: ana, texto: "pérez", pagina: 1 })).filas.map((f) => f.sobre), ["Juan Pérez"]);
  assert.equal((await listarActividad("administra", { tipos: TODOS, persona: ana, texto: "ana filt", pagina: 1 })).total, 3);
  assert.equal((await listarActividad("administra", { tipos: [], persona: ana, pagina: 1 })).total, 0);
});

test("pagina de a 50, la más nueva arriba, y una página que no existe muestra la última", sinBase, async () => {
  const { base } = await import("@/datos/cliente");
  const { listarActividad, POR_PAGINA } = await import("./actividad");
  const leo = await cuenta("Leo Paginas");
  const inicio = Date.now() - 1_000_000;
  await base.actividad.createMany({ data: Array.from({ length: 55 }, (_, i) => ({ cuentaId: leo, tipo: "entro", en: new Date(inicio + i * 1000) })) });
  const primera = await listarActividad("administra", { tipos: TODOS, persona: leo, pagina: 1 });
  assert.equal(POR_PAGINA, 50);
  assert.deepEqual([primera.total, primera.paginas, primera.filas.length], [55, 2, 50]);
  assert.ok(new Date(primera.filas[0]?.en ?? 0) > new Date(primera.filas[49]?.en ?? 0));
  const segunda = await listarActividad("administra", { tipos: TODOS, persona: leo, pagina: 9 });
  assert.deepEqual([segunda.pagina, segunda.filas.length], [2, 5]);
});

test("sin usarCuentas no lee nada, aunque pida tipos que su rol ve en otro lado", sinBase, async () => {
  const { base } = await import("@/datos/cliente");
  const { listarActividad } = await import("./actividad");
  const mia = await cuenta("Mia Sinpermiso");
  await base.actividad.createMany({ data: [{ cuentaId: mia, tipo: "publico-una-pagina", sobre: "Inicio", sobreId: "inicio" }, { cuentaId: mia, tipo: "invito", sobre: "Juan" }] });
  assert.equal((await listarActividad("administra", { tipos: TODOS, persona: mia, pagina: 1 })).total, 2);
  for (const rol of ["edita", undefined, "otro"]) {
    assert.deepEqual(await listarActividad(rol, { tipos: TODOS, persona: mia, pagina: 1 }), { filas: [], total: 0, pagina: 1, paginas: 1 });
  }
});
