import { test } from "node:test";
import assert from "node:assert/strict";
import { canalDe } from "./canales";

test("sin referido es Directo", () => {
  assert.equal(canalDe(""), "directo");
  assert.equal(canalDe("  "), "directo");
});

test("Google en cualquiera de sus dominios es Buscador, y los otros buscadores también", () => {
  for (const host of ["google.com", "www.google.com.ar", "google.cl", "www.google.com.mx", "www.bing.com", "duckduckgo.com", "search.yahoo.com"]) {
    assert.equal(canalDe(host), "buscador", host);
  }
});

test("los asistentes se miran antes que Google: Gemini no es un buscador", () => {
  for (const host of ["gemini.google.com", "chatgpt.com", "chat.openai.com", "www.perplexity.ai", "claude.ai", "copilot.microsoft.com"]) {
    assert.equal(canalDe(host), "asistentes-ia", host);
  }
});

test("las redes, con sus subdominios y sus acortadores", () => {
  for (const host of ["l.facebook.com", "lm.facebook.com", "www.linkedin.com", "lnkd.in", "t.co", "l.instagram.com", "web.whatsapp.com", "wa.me", "bsky.app"]) {
    assert.equal(canalDe(host), "redes", host);
  }
});

test("una app de Android va por su paquete", () => {
  assert.equal(canalDe("com.linkedin.android"), "redes");
  assert.equal(canalDe("com.google.android.googlequicksearchbox"), "buscador");
});

test("el propio sitio no es un canal, y lo demás es Otros sitios", () => {
  assert.equal(canalDe("empoderamientodocente.com", "empoderamientodocente.com"), null);
  assert.equal(canalDe("www.empoderamientodocente.com", "empoderamientodocente.com"), null);
  assert.equal(canalDe("relime.org"), "otros-sitios");
  assert.equal(canalDe("notgoogle.company"), "otros-sitios");
  assert.equal(canalDe("myfacebook.com"), "otros-sitios");
});

test("mayúsculas y el punto final no cambian el canal", () => {
  assert.equal(canalDe("WWW.LinkedIn.COM"), "redes");
  assert.equal(canalDe("google.com."), "buscador");
});
