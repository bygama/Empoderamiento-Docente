import { test } from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";
import { problemasDeCompartidos, quienesUsan, rutasQueMuestran } from "./compartido";
import type { RegistroDePaginas, SeccionRegistrada } from "./documento";

const seccion = (usa?: SeccionRegistrada["usa"]): SeccionRegistrada => ({ nombre: "Sección", esquema: z.object({}), inicial: {}, ...(usa ? { usa } : {}) });

// La dueña tiene la sección; la otra la usa; la tercera no tiene nada que ver.
const registro: RegistroDePaginas = {
  duena: { ruta: "/duena", nombre: "Dueña", secciones: { lista: seccion(), propia: seccion() } },
  usa: { ruta: "/", nombre: "Usa", secciones: { lista: seccion({ pagina: "duena", seccion: "lista", que: "Los ítems" }) } },
  aparte: { ruta: "/aparte", nombre: "Aparte", secciones: { otra: seccion() } },
};

test("publicar la dueña regenera su ruta y la de quien usa; publicar quien usa, solo la suya", () => {
  assert.deepEqual(rutasQueMuestran(registro, "duena"), ["/duena", "/"]);
  assert.deepEqual(rutasQueMuestran(registro, "usa"), ["/"]);
  assert.deepEqual(rutasQueMuestran(registro, "aparte"), ["/aparte"]);
  assert.deepEqual(rutasQueMuestran(registro, "no-existe"), []);
});

test("quienesUsan dice qué páginas muestran una sección y qué toman de ella", () => {
  assert.deepEqual(quienesUsan(registro, "duena", "lista"), [{ slug: "usa", nombre: "Usa", que: "Los ítems" }]);
  assert.deepEqual(quienesUsan(registro, "duena", "propia"), []);
});

test("problemasDeCompartidos encuentra lo que apunta mal", () => {
  assert.deepEqual(problemasDeCompartidos(registro), []);
  const mal: RegistroDePaginas = {
    ...registro,
    propia: { ruta: "/propia", nombre: "Propia", secciones: { a: seccion(), b: seccion({ pagina: "propia", seccion: "a", que: "x" }) } },
    fantasma: { ruta: "/fantasma", nombre: "Fantasma", secciones: { c: seccion({ pagina: "duena", seccion: "no-esta", que: "x" }) } },
    cadena: { ruta: "/cadena", nombre: "Cadena", secciones: { d: seccion({ pagina: "usa", seccion: "lista", que: "x" }) } },
  };
  assert.deepEqual(problemasDeCompartidos(mal), [
    "propia.b usa una sección de su propia página",
    "fantasma.c usa duena.no-esta, que no existe",
    "cadena.d usa usa.lista, que a su vez usa otra",
  ]);
});
