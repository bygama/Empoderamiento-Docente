import { test } from "node:test";
import assert from "node:assert/strict";
import { foto, grupo, listaFija, metaDe, parrafo, rutaInterna, textoCorto } from "./campos";

test("textoCorto recorta, exige algo y no acepta saltos ni más del máximo", () => {
  const campo = textoCorto({ maximo: 10, etiqueta: "Título", ayuda: "Un renglón." });
  assert.equal(campo.parse("  hola  "), "hola");
  assert.equal(campo.safeParse("").success, false);
  assert.equal(campo.safeParse("hola\nchau").success, false);
  assert.equal(campo.safeParse("12345678901").success, false);
  assert.deepEqual(metaDe(campo), { tipo: "textoCorto", maximo: 10, etiqueta: "Título", ayuda: "Un renglón." });
});

test("parrafo acepta saltos de línea", () => {
  assert.equal(parrafo({ maximo: 50 }).safeParse("una línea\notra").success, true);
  assert.equal(parrafo({ maximo: 5 }).safeParse("demasiado largo").success, false);
});

test("listaFija pide la cantidad exacta", () => {
  const lista = listaFija(3, textoCorto({ maximo: 5 }), { ayuda: "Son 3." });
  assert.equal(lista.safeParse(["a", "b", "c"]).success, true);
  assert.equal(lista.safeParse(["a", "b"]).success, false);
  assert.equal(lista.safeParse(["a", "b", "c", "d"]).success, false);
  assert.deepEqual(metaDe(lista), { tipo: "listaFija", cantidad: 3, ayuda: "Son 3." });
});

test("rutaInterna es una lista cerrada", () => {
  const ruta = rutaInterna(["/", "/contacto"]);
  assert.equal(ruta.safeParse("/contacto").success, true);
  assert.equal(ruta.safeParse("https://otro.sitio").success, false);
  assert.equal(metaDe(ruta)?.tipo, "rutaInterna");
});

test("foto exige un src que el sitio sepa mostrar, alt y un foco entre 0 y 1", () => {
  const campo = foto({ etiqueta: "Foto" });
  const buena = { src: "/fotos/a.webp", alt: "Docentes en un aula", foco: { x: 0.5, y: 0.5 } };
  assert.deepEqual(campo.parse(buena), buena);
  assert.equal(campo.safeParse({ ...buena, src: "https://abc.public.blob.vercel-storage.com/fotos/a.webp" }).success, true);
  assert.equal(campo.safeParse({ ...buena, alt: "" }).success, false);
  assert.equal(campo.safeParse({ ...buena, src: "" }).success, false);
  assert.equal(campo.safeParse({ ...buena, src: "https://otro.sitio/a.jpg" }).success, false);
  assert.equal(campo.safeParse({ ...buena, foco: { x: 1.5, y: 0 } }).success, false);
});

test("cada llamada tiene su propia metadata", () => {
  const a = textoCorto({ maximo: 5, etiqueta: "A" });
  const b = textoCorto({ maximo: 9, etiqueta: "B" });
  assert.equal(metaDe(a)?.etiqueta, "A");
  assert.equal(metaDe(b)?.etiqueta, "B");
  assert.equal(metaDe(grupo({ a }, { etiqueta: "Par" }))?.etiqueta, "Par");
});
