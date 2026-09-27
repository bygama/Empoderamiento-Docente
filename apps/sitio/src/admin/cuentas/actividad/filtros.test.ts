import { test } from "node:test";
import assert from "node:assert/strict";
import { conservados, leerFiltros, urlDeActividad } from "./filtros";

test("lee los filtros de la URL e ignora lo que no sirve", () => {
  assert.deepEqual(leerFiltros({ q: "  juan ", persona: "abc", modulo: "cuentas", cuando: "7d", pagina: "2" }), {
    q: "juan",
    persona: "abc",
    modulo: "cuentas",
    cuando: "7d",
    pagina: 2,
  });
  assert.deepEqual(leerFiltros({ q: "", persona: "", modulo: "otro", cuando: "siempre", pagina: "-3" }), {
    q: undefined,
    persona: undefined,
    modulo: undefined,
    cuando: undefined,
    pagina: 1,
  });
  assert.equal(leerFiltros({ pagina: ["3", "4"] }).pagina, 3);
});

test("la URL conserva los filtros y deja afuera lo vacío", () => {
  assert.equal(urlDeActividad({ q: "juan", modulo: "cuentas" }, 2), "/admin/cuentas/actividad?q=juan&modulo=cuentas&pagina=2");
  assert.equal(urlDeActividad({}, 1), "/admin/cuentas/actividad");
  // Buscar conserva los filtros, no la búsqueda ni la página.
  assert.deepEqual(conservados({ q: "juan", persona: "abc", cuando: "7d", pagina: 3 }), { persona: "abc", cuando: "7d" });
});
