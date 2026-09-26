import { test } from "node:test";
import assert from "node:assert/strict";
import { esPdf } from "./pdf";

test("un PDF se reconoce por sus bytes, no por su nombre", () => {
  const bytes = (texto: string) => new TextEncoder().encode(texto);
  assert.equal(esPdf(bytes("%PDF-1.7\n%âãÏÓ")), true);
  assert.equal(esPdf(bytes("<html>%PDF-")), false);
  assert.equal(esPdf(bytes("%PDF")), false);
  assert.equal(esPdf(new Uint8Array([0x89, 0x50, 0x4e, 0x47])), false);
});
