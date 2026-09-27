import { test } from "node:test";
import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { crearClienteDeInspeccion, mapearInspeccion } from "./inspeccion";
import { ErrorDeBusquedas } from "./tipos";

// El cliente de la API de inspección, con una respuesta grabada con la forma de
// la referencia de Google y un fetch falso: sin red.

const FIXTURES = path.join(path.dirname(fileURLToPath(import.meta.url)), "__fixtures__");
const grabada = (archivo: string) => JSON.parse(readFileSync(path.join(FIXTURES, archivo), "utf8")) as unknown;
const { privateKey: CLAVE } = generateKeyPairSync("rsa", { modulusLength: 2048, privateKeyEncoding: { type: "pkcs8", format: "pem" }, publicKeyEncoding: { type: "spki", format: "pem" } });

type Pedido = { url: string; init?: RequestInit };

function fetchFalso(respuestas: Array<() => Response>, pedidos: Pedido[] = []): typeof fetch {
  return async (url, init) => {
    pedidos.push({ url: String(url), init });
    if (String(url).startsWith("https://oauth2.googleapis.com/")) return new Response(readFileSync(path.join(FIXTURES, "token.json")));
    const siguiente = respuestas.shift();
    assert.ok(siguiente, "una inspección de más");
    return siguiente();
  };
}

const cliente = (fetchImpl: typeof fetch) => crearClienteDeInspeccion({ correo: "lectura@proyecto.iam.gserviceaccount.com", clave: CLAVE, propiedad: "sc-domain:ejemplo.org", fetchImpl });

test("la respuesta grabada se mapea al veredicto, lo que dice Google y el último rastreo", () => {
  assert.deepEqual(mapearInspeccion(grabada("inspeccion.json")), {
    veredicto: "PASS",
    cobertura: "Submitted and indexed",
    ultimoRastreo: new Date("2026-09-24T08:15:42.123Z"),
  });
  assert.deepEqual(mapearInspeccion({}), { veredicto: "VERDICT_UNSPECIFIED", cobertura: "", ultimoRastreo: null });
});

test("la inspección va con el permiso, la URL y la propiedad, y un solo token por cliente", async () => {
  const pedidos: Pedido[] = [];
  const c = cliente(fetchFalso([() => Response.json(grabada("inspeccion.json")), () => Response.json(grabada("inspeccion.json"))], pedidos));
  await c.inspeccionar("https://ejemplo.org/que-hacemos");
  await c.inspeccionar("https://ejemplo.org/");
  const inspecciones = pedidos.filter((p) => p.url.startsWith("https://searchconsole.googleapis.com/"));
  assert.equal(pedidos.length - inspecciones.length, 1, "un solo token");
  assert.equal(inspecciones[0].url, "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect");
  assert.equal(inspecciones[0].init?.method, "POST");
  assert.equal(new Headers(inspecciones[0].init?.headers).get("authorization"), "Bearer ya29.c.respuesta-grabada-de-prueba");
  assert.deepEqual(JSON.parse(String(inspecciones[0].init?.body)), { inspectionUrl: "https://ejemplo.org/que-hacemos", siteUrl: "sc-domain:ejemplo.org", languageCode: "es" });
});

test("un 429 dice que se pasó la cuota, en llano", async () => {
  const c = cliente(fetchFalso([() => new Response("{}", { status: 429 })]));
  await assert.rejects(c.inspeccionar("https://ejemplo.org/"), (e: unknown) => e instanceof ErrorDeBusquedas && e.estado === 429 && /cuota/.test(e.message));
});
