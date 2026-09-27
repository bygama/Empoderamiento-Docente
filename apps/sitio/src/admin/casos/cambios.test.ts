import { test } from "node:test";
import assert from "node:assert/strict";
import type { BorradorDeCaso } from "@/features/investigacion/contenido/caso";
import { cambiosDelCaso } from "./cambios";

const caso: BorradorDeCaso = {
  slug: "un-caso",
  pregunta: "¿Una pregunta?",
  eje: "Un eje",
  indicio: "Un indicio",
  periodo: "2025",
  ambito: "Secundaria",
  estado: "EN CURSO",
  contexto: "Un contexto.",
  preguntaInvestigacion: "¿Otra pregunta?",
  lamina: { foto: { src: "/investigacion/caso-01-lamina.webp", alt: "Una lámina", foco: { x: 0.5, y: 0.5 } }, sujecion: "clip", rotulo: "LÁMINA 01" },
  evidencias: [{ titulo: "SEMINARIOS", descripcion: "Una.", movible: true }],
  analisis: "Un análisis.",
  aprendizaje: "Algo.",
  queCambio: "Algo cambió.",
  produccionRelacionada: [],
  esDemo: false,
  aclaracion: "",
};

test("lo igual no es un cambio; lo distinto, campo por campo y con sus etiquetas", () => {
  assert.deepEqual(cambiosDelCaso(caso, caso), []);
  const cambios = cambiosDelCaso(caso, {
    ...caso,
    estado: "CERRADO",
    lamina: { ...caso.lamina, sujecion: "cinta" },
    evidencias: [...caso.evidencias, { titulo: "TUTORÍAS", descripcion: "Dos.", movible: false }],
  });
  assert.deepEqual(
    cambios.map((c) => [c.donde.join(" › "), c.antes, c.despues]),
    [
      ["Estado", { tipo: "texto", texto: "En curso" }, { tipo: "texto", texto: "Cerrado" }],
      ["Lámina › Sujeción", { tipo: "texto", texto: "Con un clip" }, { tipo: "texto", texto: "Con cinta" }],
      ["Evidencias › Evidencia 2 › Título", { tipo: "nada" }, { tipo: "texto", texto: "TUTORÍAS" }],
      ["Evidencias › Evidencia 2 › Descripción", { tipo: "nada" }, { tipo: "texto", texto: "Dos." }],
      ["Evidencias › Evidencia 2 › Se puede arrastrar", { tipo: "nada" }, { tipo: "texto", texto: "No" }],
    ],
  );
});
