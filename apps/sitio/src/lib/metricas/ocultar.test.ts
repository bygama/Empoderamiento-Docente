import { test } from "node:test";
import assert from "node:assert/strict";
import { ocultarMenores } from "./ocultar";

test("lo que no llega al mínimo se junta en «Otros», sin su nombre", () => {
  const { visibles, ocultos } = ocultarMenores(
    [
      { valor: "AR", total: 40 },
      { valor: "CO", total: 3 },
      { valor: "BO", total: 2 },
      { valor: "IS", total: 1 },
    ],
    3,
  );
  assert.deepEqual(
    visibles.map((v) => v.valor),
    ["AR", "CO"],
  );
  assert.deepEqual(ocultos, { cuantos: 2, total: 3 });
});
