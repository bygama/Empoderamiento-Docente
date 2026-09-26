import { test } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { paginaDeRebote } from "@/lib/seguridad/rebote";
import { proxy } from "./proxy";

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
