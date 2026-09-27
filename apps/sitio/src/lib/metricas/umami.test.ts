import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { ErrorDeAnaliticas } from "./cliente";
import { mapearEstadisticas, mapearMetricas, mapearSerie } from "./mapear-umami";
import { crearClienteDeUmami, filtroDeUmami } from "./umami";

// Las respuestas de `__fixtures__/umami/` se grabaron de una instancia local de
// Umami 3.4.0 (la del compose) después de mandarle vistas por Caddy
// (work/deploy-en-vps/PROGRESS.md, paso 6). Así se prueba la forma de verdad.

function grabada(nombre: string): unknown {
  return JSON.parse(readFileSync(path.resolve("src/lib/metricas/__fixtures__/umami", `${nombre}.json`), "utf8"));
}

test("el total por día junta vistas y sesiones por fecha (grabada)", () => {
  const filas = mapearSerie(grabada("pageviews-dia"), "total");
  assert.ok(filas.length > 0);
  for (const f of filas) {
    assert.match(f.fecha, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(f.valor, "");
    assert.ok(f.vistas >= f.visitantes && f.visitantes > 0);
  }
});

test("la hora sale con su día UTC y la hora como valor (grabada)", () => {
  const filas = mapearSerie(grabada("pageviews-hora"), "hora");
  assert.ok(filas.length > 0);
  for (const f of filas) assert.match(f.valor, /^\d{2}$/);
});

test("una dimensión de un día sale con sus vistas y visitantes (grabadas)", () => {
  const paginas = mapearMetricas(grabada("metrics-path"), "2026-09-27", "pagina");
  assert.ok(paginas.some((f) => f.valor === "/"));
  const navegadores = mapearMetricas(grabada("metrics-browser"), "2026-09-27", "navegador");
  assert.ok(navegadores.every((f) => /^[A-Z]/.test(f.valor)), "el navegador sale con su nombre, no con el código de Umami");
  // Umami da las vistas como texto («"3"») y los visitantes como número.
  assert.deepEqual(
    mapearMetricas(grabada("metrics-utm"), "2026-09-27", "campana").map((f) => [f.valor, f.vistas, f.visitantes]),
    [["prueba-local", 1, 1]],
  );
});

test("la ventana lee vistas y visitantes del rango (grabada)", () => {
  const { vistas, visitantes } = mapearEstadisticas(grabada("stats"));
  assert.ok(vistas >= visitantes && visitantes > 0);
});

test("los nombres de Umami se guardan con el nombre de siempre, y laptop suma a desktop", () => {
  const dia = "2026-09-20";
  const dispositivos = mapearMetricas(
    [
      { name: "desktop", pageviews: 3, visitors: 2 },
      { name: "laptop", pageviews: 1, visitors: 1 },
      { name: "mobile", pageviews: 5, visitors: 4 },
    ],
    dia,
    "dispositivo",
  );
  assert.deepEqual(
    dispositivos.map((f) => [f.valor, f.vistas, f.visitantes]),
    [
      ["desktop", 4, 3],
      ["mobile", 5, 4],
    ],
  );
  assert.equal(mapearMetricas([{ name: "Mac OS", pageviews: 1, visitors: 1 }], dia, "sistema")[0].valor, "macOS");
  assert.equal(mapearMetricas([{ name: "Windows 10", pageviews: 1, visitors: 1 }], dia, "sistema")[0].valor, "Windows");
  assert.equal(mapearMetricas([{ name: "crios", pageviews: 1, visitors: 1 }], dia, "navegador")[0].valor, "Chrome");
  assert.equal(mapearMetricas([{ name: "brave", pageviews: 1, visitors: 1 }], dia, "navegador")[0].valor, "Brave");
  // Una visita directa no tiene referido: queda vacío, no «null».
  assert.equal(mapearMetricas([{ name: null, pageviews: 2, visitors: 2 }], dia, "referido")[0].valor, "");
});

test("el filtro por país se arma en la sintaxis de Umami y no acepta otra cosa que códigos", () => {
  assert.equal(filtroDeUmami({ pais: "CL" }), "eq.CL");
  assert.equal(filtroDeUmami({ fueraDe: ["CL", "MX", "AR"] }), "neq.CL,MX,AR");
  assert.throws(() => filtroDeUmami({ pais: "CL&type=x" }));
});

test("cada día de una dimensión es un pedido, con el rango del día entero en UTC y el filtro", async () => {
  const urls: URL[] = [];
  const cliente = crearClienteDeUmami({
    url: "http://analitica:3000",
    apiKey: "k",
    sitio: "s-1",
    fetchImpl: async (entrada, init) => {
      urls.push(new URL(String(entrada)));
      assert.equal(new Headers(init?.headers).get("authorization"), "Bearer k");
      return Response.json([]);
    },
  });
  await cliente.porDia({ desde: "2026-09-01", hasta: "2026-09-03" }, "pagina", { pais: "MX" });
  assert.equal(urls.length, 3);
  const primero = urls.find((u) => u.searchParams.get("startAt") === String(Date.UTC(2026, 8, 1)))!;
  assert.equal(primero.pathname, "/api/websites/s-1/metrics/expanded");
  assert.equal(primero.searchParams.get("endAt"), String(Date.UTC(2026, 8, 2) - 1));
  assert.equal(primero.searchParams.get("type"), "path");
  assert.equal(primero.searchParams.get("country"), "eq.MX");
  assert.equal(primero.searchParams.get("timezone"), "UTC");
});

test("el total y la hora son un pedido por rango a /pageviews; la ventana, a /stats", async () => {
  const urls: URL[] = [];
  const cliente = crearClienteDeUmami({
    url: "http://analitica:3000",
    apiKey: "k",
    sitio: "s-1",
    fetchImpl: async (entrada) => {
      const u = new URL(String(entrada));
      urls.push(u);
      return Response.json(u.pathname.endsWith("/stats") ? { pageviews: 10, visitors: 8 } : { pageviews: [], sessions: [] });
    },
  });
  await cliente.porDia({ desde: "2026-09-01", hasta: "2026-09-07" }, "hora");
  assert.deepEqual(await cliente.ventana({ desde: "2026-09-01", hasta: "2026-09-07" }), { vistas: 10, visitantes: 8 });
  assert.equal(urls[0].pathname, "/api/websites/s-1/pageviews");
  assert.equal(urls[0].searchParams.get("unit"), "hour");
  assert.equal(urls[1].pathname, "/api/websites/s-1/stats");
});

test("un 401 se explica en llano", async () => {
  const cliente = crearClienteDeUmami({ url: "http://analitica:3000", apiKey: "k", sitio: "s", fetchImpl: async () => new Response("no", { status: 401 }) });
  await assert.rejects(() => cliente.ventana({ desde: "2026-09-01", hasta: "2026-09-02" }), (e: unknown) => {
    assert.ok(e instanceof ErrorDeAnaliticas);
    assert.equal(e.estado, 401);
    assert.match(e.message, /API key/);
    return true;
  });
});
