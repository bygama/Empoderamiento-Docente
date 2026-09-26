import { test } from "node:test";
import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { crearClienteDeBusquedas, mapearFilas } from "./search-console";
import { ErrorDeBusquedas } from "./tipos";

const FIXTURES = path.join(path.dirname(fileURLToPath(import.meta.url)), "__fixtures__");
const grabada = (archivo: string) => JSON.parse(readFileSync(path.join(FIXTURES, archivo), "utf8")) as unknown;

const { privateKey: CLAVE } = generateKeyPairSync("rsa", { modulusLength: 2048, privateKeyEncoding: { type: "pkcs8", format: "pem" }, publicKeyEncoding: { type: "spki", format: "pem" } });
const RANGO = { desde: "2026-09-20", hasta: "2026-09-21" };

type Pedido = { url: string; init?: RequestInit };

/** Un fetch que contesta el token y, a cada consulta, la respuesta que toque. */
function fetchFalso(consultas: Array<() => Response>, pedidos: Pedido[] = []): typeof fetch {
  return async (url, init) => {
    pedidos.push({ url: String(url), init });
    if (String(url).startsWith("https://oauth2.googleapis.com/")) return new Response(readFileSync(path.join(FIXTURES, "token.json")));
    const siguiente = consultas.shift();
    assert.ok(siguiente, "una consulta de más");
    return siguiente();
  };
}

const cliente = (fetchImpl: typeof fetch, filasPorPagina?: number) =>
  crearClienteDeBusquedas({ correo: "lectura@proyecto.iam.gserviceaccount.com", clave: CLAVE, propiedad: "sc-domain:ejemplo.org", fetchImpl, filasPorPagina });

test("las respuestas grabadas se mapean, con la posición multiplicada por sus impresiones", () => {
  const [primera] = mapearFilas(grabada("consulta-por-dia.json"), "consulta");
  assert.deepEqual({ ...primera, sumaDePosiciones: Math.round(primera.sumaDePosiciones * 1e6) / 1e6 }, {
    fecha: "2026-09-20",
    dimension: "consulta",
    valor: "empoderamiento docente",
    clics: 3,
    impresiones: 41,
    sumaDePosiciones: 59,
  });
  const totales = mapearFilas(grabada("total-por-dia.json"), "total");
  assert.deepEqual(
    totales.map((f) => [f.fecha, f.valor, f.impresiones]),
    [
      ["2026-09-20", "", 187],
      ["2026-09-21", "", 96],
    ],
  );
});

test("la consulta va a la propiedad codificada, con el permiso y la forma que pide Google", async () => {
  const pedidos: Pedido[] = [];
  const c = cliente(fetchFalso([() => Response.json(grabada("consulta-por-dia.json")), () => Response.json(grabada("total-por-dia.json"))], pedidos));
  assert.equal((await c.porDia(RANGO, "consulta")).length, 3);
  assert.equal((await c.porDia(RANGO, "total")).length, 2);

  const [token, consulta] = pedidos;
  assert.equal(pedidos.filter((p) => p.url === token.url).length, 1, "un solo token por cliente");
  assert.equal(consulta.url, "https://www.googleapis.com/webmasters/v3/sites/sc-domain%3Aejemplo.org/searchAnalytics/query");
  assert.equal((consulta.init?.headers as Record<string, string>).Authorization, "Bearer ya29.c.respuesta-grabada-de-prueba");
  assert.deepEqual(JSON.parse(String(consulta.init?.body)), {
    startDate: "2026-09-20",
    endDate: "2026-09-21",
    dimensions: ["date", "query"],
    type: "web",
    dataState: "final",
    rowLimit: 25000,
    startRow: 0,
  });
  assert.deepEqual(JSON.parse(String(pedidos[2].init?.body)).dimensions, ["date"]);
});

test("pide la página siguiente mientras la anterior llegue llena", async () => {
  const pedidos: Pedido[] = [];
  const fila = (n: number) => ({ keys: ["2026-09-20", `busqueda ${n}`], clicks: 0, impressions: 1, ctr: 0, position: 9 });
  const c = cliente(fetchFalso([() => Response.json({ rows: [fila(1), fila(2)] }), () => Response.json({ rows: [fila(3)] })], pedidos), 2);
  assert.deepEqual(
    (await c.porDia(RANGO, "consulta")).map((f) => f.valor),
    ["busqueda 1", "busqueda 2", "busqueda 3"],
  );
  const consultas = pedidos.filter((p) => p.url.includes("searchAnalytics"));
  assert.deepEqual(
    consultas.map((p) => JSON.parse(String(p.init?.body)).startRow),
    [0, 2],
  );
});

test("un 403 dice qué hacer", async () => {
  const c = cliente(fetchFalso([() => Response.json({ error: { code: 403, message: "User does not have sufficient permission for site." } }, { status: 403 })]));
  await assert.rejects(c.porDia(RANGO, "pais"), (e: unknown) => e instanceof ErrorDeBusquedas && e.estado === 403 && /Usuarios y permisos/.test(e.message));
});
