import { test } from "node:test";
import assert from "node:assert/strict";
import { recortarComoBuscador } from "./buscador";

test("recortarComoBuscador deja entero lo que entra y corta en una palabra lo que no", () => {
  assert.equal(recortarComoBuscador("Corto", 60), "Corto");
  assert.equal(recortarComoBuscador("Empoderamiento Docente — Transformamos el aprendizaje", 30), "Empoderamiento Docente —…");
  assert.equal(recortarComoBuscador("Unapalabramuylargasinespacios", 10), "Unapalabra…");
});
