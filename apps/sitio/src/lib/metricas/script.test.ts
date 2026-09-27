import { test } from "node:test";
import assert from "node:assert/strict";
import { scriptDeAnalitica } from "./script";

const PRODUCCION = { NODE_ENV: "production" };

test("fuera de Vercel con el sitio de Umami, el de Umami", () => {
  assert.deepEqual(scriptDeAnalitica({ ...PRODUCCION, UMAMI_WEBSITE_ID: "s-1" }), { tipo: "umami", sitio: "s-1" });
});

test("en Vercel, el de Vercel, aunque estén las variables de Umami", () => {
  assert.deepEqual(scriptDeAnalitica({ ...PRODUCCION, VERCEL: "1" }), { tipo: "vercel" });
  assert.deepEqual(scriptDeAnalitica({ ...PRODUCCION, VERCEL: "1", UMAMI_WEBSITE_ID: "s-1" }), { tipo: "vercel" });
});

test("sin ninguno de los dos, o fuera de producción, ninguno", () => {
  assert.equal(scriptDeAnalitica(PRODUCCION), null);
  assert.equal(scriptDeAnalitica({ NODE_ENV: "development", UMAMI_WEBSITE_ID: "s-1" }), null);
  assert.equal(scriptDeAnalitica({ NODE_ENV: "development", VERCEL: "1" }), null);
});
