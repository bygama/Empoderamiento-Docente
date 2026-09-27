import { test } from "node:test";
import assert from "node:assert/strict";
import type { BorradorDeAliado } from "@/features/aliados/contenido/aliado";
import { cambiosDelAliado } from "./cambios";

const aliado: BorradorDeAliado = { nombre: "UNESCO", logo: { src: "/aliados/unesco.png", alt: "UNESCO", foco: { x: 0.5, y: 0.5 } }, tamano: "chico", url: "" };

test("lo igual no es un cambio; el tamaño y la URL se leen con sus etiquetas", () => {
  assert.deepEqual(cambiosDelAliado(aliado, aliado), []);
  assert.deepEqual(
    cambiosDelAliado(aliado, { ...aliado, tamano: "grande", url: "https://es.unesco.org" }).map((c) => [c.donde.join(" › "), c.antes, c.despues]),
    [
      ["Tamaño en la tira", { tipo: "texto", texto: "Chico" }, { tipo: "texto", texto: "Grande" }],
      ["Su sitio", { tipo: "nada" }, { tipo: "texto", texto: "https://es.unesco.org" }],
    ],
  );
});
