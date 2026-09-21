import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { ErrorDeAnaliticas, crearClienteDeAnaliticas, mapearPorDia, mapearVentana } from "./vercel";

test("el total por día se mapea con valor vacío", () => {
  const filas = mapearPorDia({ data: [{ timestamp: "2026-09-20T00:00:00.000Z", pageviews: 5, visitors: 4 }] }, "total");
  assert.deepEqual(filas, [{ fecha: "2026-09-20", dimension: "total", valor: "", agrupado: false, vistas: 5, visitantes: 4 }]);
});

test("una dimensión toma su clave y marca la fila del resto", () => {
  const filas = mapearPorDia(
    {
      data: [
        { timestamp: "2026-09-20T00:00:00.000Z", requestPath: "/novedades", pageviews: 3, visitors: 3 },
        { timestamp: "2026-09-20T00:00:00.000Z", requestPath: "Others", pageviews: 9, visitors: 7 },
      ],
    },
    "pagina",
  );
  assert.deepEqual(filas, [
    { fecha: "2026-09-20", dimension: "pagina", valor: "/novedades", agrupado: false, vistas: 3, visitantes: 3 },
    { fecha: "2026-09-20", dimension: "pagina", valor: "", agrupado: true, vistas: 9, visitantes: 7 },
  ]);
});

test("un referido vacío queda como cadena vacía sin marcarse como resto", () => {
  const [fila] = mapearPorDia({ data: [{ timestamp: "2026-09-20T00:00:00.000Z", referrerHostname: "", pageviews: 1, visitors: 1 }] }, "referido");
  assert.equal(fila.valor, "");
  assert.equal(fila.agrupado, false);
});

test("la ventana acepta un objeto o una lista de una fila", () => {
  assert.deepEqual(mapearVentana({ data: { pageviews: 10, visitors: 8 } }), { vistas: 10, visitantes: 8 });
  assert.deepEqual(mapearVentana({ data: [{ pageviews: 10, visitors: 8 }] }), { vistas: 10, visitantes: 8 });
});

test("las respuestas grabadas de la API se mapean enteras", (t) => {
  const ruta = path.resolve("src/lib/metricas/__fixtures__/pagina-por-dia.json");
  if (!existsSync(ruta)) return t.skip("sin respuestas grabadas: falta correr A1");
  const grabada = JSON.parse(readFileSync(ruta, "utf8")) as { estado: number; cuerpo: unknown };
  if (grabada.estado !== 200) return t.skip(`la respuesta grabada vino con estado ${grabada.estado}`);
  for (const fila of mapearPorDia(grabada.cuerpo, "pagina")) {
    assert.match(fila.fecha, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(Number.isInteger(fila.vistas) && fila.vistas >= 0);
    assert.ok(Number.isInteger(fila.visitantes) && fila.visitantes >= 0);
  }
});

test("un 401 se explica en llano", async () => {
  const cliente = crearClienteDeAnaliticas({
    token: "x",
    proyecto: "prj_x",
    fetchImpl: async () => new Response("no", { status: 401 }),
  });
  await assert.rejects(() => cliente.porDia({ desde: "2026-09-01", hasta: "2026-09-02" }, "total"), (e: unknown) => {
    assert.ok(e instanceof ErrorDeAnaliticas);
    assert.equal(e.estado, 401);
    assert.match(e.message, /token/);
    return true;
  });
});

test("la ventana se pide a visits/count con el rango entero", async () => {
  const urls: string[] = [];
  const cliente = crearClienteDeAnaliticas({
    token: "x",
    proyecto: "prj_x",
    fetchImpl: async (entrada) => {
      urls.push(String(entrada));
      return Response.json({ data: { pageviews: 10, visitors: 8 } });
    },
  });
  assert.deepEqual(await cliente.ventana({ desde: "2026-09-01", hasta: "2026-09-07" }), { vistas: 10, visitantes: 8 });
  assert.equal(urls.length, 1);
  assert.match(urls[0], /\/visits\/count\?/);
  assert.match(urls[0], /since=2026-09-01/);
  assert.match(urls[0], /until=2026-09-07/);
  assert.doesNotMatch(urls[0], /by=/);
});
