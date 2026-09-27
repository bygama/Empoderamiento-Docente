import { test } from "node:test";
import assert from "node:assert/strict";
import { unPasoMovido } from "./orden";

test("un lugar, y en la punta nada", () => {
  assert.deepEqual(unPasoMovido(["a", "b", "c"], "b", "antes"), ["b", "a", "c"]);
  assert.deepEqual(unPasoMovido(["a", "b", "c"], "b", "despues"), ["a", "c", "b"]);
  assert.equal(unPasoMovido(["a", "b", "c"], "a", "antes"), null);
  assert.equal(unPasoMovido(["a", "b", "c"], "c", "despues"), null);
  assert.equal(unPasoMovido(["a", "b", "c"], "z", "antes"), undefined);
});
