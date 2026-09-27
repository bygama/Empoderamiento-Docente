import { test } from "node:test";
import assert from "node:assert/strict";
import { escaparXml, rss } from "./rss";

const canal = { titulo: "Novedades", link: "https://ejemplo.org/novedades", descripcion: "Lo último.", propio: "https://ejemplo.org/novedades/rss.xml", idioma: "es" };

test("un feed con sus ítems, en orden, con la fecha en RFC 822", () => {
  const xml = rss(canal, [
    { titulo: "Una", link: "https://ejemplo.org/novedades/una", guid: "una", fecha: new Date(Date.UTC(2026, 7, 26)), descripcion: "Primera.", categoria: "Alianzas" },
    { titulo: "Dos", link: "https://ejemplo.org/novedades", guid: "dos", fecha: new Date(Date.UTC(2026, 0, 1)), descripcion: "Segunda." },
  ]);
  assert.match(xml, /^<\?xml version="1.0" encoding="UTF-8"\?>\n<rss version="2.0"/);
  assert.equal(xml.match(/<item>/g)?.length, 2);
  assert.ok(xml.indexOf("<title>Una</title>") < xml.indexOf("<title>Dos</title>"));
  assert.match(xml, /<pubDate>Wed, 26 Aug 2026 00:00:00 GMT<\/pubDate>/);
  assert.match(xml, /<category>Alianzas<\/category>/);
  assert.match(xml, /<atom:link href="https:\/\/ejemplo.org\/novedades\/rss.xml" rel="self"/);
});

test("el texto no rompe el XML", () => {
  assert.equal(escaparXml(`Tom & "Jerry" <b>'s`), "Tom &amp; &quot;Jerry&quot; &lt;b&gt;&apos;s");
  const xml = rss(canal, [{ titulo: "A & B", link: "https://ejemplo.org/?a=1&b=2", guid: "x", fecha: new Date(0), descripcion: "<script>" }]);
  assert.match(xml, /<title>A &amp; B<\/title>/);
  assert.match(xml, /<description>&lt;script&gt;<\/description>/);
  assert.doesNotMatch(xml, /<script>/);
});
