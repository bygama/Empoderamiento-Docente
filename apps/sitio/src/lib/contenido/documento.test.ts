import { test } from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";
import { textoCorto } from "./campos";
import { comoDocumento, completarPagina, type PaginaRegistrada } from "./documento";

const pagina: PaginaRegistrada = {
  ruta: "/prueba",
  nombre: "Prueba",
  secciones: {
    bloque: { nombre: "Bloque", esquema: z.object({ titulo: textoCorto({ maximo: 10 }) }), inicial: { titulo: "Inicial" } },
  },
};

test("comoDocumento solo acepta un objeto", () => {
  assert.deepEqual(comoDocumento(null), {});
  assert.deepEqual(comoDocumento([1]), {});
  assert.deepEqual(comoDocumento("x"), {});
  assert.deepEqual(comoDocumento({ a: 1 }), { a: 1 });
});

test("una sección que falta vuelve al inicial, sin aviso", () => {
  const avisos: string[] = [];
  assert.deepEqual(completarPagina(pagina, {}, (m) => avisos.push(m)), { bloque: { titulo: "Inicial" } });
  assert.equal(avisos.length, 0);
});

test("una sección válida se usa tal cual; una inválida vuelve al inicial y avisa", () => {
  const avisos: string[] = [];
  assert.deepEqual(completarPagina(pagina, { bloque: { titulo: "Nuevo" } }, (m) => avisos.push(m)), { bloque: { titulo: "Nuevo" } });
  assert.deepEqual(completarPagina(pagina, { bloque: { titulo: "" } }, (m) => avisos.push(m)), { bloque: { titulo: "Inicial" } });
  assert.equal(avisos.length, 1);
  assert.match(avisos[0], /Bloque/);
});

test("las secciones que no están en el registro se descartan", () => {
  assert.deepEqual(completarPagina(pagina, { bloque: { titulo: "Ok" }, vieja: 1 }, () => {}), { bloque: { titulo: "Ok" } });
});
