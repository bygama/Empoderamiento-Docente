import { test } from "node:test";
import assert from "node:assert/strict";
import { borradorVacio } from "@/features/biblioteca/contenido/modelo";
import { cambiosDeMaterial } from "./cambios";
import { aDocumento, aFormulario } from "./formulario";

const publicado = {
  ...borradorVacio(),
  titulo: "Un libro",
  autorias: [{ nombre: "Daniela Reyes-Gasperini", persona: "daniela-reyes" }],
  tipo: "Libros" as const,
  fecha: "2025-12",
  paginas: 120,
};

test("qué cambió, campo por campo y con las etiquetas del formulario", () => {
  assert.deepEqual(cambiosDeMaterial(publicado, publicado), []);
  const cambios = cambiosDeMaterial(publicado, { ...publicado, fecha: "2026", autorias: [...publicado.autorias, { nombre: "Ana Pérez", persona: null }], cita: "Otra." }, () => "Daniela Reyes");
  assert.deepEqual(
    cambios.map((c) => [c.donde.join(" › "), c.antes, c.despues]),
    [
      ["Fecha", { tipo: "texto", texto: "Dic 2025" }, { tipo: "texto", texto: "2026" }],
      ["Autores", { tipo: "texto", texto: "Daniela Reyes-Gasperini (Daniela Reyes)" }, { tipo: "texto", texto: "Daniela Reyes-Gasperini (Daniela Reyes)\nAna Pérez" }],
      ["Cómo se lee la firma", { tipo: "texto", texto: "Daniela Reyes-Gasperini" }, { tipo: "texto", texto: "Daniela Reyes-Gasperini y Ana Pérez" }],
      ["Cita APA", { tipo: "texto", texto: "La generada" }, { tipo: "texto", texto: "Otra." }],
    ],
  );
});

test("el formulario va y vuelve: las páginas como texto y las autorías con su clave", () => {
  const form = aFormulario(publicado);
  assert.equal(form.paginas, "120");
  assert.equal(form.autorias[0].clave, "a0");
  assert.deepEqual(aDocumento(form), publicado);
  assert.equal(aDocumento({ ...form, paginas: "" }).paginas, null);
});
