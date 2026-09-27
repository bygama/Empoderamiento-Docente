import { test } from "node:test";
import assert from "node:assert/strict";
import { config as cargarEntorno } from "dotenv";
import { PAGINAS } from "@/contenido/paginas";
import { rutasDelSitio } from "./rutas-del-sitio";

// La lista del sitemap, de la indexación y del «hacia» de una redirección.

cargarEntorno({ path: [".env.local"], quiet: true });
const sinBase = { skip: !process.env.DATABASE_URL && "sin DATABASE_URL" };

test("las siete páginas, en el orden del menú, y ni el admin ni la API", async () => {
  const rutas = await rutasDelSitio({});
  assert.deepEqual(rutas.slice(0, 7), ["/", "/que-hacemos", "/quienes-somos", "/investigacion", "/biblioteca", "/novedades", "/contacto"]);
  assert.equal(Object.keys(PAGINAS).length, 7, "cambió el registro de páginas: revisá el orden de arriba");
  assert.ok(rutas.every((r) => r.startsWith("/") && !r.startsWith("/admin") && !r.startsWith("/api")));
  assert.equal(new Set(rutas).size, rutas.length, "hay una ruta repetida");
});

test("las fichas de novedad publicadas entran, las de la base", sinBase, async () => {
  const { slugsConFicha } = await import("./novedades");
  const fichas = (await slugsConFicha()).map((slug) => `/novedades/${slug}`);
  assert.ok(fichas.length > 0, "la base no tiene fichas publicadas: falta la migración de novedades");
  const rutas = await rutasDelSitio({});
  for (const ficha of fichas) assert.ok(rutas.includes(ficha), ficha);
});

test("«Sumate al equipo» entra solo con el formulario de CV abierto", async () => {
  assert.ok(!(await rutasDelSitio({})).includes("/sumate-al-equipo"));
  assert.ok(!(await rutasDelSitio({ CV_ABIERTO: "no" })).includes("/sumate-al-equipo"));
  assert.ok((await rutasDelSitio({ CV_ABIERTO: "si" })).includes("/sumate-al-equipo"));
});
