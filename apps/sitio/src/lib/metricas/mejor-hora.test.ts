import { test } from "node:test";
import assert from "node:assert/strict";
import { franjasEnPalabras, grillaDeHoras, mejoresFranjas } from "./mejor-hora";

const SANTIAGO = "America/Santiago";

test("la hora UTC pasa a la de Chile con su horario de verano", () => {
  // Chile cambia el 6 de septiembre de 2026: antes UTC−4, después UTC−3.
  const grilla = grillaDeHoras(
    [
      { fecha: "2026-09-01", valor: "12", visitantes: 5 }, // martes, 8 en Chile
      { fecha: "2026-09-15", valor: "12", visitantes: 7 }, // martes, 9 en Chile
    ],
    SANTIAGO,
  );
  assert.equal(grilla[1][8], 5);
  assert.equal(grilla[1][9], 7);
});

test("una hora UTC de la madrugada es la noche anterior en Chile", () => {
  const grilla = grillaDeHoras([{ fecha: "2026-09-15", valor: "02", visitantes: 4 }], SANTIAGO);
  assert.equal(grilla[0][23], 4); // lunes 14, a las 23
});

test("lo que no tiene forma de hora no suma", () => {
  const grilla = grillaDeHoras([{ fecha: "2026-09-15", valor: "", visitantes: 9 }], SANTIAGO);
  assert.equal(grilla.flat().reduce((a, b) => a + b, 0), 0);
});

test("las mejores franjas, de más a menos, y dichas como una costumbre", () => {
  const grilla = Array.from({ length: 7 }, () => Array<number>(24).fill(0));
  grilla[1][10] = 12;
  grilla[2][10] = 12;
  grilla[0][18] = 9;
  grilla[4][7] = 1;
  const mejores = mejoresFranjas(grilla);
  assert.deepEqual(
    mejores.map((f) => [f.dia, f.hora]),
    [
      [1, 10],
      [2, 10],
      [0, 18],
    ],
  );
  assert.equal(franjasEnPalabras(mejores), "los martes de 10 a 11, los miércoles de 10 a 11 y los lunes de 18 a 19");
  assert.equal(franjasEnPalabras(mejores.slice(0, 1)), "los martes de 10 a 11");
});
