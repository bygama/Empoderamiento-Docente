import { test } from "node:test";
import assert from "node:assert/strict";
import { areasInicial } from "@/features/que-hacemos/contenido/areas";
import { areasDeInicio } from "./compartido";

test("Inicio toma de cada área de Qué hacemos solo su título, su frase y su detalle, en orden", () => {
  const cartas = areasDeInicio(areasInicial);
  assert.equal(cartas.length, areasInicial.areas.length);
  assert.deepEqual(cartas[0], {
    titulo: "Desarrollo profesional docente",
    frase: "La experiencia como fuente de reflexión",
    detalle: areasInicial.areas[0].detalle,
  });
  assert.deepEqual(
    cartas.map((c) => Object.keys(c).sort()),
    cartas.map(() => ["detalle", "frase", "titulo"]),
  );
});
