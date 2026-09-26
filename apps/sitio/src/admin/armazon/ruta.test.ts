import { test } from "node:test";
import assert from "node:assert/strict";
import { estaEn } from "./ruta";

test("la pestaña se enciende en su ruta y en lo que cuelga de ella", () => {
  assert.equal(estaEn("/admin/contenido/paginas", "/admin/contenido/paginas"), true);
  assert.equal(estaEn("/admin/contenido/paginas/inicio", "/admin/contenido/paginas"), true);
});

test("no se enciende en una ruta hermana ni en la del módulo", () => {
  assert.equal(estaEn("/admin/contenido/paginas-viejas", "/admin/contenido/paginas"), false);
  assert.equal(estaEn("/admin/contenido", "/admin/contenido/paginas"), false);
});
