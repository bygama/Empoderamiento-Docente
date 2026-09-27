import { test } from "node:test";
import assert from "node:assert/strict";
import { estaEn, pestanaActiva } from "./ruta";

test("la pestaña se enciende en su ruta y en lo que cuelga de ella", () => {
  assert.equal(estaEn("/admin/contenido/paginas", "/admin/contenido/paginas"), true);
  assert.equal(estaEn("/admin/contenido/paginas/inicio", "/admin/contenido/paginas"), true);
});

test("no se enciende en una ruta hermana ni en la del módulo", () => {
  assert.equal(estaEn("/admin/contenido/paginas-viejas", "/admin/contenido/paginas"), false);
  assert.equal(estaEn("/admin/contenido", "/admin/contenido/paginas"), false);
});

const METRICAS = ["/admin/metricas", "/admin/metricas/busquedas", "/admin/metricas/origen"];

test("gana la más específica: en su ruta exacta y en una subruta", () => {
  assert.equal(pestanaActiva("/admin/metricas", METRICAS), "/admin/metricas");
  assert.equal(pestanaActiva("/admin/metricas/busquedas", METRICAS), "/admin/metricas/busquedas");
  assert.equal(pestanaActiva("/admin/metricas/busquedas/algo", METRICAS), "/admin/metricas/busquedas");
});

test("un prefijo que no corta en un segmento no cuenta, y sin coincidencia no hay activa", () => {
  assert.equal(pestanaActiva("/admin/metricas/busquedas-viejas", METRICAS), "/admin/metricas");
  assert.equal(pestanaActiva("/admin/metricasx", METRICAS), undefined);
  assert.equal(pestanaActiva("/admin/contenido", METRICAS), undefined);
});

test("en el editor de una página, la pestaña de la pantalla y no también la de Secciones", () => {
  const editor = ["/admin/contenido/paginas/inicio", "/admin/contenido/paginas/inicio/seo", "/admin/contenido/paginas/inicio/cambios"];
  assert.equal(pestanaActiva("/admin/contenido/paginas/inicio", editor), "/admin/contenido/paginas/inicio");
  assert.equal(pestanaActiva("/admin/contenido/paginas/inicio/seo", editor), "/admin/contenido/paginas/inicio/seo");
});
