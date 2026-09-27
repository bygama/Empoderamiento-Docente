import { test } from "node:test";
import assert from "node:assert/strict";
import { fraseDeLaCurva, techoDe, trazosDe } from "./calculos";

test("el tope del eje es 1, 2 o 5 por una potencia de diez", () => {
  assert.equal(techoDe(0), 1);
  assert.equal(techoDe(7), 10);
  assert.equal(techoDe(41), 50);
  assert.equal(techoDe(130), 200);
  assert.equal(techoDe(500), 500);
});

test("la línea se corta donde no hay dato, y el área baja al piso en cada tramo", () => {
  const { linea, area } = trazosDe(
    [
      { dia: "2026-09-01", valor: null },
      { dia: "2026-09-02", valor: 5 },
      { dia: "2026-09-03", valor: 10 },
    ],
    10,
  );
  assert.equal(linea, "M 50.00 50.00 L 100.00 0.00");
  assert.equal(area, "M 50.00 100 L 50.00 50.00 L 100.00 0.00 L 100.00 100 Z");
});

test("la frase dice el rango, el mínimo, el máximo y el día del pico", () => {
  const frase = fraseDeLaCurva("Visitantes por día", [
    { dia: "2026-09-01", valor: 3 },
    { dia: "2026-09-02", valor: 41 },
    { dia: "2026-09-03", valor: 12 },
  ]);
  assert.equal(frase, "Visitantes por día del 1 de septiembre al 3 de septiembre: entre 3 y 41, con el pico el 2 de septiembre.");
  assert.equal(fraseDeLaCurva("Visitantes por día", [{ dia: "2026-09-01", valor: null }]), "Visitantes por día: todavía no hay datos.");
});
