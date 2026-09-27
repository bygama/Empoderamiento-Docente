import { test } from "node:test";
import assert from "node:assert/strict";
import { MATERIALES } from "@/features/biblioteca/data/materiales";
import { anclasDe, borradorVacio, compararFechas } from "./modelo";
import { esquemaBorrador, esquemaNovedad, type Novedad } from "./novedad";

const completa: Novedad = {
  slug: "relime-2025",
  titulo: "Resignificar el saber matemático escolar: nuevo artículo en RELIME",
  bajada: "Daniela Reyes-Gasperini y Karla Gómez Osalde publican en RELIME.",
  fecha: "2025-12",
  categoria: "publicaciones",
  imagen: { src: "/fotos/formadora-explica.webp", alt: "Una formadora explica frente a un grupo", foco: { x: 0.5, y: 0.5 } },
  cuerpo: [{ titulo: "Qué estudia", parrafos: ["Un párrafo.", "Otro párrafo."] }],
  destacada: true,
  publicacion: MATERIALES[0].titulo,
  imagenParaRedes: null,
};

/** Los mensajes de un resultado que no pasa, por campo. */
function errores(resultado: { success: boolean; error?: { issues: Array<{ path: PropertyKey[]; message: string }> } }): Record<string, string> {
  return Object.fromEntries((resultado.error?.issues ?? []).map((i) => [i.path.join("."), i.message]));
}

test("una novedad completa se publica; sin foto, con una fecha que no existe o con una URL rara, no", () => {
  assert.equal(esquemaNovedad.safeParse(completa).success, true);
  const sinFoto = errores(esquemaNovedad.safeParse({ ...completa, imagen: { ...completa.imagen, src: "" } }));
  assert.equal(sinFoto["imagen.src"], "Falta la foto.");
  assert.match(errores(esquemaNovedad.safeParse({ ...completa, fecha: "2026-02-30" })).fecha, /no existe/);
  assert.match(errores(esquemaNovedad.safeParse({ ...completa, slug: "Con Espacios" })).slug, /minúsculas/);
  assert.equal(esquemaNovedad.safeParse({ ...completa, fecha: "2026" }).success, true);
});

test("un borrador vacío se guarda pero no se publica", () => {
  const vacio = borradorVacio("2026-09-26");
  assert.equal(esquemaBorrador.safeParse(vacio).success, true);
  const faltan = errores(esquemaNovedad.safeParse(vacio));
  assert.deepEqual(Object.keys(faltan).sort(), ["bajada", "imagen.alt", "imagen.src", "slug", "titulo"]);
  // Lo que está mal frena también al guardar: una fecha a medio escribir.
  assert.equal(esquemaBorrador.safeParse({ ...vacio, fecha: "20" }).success, false);
});

test("la publicación tiene que ser un título del catálogo", () => {
  assert.equal(esquemaNovedad.safeParse({ ...completa, publicacion: "Un artículo que no existe" }).success, false);
  assert.equal(esquemaNovedad.safeParse({ ...completa, publicacion: null }).success, true);
});

test("el orden: la más nueva primero, y el año solo después de las fechas más precisas", () => {
  const hoy = ["2026-08-26", "2026-07", "2026-02", "2026-01", "2026", "2025-12", "2025", "2025-05", "2024"];
  assert.deepEqual([...hoy].sort(compararFechas), ["2026-08-26", "2026-07", "2026-02", "2026-01", "2026", "2025-12", "2025-05", "2025", "2024"]);
});

test("las anclas salen del título, como las de hoy, y no se repiten", () => {
  const cuerpo = [
    { titulo: "Qué dice la carta", parrafos: ["a"] },
    { titulo: "Dónde se ve", parrafos: ["b"] },
    { titulo: "Dónde se ve", parrafos: ["c"] },
  ];
  assert.deepEqual(
    anclasDe(cuerpo).map((s) => s.ancla),
    ["que-dice-la-carta", "donde-se-ve", "donde-se-ve-2"],
  );
});
