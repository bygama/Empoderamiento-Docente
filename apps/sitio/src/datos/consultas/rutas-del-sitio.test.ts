import { test } from "node:test";
import assert from "node:assert/strict";
import { PAGINAS } from "@/contenido/paginas";
import { rutasDelSitio } from "./rutas-del-sitio";

// La lista del sitemap, de la indexación y del «hacia» de una redirección.

test("las siete páginas, en el orden del menú, y ni el admin ni la API", async () => {
  const rutas = await rutasDelSitio({});
  assert.deepEqual(rutas.slice(0, 7), ["/", "/que-hacemos", "/quienes-somos", "/investigacion", "/biblioteca", "/novedades", "/contacto"]);
  assert.equal(Object.keys(PAGINAS).length, 7, "cambió el registro de páginas: revisá el orden de arriba");
  assert.ok(rutas.every((r) => r.startsWith("/") && !r.startsWith("/admin") && !r.startsWith("/api")));
  assert.equal(new Set(rutas).size, rutas.length, "hay una ruta repetida");
});

test("las fichas de novedad que existen entran", async () => {
  assert.ok((await rutasDelSitio({})).some((r) => r.startsWith("/novedades/")));
});

test("«Sumate al equipo» entra solo con el formulario de CV abierto", async () => {
  assert.ok(!(await rutasDelSitio({})).includes("/sumate-al-equipo"));
  assert.ok(!(await rutasDelSitio({ CV_ABIERTO: "no" })).includes("/sumate-al-equipo"));
  assert.ok((await rutasDelSitio({ CV_ABIERTO: "si" })).includes("/sumate-al-equipo"));
});
