import { test } from "node:test";
import assert from "node:assert/strict";
import { areasInicial } from "@/features/que-hacemos/contenido/areas";
import { comoTrabajamosInicial } from "@/features/que-hacemos/contenido/como-trabajamos";
import { areasDeInicio, ideasDelMetodo } from "./compartido";

test("Inicio toma de cada área de Qué hacemos solo su título, su nombre corto, su frase y su detalle, en orden", () => {
  const cartas = areasDeInicio(areasInicial);
  assert.equal(cartas.length, areasInicial.areas.length);
  assert.deepEqual(cartas[0], {
    titulo: "Desarrollo profesional docente",
    nombreCorto: "Desarrollo profesional",
    frase: "La experiencia como fuente de reflexión",
    detalle: areasInicial.areas[0].detalle,
  });
  assert.deepEqual(
    cartas.map((c) => Object.keys(c).sort()),
    cartas.map(() => ["detalle", "frase", "nombreCorto", "titulo"]),
  );
});

test("las frases de los pasos de Inicio son las ideas de los primeros verbos de Qué hacemos", () => {
  assert.deepEqual(ideasDelMetodo(comoTrabajamosInicial, 5), [
    "Toda solución nace de una realidad comprendida",
    "La práctica también produce conocimiento",
    "Cada realidad inspira una solución distinta",
    "Vivimos para hacer vivir",
    "La evidencia orienta cada nuevo paso",
  ]);
});
