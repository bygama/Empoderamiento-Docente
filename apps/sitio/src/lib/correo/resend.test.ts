import { test } from "node:test";
import assert from "node:assert/strict";
import { ErrorDeCorreo, URL_DE_RESEND, crearClienteDeResend, urlDesviada, type Correo } from "./resend";

const ENLACE = "https://ed.test/api/auth/reset-password/token-secreto";

const CORREO: Correo = {
  de: "ED <no-responder@ed.test>",
  para: "ana@ed.test",
  asunto: "Elegí tu contraseña",
  html: `<a href="${ENLACE}">Elegir</a>`,
  texto: ENLACE,
  idempotencia: "clave-1",
};

type Llamada = { url: string; init: RequestInit };

/** Un `fetch` que contesta en orden lo que le pasan y anota cada llamada. */
function fetchFalso(respuestas: Array<Response | Error | "cuelga">) {
  const llamadas: Llamada[] = [];
  const fetchImpl = (async (url: string, init: RequestInit) => {
    llamadas.push({ url, init });
    const r = respuestas[llamadas.length - 1];
    if (r === "cuelga") {
      return new Promise((_, rechazar) => init.signal?.addEventListener("abort", () => rechazar(init.signal?.reason)));
    }
    if (r instanceof Error) throw r;
    return r;
  }) as unknown as typeof fetch;
  return { fetchImpl, llamadas };
}

const ok = () => Response.json({ id: "abc-123" });

test("manda el correo con la clave, la idempotencia y el cuerpo que pide Resend", async () => {
  const { fetchImpl, llamadas } = fetchFalso([ok()]);
  const resultado = await crearClienteDeResend({ clave: "re_prueba", fetchImpl }).mandar(CORREO);
  assert.deepEqual(resultado, { id: "abc-123" });
  assert.equal(llamadas.length, 1);
  assert.equal(llamadas[0].url, "https://api.resend.com/emails");
  const cabeceras = new Headers(llamadas[0].init.headers);
  assert.equal(cabeceras.get("authorization"), "Bearer re_prueba");
  assert.equal(cabeceras.get("idempotency-key"), "clave-1");
  assert.deepEqual(JSON.parse(String(llamadas[0].init.body)), {
    from: CORREO.de,
    to: [CORREO.para],
    subject: CORREO.asunto,
    html: CORREO.html,
    text: CORREO.texto,
  });
});

test("un 5xx se reintenta una vez, con la misma clave de idempotencia", async () => {
  const { fetchImpl, llamadas } = fetchFalso([new Response("caído", { status: 503 }), ok()]);
  assert.deepEqual(await crearClienteDeResend({ clave: "re", fetchImpl }).mandar(CORREO), { id: "abc-123" });
  assert.equal(llamadas.length, 2);
  assert.deepEqual(
    llamadas.map((l) => new Headers(l.init.headers).get("idempotency-key")),
    ["clave-1", "clave-1"],
  );
});

test("un error de red se reintenta una vez", async () => {
  const { fetchImpl, llamadas } = fetchFalso([new TypeError("fetch failed"), ok()]);
  assert.deepEqual(await crearClienteDeResend({ clave: "re", fetchImpl }).mandar(CORREO), { id: "abc-123" });
  assert.equal(llamadas.length, 2);
});

test("cada intento se corta a los `espera` ms, y se reintenta una vez", async () => {
  const { fetchImpl, llamadas } = fetchFalso(["cuelga", "cuelga"]);
  await assert.rejects(crearClienteDeResend({ clave: "re", fetchImpl, espera: 20 }).mandar(CORREO), (e: unknown) => {
    assert.ok(e instanceof ErrorDeCorreo);
    assert.equal(e.estado, null);
    assert.match(e.message, /no contestó/);
    return true;
  });
  assert.equal(llamadas.length, 2);
});

test("un 4xx no se reintenta y dice lo que contestó Resend", async () => {
  const { fetchImpl, llamadas } = fetchFalso([
    Response.json({ statusCode: 403, message: "The ed.test domain is not verified." }, { status: 403 }),
  ]);
  await assert.rejects(crearClienteDeResend({ clave: "re", fetchImpl }).mandar(CORREO), (e: unknown) => {
    assert.ok(e instanceof ErrorDeCorreo);
    assert.equal(e.estado, 403);
    assert.match(e.message, /Resend respondió 403: The ed\.test domain is not verified\./);
    return true;
  });
  assert.equal(llamadas.length, 1);
});

test("un error nunca lleva el enlace que se mandaba", async () => {
  const { fetchImpl } = fetchFalso([new Response("x", { status: 500 }), new Response("x", { status: 502 })]);
  await assert.rejects(crearClienteDeResend({ clave: "re", fetchImpl }).mandar(CORREO), (e: unknown) => {
    assert.ok(e instanceof ErrorDeCorreo);
    assert.equal(e.estado, 502);
    assert.ok(!e.message.includes("token-secreto"), e.message);
    return true;
  });
});

test("otra URL que la de Resend se nota, y el cliente manda ahí", async () => {
  assert.equal(urlDesviada(undefined), null);
  assert.equal(urlDesviada(""), null);
  assert.equal(urlDesviada(URL_DE_RESEND), null);
  assert.equal(urlDesviada("http://correo:3000/emails"), "http://correo:3000/emails");
  const { fetchImpl, llamadas } = fetchFalso([Response.json({ id: "local" })]);
  await crearClienteDeResend({ clave: "x", url: "http://correo:3000/emails", fetchImpl }).mandar(CORREO);
  assert.equal(llamadas[0].url, "http://correo:3000/emails");
});
