import { test } from "node:test";
import assert from "node:assert/strict";
import type { Novedad as Fila } from "@/../prisma/generado/client";
import { filasDeLaLista } from "./lista-de-novedades";

// La lista del admin, sin base: las filas se arman acá.

const imagen = { src: "/fotos/a.webp", alt: "A", foco: { x: 0.5, y: 0.5 } };

function fila(id: string, otros: Partial<Fila>): Fila {
  return {
    id,
    slug: null,
    titulo: null,
    bajada: null,
    fecha: null,
    categoria: null,
    imagen: null,
    cuerpo: null,
    destacada: false,
    materialId: null,
    imagenParaRedes: null,
    publicada: false,
    publicadaEn: null,
    publicadaPor: null,
    borrador: null,
    borradorEn: null,
    borradorPor: null,
    creadaEn: new Date("2026-09-01"),
    creadaPor: null,
    ...otros,
  };
}

const publicada = (id: string, titulo: string, fecha: string, otros: Partial<Fila> = {}) =>
  fila(id, { slug: id, titulo, fecha, categoria: "prensa", bajada: "b", imagen, publicada: true, publicadaEn: new Date("2026-09-10"), publicadaPor: "Ana", ...otros });

const filas = [
  publicada("vieja", "Educación matemática", "2025"),
  publicada("nueva", "Un taller", "2026-08", { destacada: true, borrador: { titulo: "Un taller nuevo", fecha: "2026-08", categoria: "eventos" }, borradorEn: new Date("2026-09-20"), borradorPor: "Beto" }),
  publicada("oculta", "Despublicada", "2026-01", { publicada: false }),
  fila("empezada", { borrador: { titulo: "", fecha: "2026-09-26", categoria: "publicaciones" }, borradorEn: new Date("2026-09-26"), borradorPor: "Ana" }),
];

test("cada pestaña con lo suyo, con su estado, de la más nueva a la más vieja", () => {
  assert.deepEqual(
    filasDeLaLista(filas, "publicadas").map((f) => [f.id, f.titulo, f.categoria, f.estado, f.destacada, f.ultimo.que, f.ultimo.quien]),
    [
      ["nueva", "Un taller nuevo", "Eventos", "con-cambios", true, "guardo", "Beto"],
      ["vieja", "Educación matemática", "Prensa", "publicada", false, "publico", "Ana"],
    ],
  );
  assert.deepEqual(
    filasDeLaLista(filas, "borradores").map((f) => [f.id, f.estado]),
    [
      ["empezada", "borrador"],
      ["oculta", "despublicada"],
    ],
  );
});

test("el buscador mira el título, sin mayúsculas ni acentos", () => {
  assert.deepEqual(filasDeLaLista(filas, "publicadas", "EDUCACION").map((f) => f.id), ["vieja"]);
  assert.deepEqual(filasDeLaLista(filas, "publicadas", "zzz"), []);
});
