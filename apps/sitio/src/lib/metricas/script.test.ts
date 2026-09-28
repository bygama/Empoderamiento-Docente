import { test } from "node:test";
import assert from "node:assert/strict";
import { scriptDeAnalitica } from "./script";

const PRODUCCION = { NODE_ENV: "production" };
const UMAMI = { UMAMI_API_URL: "http://analitica:3000", UMAMI_API_KEY: "k", UMAMI_WEBSITE_ID: "s-1" };
const VERCEL = { VERCEL_TOKEN: "t", VERCEL_ANALYTICS_PROJECT_ID: "prj_x" };

test("con las variables de Umami, el de Umami", () => {
  assert.deepEqual(scriptDeAnalitica({ ...PRODUCCION, ...UMAMI }), { tipo: "umami", sitio: "s-1" });
});

test("en Vercel con sus variables, el de Vercel", () => {
  assert.deepEqual(scriptDeAnalitica({ ...PRODUCCION, VERCEL: "1", ...VERCEL }), { tipo: "vercel" });
});

test("con los dos juegos, el de Umami, que es la fuente que se copia", () => {
  assert.deepEqual(scriptDeAnalitica({ ...PRODUCCION, VERCEL: "1", ...VERCEL, ...UMAMI }), { tipo: "umami", sitio: "s-1" });
});

test("sin una fuente entera, fuera de Vercel con las de Vercel, o fuera de producción, ninguno", () => {
  assert.equal(scriptDeAnalitica(PRODUCCION), null);
  assert.equal(scriptDeAnalitica({ ...PRODUCCION, VERCEL: "1" }), null);
  assert.equal(scriptDeAnalitica({ ...PRODUCCION, UMAMI_WEBSITE_ID: "s-1" }), null);
  assert.equal(scriptDeAnalitica({ ...PRODUCCION, ...VERCEL }), null);
  assert.equal(scriptDeAnalitica({ NODE_ENV: "development", ...UMAMI }), null);
  assert.equal(scriptDeAnalitica({ NODE_ENV: "development", VERCEL: "1", ...VERCEL }), null);
});
