import { test } from "node:test";
import assert from "node:assert/strict";
import { filaDeLinksRotos } from "./de-la-biblioteca";

test("la fila del Inicio: cuántos materiales tienen el link roto y cuáles; sin ninguno, no hay fila", () => {
  assert.equal(filaDeLinksRotos([]), null);
  assert.deepEqual(filaDeLinksRotos(["Un libro"]), { titulo: "1 material con el link roto", detalle: "«Un libro»" });
  assert.deepEqual(filaDeLinksRotos(["A", "B"]), { titulo: "2 materiales con el link roto", detalle: "«A» y «B»" });
});
