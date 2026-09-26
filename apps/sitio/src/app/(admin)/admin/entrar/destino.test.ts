import { test } from "node:test";
import assert from "node:assert/strict";
import { destinoSeguro } from "./destino";

test("vuelve solo a rutas del admin, y nunca a entrar", () => {
  assert.equal(destinoSeguro("/admin/cuentas/abc"), "/admin/cuentas/abc");
  assert.equal(destinoSeguro("/admin"), "/admin");
  for (const volver of [null, "https://otro.test/admin", "//otro.test/admin", "/adminx", "/admin/entrar", "/admin/entrar/codigo"]) {
    assert.equal(destinoSeguro(volver), "/admin", String(volver));
  }
});
