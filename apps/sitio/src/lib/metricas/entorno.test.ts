import { afterEach, test } from "node:test";
import assert from "node:assert/strict";
import { clienteDesdeEntorno, fuenteDeVisitas, fuenteEsperada } from "./entorno";

// La regla de la fuente activa, y que el cliente de la copia sea el de esa
// fuente: se ve en a quién le pide (un fetch falso que anota la URL y contesta
// 500, así no sale nada a la red).

const UMAMI = { UMAMI_API_URL: "http://analitica:3000", UMAMI_API_KEY: "k", UMAMI_WEBSITE_ID: "s-1" };
const VERCEL = { VERCEL_TOKEN: "t", VERCEL_ANALYTICS_PROJECT_ID: "prj_x" };

const fetchDeVerdad = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = fetchDeVerdad;
});

/** A qué servidor le pide el cliente que arma el entorno, o `null` si no arma ninguno. */
async function aQuienLePide(entorno: Record<string, string>): Promise<string | null> {
  const pedidas: string[] = [];
  globalThis.fetch = (async (url: string | URL) => {
    pedidas.push(String(url));
    return new Response("{}", { status: 500 });
  }) as typeof fetch;
  const cliente = clienteDesdeEntorno(entorno);
  if (!cliente) return null;
  await assert.rejects(cliente.ventana({ desde: "2026-09-01", hasta: "2026-09-07" }));
  return new URL(pedidas[0]).origin;
}

test("en Vercel con solo sus variables, Vercel, como antes", async () => {
  const entorno = { VERCEL: "1", ...VERCEL };
  assert.equal(fuenteDeVisitas(entorno), "vercel");
  assert.equal(await aQuienLePide(entorno), "https://api.vercel.com");
});

test("con las variables de Umami, Umami, esté donde esté", async () => {
  assert.equal(fuenteDeVisitas(UMAMI), "umami");
  assert.equal(await aQuienLePide(UMAMI), "http://analitica:3000");
});

test("con los dos juegos, Umami también en Vercel: la copia y el script leen la misma", async () => {
  const entorno = { VERCEL: "1", ...VERCEL, ...UMAMI };
  assert.equal(fuenteDeVisitas(entorno), "umami");
  assert.equal(await aQuienLePide(entorno), "http://analitica:3000");
});

test("las de Vercel fuera de Vercel, Vercel sin su token, o una fuente a medias, no arman ninguna", async () => {
  assert.equal(fuenteDeVisitas(VERCEL), null);
  assert.equal(await aQuienLePide(VERCEL), null);
  // En Vercel sin el token ni el proyecto no hay copia (el script sí carga: script.test.ts).
  assert.equal(fuenteDeVisitas({ VERCEL: "1" }), null);
  assert.equal(await aQuienLePide({ VERCEL: "1" }), null);
  assert.equal(fuenteDeVisitas({ VERCEL: "1", VERCEL_TOKEN: "t" }), null);
  const umamiAMedias = { VERCEL: "1", ...VERCEL, UMAMI_WEBSITE_ID: "s-1" };
  assert.equal(fuenteDeVisitas(umamiAMedias), "vercel");
  assert.equal(fuenteDeVisitas({}), null);
  assert.equal(await aQuienLePide({}), null);
});

test("sin ninguna, la que se nombra es la del host", () => {
  assert.equal(fuenteEsperada({ VERCEL: "1" }), "vercel");
  assert.equal(fuenteEsperada({}), "umami");
  assert.equal(fuenteEsperada(VERCEL), "umami");
});
