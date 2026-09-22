import { test } from "node:test";
import assert from "node:assert/strict";
import { SLUGS } from "@/contenido/paginas";
import { arbolDelSitio } from "./arbol";

test("las siete páginas, en el orden del registro", () => {
  assert.deepEqual(
    arbolDelSitio(null).map((p) => p.slug),
    SLUGS,
  );
});

test("cada página trae sus secciones registradas, y solo esas", () => {
  const [inicio, ...resto] = arbolDelSitio(null);
  assert.deepEqual(inicio.secciones, [{ clave: "hero", nombre: "Hero" }]);
  for (const pagina of resto) assert.deepEqual(pagina.secciones, [], pagina.slug);
});

test("marca sin publicar solo las páginas con cambios", () => {
  const arbol = arbolDelSitio(new Set(["inicio"] as const));
  assert.equal(arbol.find((p) => p.slug === "inicio")?.sinPublicar, true);
  assert.ok(arbol.filter((p) => p.slug !== "inicio").every((p) => p.sinPublicar === false));
});

test("sin respuesta de la base, no marca nada en vez de marcar todo como publicado", () => {
  assert.ok(arbolDelSitio(null).every((p) => p.sinPublicar === null));
});
