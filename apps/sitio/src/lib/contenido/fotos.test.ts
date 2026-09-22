import { test } from "node:test";
import assert from "node:assert/strict";
import { esSrcDeFoto, estiloDeFoco, fotoDeRuta, posicionDelFoco, resolverFoto } from "./fotos";

test("el foco se vuelve un object-position en porcentajes redondos", () => {
  assert.equal(posicionDelFoco({ x: 0.5, y: 0.5 }), "50% 50%");
  assert.equal(posicionDelFoco({ x: 0.254, y: 1 }), "25% 100%");
});

test("en el centro no hay estilo: es el default del navegador y el HTML queda igual", () => {
  assert.equal(estiloDeFoco({ x: 0.5, y: 0.5 }), undefined);
  assert.deepEqual(estiloDeFoco({ x: 0.2, y: 0.5 }), { objectPosition: "20% 50%" });
  // Compara el resultado redondeado, no las coordenadas crudas: 0.498 también redondea a 50%.
  assert.equal(estiloDeFoco({ x: 0.498, y: 0.503 }), undefined);
});

test("resolverFoto devuelve lo que el <Image> del sitio necesita", () => {
  assert.deepEqual(resolverFoto({ src: "/fotos/a.webp", alt: "Un aula", foco: { x: 0, y: 0.5 } }), {
    src: "/fotos/a.webp",
    alt: "Un aula",
    objectPosition: "0% 50%",
  });
});

test("fotoDeRuta arma una foto de public/ centrada, con su propio foco", () => {
  const a = fotoDeRuta("/fotos/a.webp", "A");
  const b = fotoDeRuta("/fotos/b.webp", "B");
  assert.deepEqual(a, { src: "/fotos/a.webp", alt: "A", foco: { x: 0.5, y: 0.5 } });
  assert.notEqual(a.foco, b.foco);
});

test("solo se aceptan las fotos que el sitio sabe mostrar", () => {
  assert.equal(esSrcDeFoto("/fotos/docentes-trabajan-aula.webp"), true);
  assert.equal(esSrcDeFoto("/api/fotos/0f0e0d0c-0b0a-4908-8706-050403020100"), true);
  assert.equal(esSrcDeFoto("https://abc123xyz.public.blob.vercel-storage.com/fotos/x.webp"), true);
  assert.equal(esSrcDeFoto("https://otro.sitio/x.jpg"), false);
  assert.equal(esSrcDeFoto("/api/fotos/../.env.local"), false);
  assert.equal(esSrcDeFoto("fotos/sin-barra.webp"), false);
  assert.equal(esSrcDeFoto(""), false);
  // La rama de public/ acepta subcarpetas, pero ningún segmento puede ser "." ni "..".
  assert.equal(esSrcDeFoto("/fotos/2026/aula.webp"), true);
  assert.equal(esSrcDeFoto("/fotos/../.env.local"), false);
  assert.equal(esSrcDeFoto("/fotos/a/../b.webp"), false);
  // M-1: "%2e"/"%2f" percent-encoded no deben colarse como "." o "/" adentro del segmento.
  assert.equal(esSrcDeFoto("/fotos/..%2F.env.local"), false);
  assert.equal(esSrcDeFoto("/fotos/%2e%2e/%2e%2e/.env.local"), false);
});
