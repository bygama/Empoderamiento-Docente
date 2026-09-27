import { test } from "node:test";
import assert from "node:assert/strict";
import { sonParecidos } from "./parecidos";

test("el mismo título dicho distinto se parece; dos títulos distintos, no", () => {
  const titulo = "Resignificación del conocimiento matemático escolar en un espacio de desarrollo profesional docente";
  assert.equal(sonParecidos(titulo, "RESIGNIFICACION del conocimiento matematico escolar, en un espacio de desarrollo profesional docente."), true);
  assert.equal(sonParecidos("Empoderamiento docente y Socioepistemología", "Empoderamiento docente y Socioepistemología. Un estudio sobre la transformación educativa en Matemáticas"), true);
  assert.equal(sonParecidos(titulo, "Resignificación del conocimiento matemático en un espacio de desarrollo profesional"), true);
  assert.equal(sonParecidos(titulo, "Una aproximación variacional para la significación de los criterios de la derivada"), false);
  assert.equal(sonParecidos("Geometría", "Geometría analítica y su transposición didáctica"), false);
  assert.equal(sonParecidos("", titulo), false);
});
