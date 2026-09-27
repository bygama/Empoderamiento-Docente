import { test } from "node:test";
import assert from "node:assert/strict";
import { borradorVacio } from "@/features/novedades/contenido/modelo";
import { cambiosDeNovedad } from "./cambios";

const publicada = {
  ...borradorVacio("2026-08-26"),
  slug: "una",
  titulo: "Una novedad",
  bajada: "Su bajada.",
  imagen: { src: "/fotos/a.webp", alt: "Una foto", foco: { x: 0.5, y: 0.5 } },
  cuerpo: [{ titulo: "Qué pasó", parrafos: ["Primero.", "Segundo."] }],
};

test("sin cambios, nada", () => {
  assert.deepEqual(cambiosDeNovedad(publicada, structuredClone(publicada)), []);
});

test("cada campo que cambió, con su etiqueta y en el orden del formulario", () => {
  const ahora = {
    ...publicada,
    titulo: "Otro título",
    destacada: true,
    slug: "otra",
    cuerpo: [...publicada.cuerpo, { titulo: "Qué sigue", parrafos: ["Tercero."] }],
  };
  assert.deepEqual(
    cambiosDeNovedad(publicada, ahora).map((d) => [d.donde.join(" › "), d.antes, d.despues]),
    [
      ["Título", { tipo: "texto", texto: "Una novedad" }, { tipo: "texto", texto: "Otro título" }],
      ["Destacada", { tipo: "texto", texto: "No" }, { tipo: "texto", texto: "Sí" }],
      ["Cuerpo › Sección 2 › Título", { tipo: "nada" }, { tipo: "texto", texto: "Qué sigue" }],
      ["Cuerpo › Sección 2 › Texto", { tipo: "nada" }, { tipo: "texto", texto: "Tercero." }],
      ["URL", { tipo: "texto", texto: "/novedades/una" }, { tipo: "texto", texto: "/novedades/otra" }],
    ],
  );
});

test("una foto se compara entera: archivo, alt y foco", () => {
  const ahora = { ...publicada, imagen: { ...publicada.imagen, foco: { x: 0.2, y: 0.5 } } };
  const [cambio] = cambiosDeNovedad(publicada, ahora);
  assert.deepEqual(cambio, {
    donde: ["Imagen"],
    antes: { tipo: "foto", src: "/fotos/a.webp", alt: "Una foto", foco: "50% 50%" },
    despues: { tipo: "foto", src: "/fotos/a.webp", alt: "Una foto", foco: "20% 50%" },
  });
});
