import { test } from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";
import { foto, grupo, listaFija, textoCorto } from "./campos";
import { compararSeccion } from "./comparar";
import { describir } from "./describir";

const tarjeta = grupo({
  foto: foto({ etiqueta: "Foto" }),
  cartel: grupo({ titulo: textoCorto({ maximo: 20, etiqueta: "Título" }), descripcion: textoCorto({ maximo: 40, etiqueta: "Descripción" }) }).nullable(),
});
const hero = describir(
  z.object({ titulo: textoCorto({ maximo: 60, etiqueta: "Título" }), tarjetas: listaFija(2, tarjeta, { etiqueta: "Tarjetas", etiquetaDelItem: "Tarjeta" }) }),
  "Hero",
);
const unaFoto = (src: string, alt = "Una foto", foco = { x: 0.5, y: 0.5 }) => ({ src, alt, foco });
const base = {
  titulo: "Hola",
  tarjetas: [
    { foto: unaFoto("/fotos/a.webp"), cartel: { titulo: "Aula", descripcion: "Donde pasa" } },
    { foto: unaFoto("/fotos/b.webp"), cartel: null },
  ],
};
const con = (cambio: (copia: typeof base) => void) => {
  const copia = structuredClone(base);
  cambio(copia);
  return copia;
};

test("sin cambios, nada; con el mismo contenido en otro orden de claves, tampoco", () => {
  assert.deepEqual(compararSeccion(hero, base, structuredClone(base)), []);
  const reordenado = { tarjetas: base.tarjetas, titulo: base.titulo };
  assert.deepEqual(compararSeccion(hero, base, reordenado), []);
});

test("un texto que cambia dice dónde con etiquetas, no claves", () => {
  assert.deepEqual(compararSeccion(hero, base, con((c) => (c.titulo = "Chau"))), [
    { donde: ["Título"], antes: { tipo: "texto", texto: "Hola" }, despues: { tipo: "texto", texto: "Chau" } },
  ]);
});

test("una foto se compara entera, y en una lista se dice qué ítem", () => {
  const diferencias = compararSeccion(hero, base, con((c) => (c.tarjetas[0].foto = unaFoto("/fotos/a.webp", "Otro alt", { x: 0.2, y: 0.5 }))));
  assert.deepEqual(diferencias, [
    {
      donde: ["Tarjetas", "Tarjeta 1", "Foto"],
      antes: { tipo: "foto", src: "/fotos/a.webp", alt: "Una foto", foco: "50% 50%" },
      despues: { tipo: "foto", src: "/fotos/a.webp", alt: "Otro alt", foco: "20% 50%" },
    },
  ]);
});

test("un opcional que aparece o se va es una sola diferencia contra nada", () => {
  const aparece = compararSeccion(hero, base, con((c) => (c.tarjetas[1].cartel = { titulo: "Nuevo", descripcion: "Cartel" })));
  assert.deepEqual(aparece, [{ donde: ["Tarjetas", "Tarjeta 2", "Cartel"], antes: { tipo: "nada" }, despues: { tipo: "texto", texto: "Nuevo · Cartel" } }]);
  const seVa = compararSeccion(hero, base, con((c) => (c.tarjetas[0].cartel = null)));
  assert.deepEqual(seVa, [{ donde: ["Tarjetas", "Tarjeta 1", "Cartel"], antes: { tipo: "texto", texto: "Aula · Donde pasa" }, despues: { tipo: "nada" } }]);
});

test("dentro de un opcional que sigue, se compara campo por campo", () => {
  const diferencias = compararSeccion(hero, base, con((c) => (c.tarjetas[0].cartel = { titulo: "Aula", descripcion: "Donde sucede" })));
  assert.deepEqual(diferencias.map((d) => d.donde), [["Tarjetas", "Tarjeta 1", "Cartel", "Descripción"]]);
});
