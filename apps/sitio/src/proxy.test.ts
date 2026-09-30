import { test } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { paginaDeRebote } from "@/lib/seguridad/rebote";
import { CABECERA_DEL_METODO } from "@/lib/metricas/clic";
import { config, proxy } from "./proxy";

const DE_OTRO_SITIO = { "sec-fetch-site": "cross-site", "sec-fetch-mode": "navigate", "sec-fetch-dest": "document" };
const DEL_MISMO = { ...DE_OTRO_SITIO, "sec-fetch-site": "same-origin" };
const CON_SESION = { cookie: "better-auth.session_token=cualquiera" };

function pedir(ruta: string, cabeceras: Record<string, string>, metodo = "GET") {
  return proxy(new NextRequest(`http://localhost:3012${ruta}`, { method: metodo, headers: cabeceras }));
}

test("de otro sitio y sin cookie, rebota a la misma URL, sin script", async () => {
  const res = pedir("/admin/paginas?seccion=hero", DE_OTRO_SITIO);
  assert.equal(res.status, 200);
  const html = await res.text();
  assert.ok(html.includes('<meta http-equiv="refresh" content="0;url=/admin/paginas?seccion=hero">'), html);
  assert.ok(html.includes('<a href="/admin/paginas?seccion=hero">Seguir</a>'), html);
  assert.ok(!html.includes("<script"));
  assert.match(res.headers.get("cache-control") ?? "", /no-store/);
  assert.equal(res.headers.get("x-robots-tag"), "noindex, nofollow");
  assert.ok(res.headers.get("content-security-policy"));
});

test("del mismo sitio y sin cookie, va a «entrar» como siempre", () => {
  const res = pedir("/admin/paginas", DEL_MISMO);
  assert.equal(res.status, 307);
  const destino = new URL(res.headers.get("location") ?? "");
  assert.equal(destino.pathname + destino.search, "/admin/entrar?volver=%2Fadmin%2Fpaginas");
});

test("con la cookie pasa, venga de donde venga", () => {
  const res = pedir("/admin/paginas", { ...DE_OTRO_SITIO, ...CON_SESION });
  assert.equal(res.headers.get("x-middleware-next"), "1");
});

test("un POST de otro sitio no rebota", () => {
  assert.equal(pedir("/admin/paginas", DE_OTRO_SITIO, "POST").status, 307);
  const accion = pedir("/admin/paginas", { ...DE_OTRO_SITIO, "next-action": "abc" }, "POST");
  assert.equal(accion.headers.get("x-middleware-next"), "1");
});

test("las pantallas de acceso no rebotan: no hace falta sesión para verlas", () => {
  const res = pedir("/admin/entrar", DE_OTRO_SITIO);
  assert.equal(res.headers.get("x-middleware-next"), "1");
});

test("el destino del rebote es siempre una ruta de este sitio, escapada", async () => {
  const html = await paginaDeRebote(new URL("http://localhost//otro.sitio/robar?a=1&b=2")).text();
  assert.ok(html.includes('content="0;url=/otro.sitio/robar?a=1&#38;b=2"'), html);
  assert.ok(!html.includes("//otro.sitio"));
});

/** La directiva `script-src` de la CSP de una respuesta. */
function scriptSrc(res: Response): string {
  return (res.headers.get("content-security-policy") ?? "").split("; ").find((d) => d.startsWith("script-src")) ?? "";
}

test("el admin lleva un nonce distinto en cada respuesta, con 'strict-dynamic' y sin 'unsafe-inline'", () => {
  const a = pedir("/admin/entrar", {});
  const b = pedir("/admin/entrar", {});
  assert.match(scriptSrc(a), /^script-src 'self' 'nonce-[A-Za-z0-9+/=]{24}' 'strict-dynamic'$/);
  assert.notEqual(scriptSrc(a), scriptSrc(b));
  // Next lee el nonce de la CSP del pedido: tiene que viajar hacia adentro.
  assert.equal(a.headers.get("x-middleware-request-content-security-policy"), a.headers.get("content-security-policy"));
});

test("el admin no se deja abrir ni cargar desde otro sitio", () => {
  for (const res of [pedir("/admin/entrar", {}), pedir("/admin/paginas", DEL_MISMO), pedir("/admin/paginas", DE_OTRO_SITIO)]) {
    assert.equal(res.headers.get("cross-origin-opener-policy"), "same-origin");
    assert.equal(res.headers.get("cross-origin-resource-policy"), "same-origin");
    assert.equal(res.headers.get("x-frame-options"), "DENY");
  }
});

/** La directiva `img-src` de la CSP de una respuesta. */
function imgSrc(res: Response): string {
  return (res.headers.get("content-security-policy") ?? "").split("; ").find((d) => d.startsWith("img-src")) ?? "";
}

test("las imágenes de Blob pasan solo del store del sitio, y solo si hay token", (t) => {
  const antes = process.env.BLOB_READ_WRITE_TOKEN;
  t.after(() => {
    if (antes === undefined) delete process.env.BLOB_READ_WRITE_TOKEN;
    else process.env.BLOB_READ_WRITE_TOKEN = antes;
  });
  delete process.env.BLOB_READ_WRITE_TOKEN;
  for (const ruta of ["/", "/admin/entrar"]) assert.equal(imgSrc(pedir(ruta, {})), "img-src 'self' data: blob:");
  process.env.BLOB_READ_WRITE_TOKEN = "vercel_blob_rw_AbC123_secreto";
  for (const ruta of ["/", "/admin/entrar"]) assert.equal(imgSrc(pedir(ruta, {})), "img-src 'self' data: blob: https://abc123.public.blob.vercel-storage.com");
});

test("el sitio público sigue con su CSP estática, sin nonce", () => {
  const res = pedir("/", {});
  assert.equal(scriptSrc(res), "script-src 'self' 'unsafe-inline'");
  assert.equal(res.headers.get("cross-origin-opener-policy"), null);
  assert.equal(res.headers.get("x-middleware-request-content-security-policy"), null);
});

test("a /l/ le pasa el método real, pisando el que venga de afuera: un HEAD que dice ser GET sigue siendo HEAD", () => {
  const cabecera = `x-middleware-request-${CABECERA_DEL_METODO}`;
  assert.equal(pedir("/l/taller", { [CABECERA_DEL_METODO]: "GET" }, "HEAD").headers.get(cabecera), "HEAD");
  assert.equal(pedir("/l/taller", {}, "GET").headers.get(cabecera), "GET");
  // Fuera de /l/ no se pone: nadie más la lee.
  assert.equal(pedir("/que-hacemos", {}, "GET").headers.get(cabecera), null);
});

test("el matcher del proxy cubre /l/: si la dejara afuera, /l/ no contaría nada", () => {
  const cubre = (ruta: string) => config.matcher.some((m) => new RegExp(`^${m}$`).test(ruta));
  assert.equal(cubre("/l/taller-en-monterrey"), true);
  assert.equal(cubre("/_next/static/chunk.js"), false);
});
