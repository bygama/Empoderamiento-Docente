import { test } from "node:test";
import assert from "node:assert/strict";
import { moduloDe, pantallaDe } from "./modulos";

const ninguna = new Set<string>();

test("lo de Contenido lleva a lo que no se borra: una página o un caso; un aliado o una foto, no", () => {
  assert.deepEqual(pantallaDe({ tipo: "publico-una-pagina", sobreId: "inicio" }, ninguna), { href: "/admin/contenido/paginas/inicio", que: "Ver la página" });
  assert.deepEqual(pantallaDe({ tipo: "publico-un-caso", sobreId: "caso-01" }, ninguna), { href: "/admin/contenido/casos/caso-01", que: "Ver el caso" });
  // El 02 y el 03 salieron por migración: lo que se anotó de ellos no lleva a una ficha que da 404.
  assert.equal(pantallaDe({ tipo: "publico-un-caso", sobreId: "caso-02" }, ninguna), null);
  assert.equal(pantallaDe({ tipo: "descarto-cambios-de-un-caso", sobreId: "caso-03" }, ninguna), null);
  assert.equal(pantallaDe({ tipo: "autorizo-un-aliado", sobreId: "b9f1c2d0-0000-4000-8000-000000000000" }, ninguna), null);
  assert.equal(pantallaDe({ tipo: "reemplazo-una-foto", sobreId: "b9f1c2d0-0000-4000-8000-000000000001" }, ninguna), null);
  for (const tipo of ["publico-un-caso", "borro-un-aliado", "subio-una-foto"] as const) assert.equal(moduloDe(tipo), "contenido");
});
