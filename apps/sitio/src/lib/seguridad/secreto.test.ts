import { test } from "node:test";
import assert from "node:assert/strict";
import { esElSecreto } from "./secreto";

test("solo el secreto exacto pasa, sea del largo que sea lo que llega", () => {
  assert.equal(esElSecreto("Bearer abc123", "Bearer abc123"), true);
  assert.equal(esElSecreto("Bearer abc124", "Bearer abc123"), false);
  assert.equal(esElSecreto("Bearer abc12", "Bearer abc123"), false);
  assert.equal(esElSecreto("Bearer abc1234", "Bearer abc123"), false);
  assert.equal(esElSecreto(null, "Bearer abc123"), false);
});

test("sin secreto configurado no pasa nada, ni lo vacío", () => {
  assert.equal(esElSecreto("", ""), false);
  assert.equal(esElSecreto("Bearer ", null), false);
});
