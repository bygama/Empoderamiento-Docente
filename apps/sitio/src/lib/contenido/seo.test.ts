import { test } from "node:test";
import assert from "node:assert/strict";
import { esquemaSeo, metadataDeSeo } from "./seo";

const comun = { type: "website" as const, locale: "es_ES", siteName: "Sitio" };
const seo = { titulo: "Inicio | Sitio", descripcion: "Qué hace el sitio.", imagenParaRedes: null };

test("metadataDeSeo arma el título entero y Open Graph con lo común, sin imagen si no hay propia", () => {
  assert.deepEqual(metadataDeSeo(seo, comun), {
    title: { absolute: "Inicio | Sitio" },
    description: "Qué hace el sitio.",
    openGraph: { type: "website", locale: "es_ES", siteName: "Sitio", title: "Inicio | Sitio", description: "Qué hace el sitio." },
  });
});

test("con imagen propia, Open Graph la lleva con su alt", () => {
  const conImagen = { ...seo, imagenParaRedes: { src: "/fotos/una.webp", alt: "Una foto", foco: { x: 0.5, y: 0.5 } } };
  assert.deepEqual(metadataDeSeo(conImagen, comun).openGraph?.images, [{ url: "/fotos/una.webp", alt: "Una foto" }]);
});

test("pasar el largo de buscador no frena: el tope duro es otro", () => {
  assert.equal(esquemaSeo.safeParse({ ...seo, titulo: "x".repeat(72), descripcion: "y".repeat(241) }).success, true);
  assert.equal(esquemaSeo.safeParse({ ...seo, titulo: "x".repeat(101) }).success, false);
});
