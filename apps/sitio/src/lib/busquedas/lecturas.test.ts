import { test } from "node:test";
import assert from "node:assert/strict";
import { casiNosEncuentran, ordenarPorClics, posicionPromedio } from "./lecturas";
import { nombreDelPais } from "./paises";

const fila = (valor: string, clics: number, impresiones: number, posicion: number) => ({ valor, clics, impresiones, sumaDePosiciones: posicion * impresiones });

test("la posición de varios días se promedia por impresión, no como un promedio de promedios", () => {
  const dias = [fila("", 5, 100, 2), fila("", 0, 10, 20)];
  const suma = dias.reduce((s, d) => s + d.sumaDePosiciones, 0);
  const impresiones = dias.reduce((s, d) => s + d.impresiones, 0);
  assert.equal(Math.round(posicionPromedio(suma, impresiones)! * 100) / 100, 3.64);
  assert.equal(posicionPromedio(0, 0), null);
});

test("«Casi nos encuentran» toma los puestos 8 a 20 y lo muy visto y poco tocado, sin el ruido", () => {
  const casi = casiNosEncuentran([
    fila("segunda página", 1, 30, 12),
    fila("se ve y no se toca", 2, 400, 3),
    fila("poco vista", 0, 5, 15),
    fila("va bien", 10, 60, 5),
    fila("las dos cosas", 0, 100, 9),
    fila("puesto 21", 0, 40, 21),
  ]);
  assert.deepEqual(
    casi.map((c) => [c.valor, c.razon]),
    [
      ["se ve y no se toca", "pocos-clics"],
      ["las dos cosas", "puesto"],
      ["segunda página", "puesto"],
    ],
  );
  assert.equal(casi[2].posicion, 12);
});

test("las listas van por clics y, a igual clics, por impresiones", () => {
  const orden = ordenarPorClics([fila("a", 1, 10, 5), fila("b", 3, 5, 5), fila("c", 1, 50, 5)]).map((f) => f.valor);
  assert.deepEqual(orden, ["b", "c", "a"]);
});

test("el país sale en español desde el código de Google", () => {
  assert.equal(nombreDelPais("arg"), "Argentina");
  assert.equal(nombreDelPais("mex"), "México");
  assert.equal(nombreDelPais("chl"), "Chile");
  assert.equal(nombreDelPais("zzz"), "Sin identificar");
  assert.equal(nombreDelPais("qqq"), "QQQ");
});
