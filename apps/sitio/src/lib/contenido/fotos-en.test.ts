import { test } from "node:test";
import assert from "node:assert/strict";
import { cambiarFoto, fotosEn } from "./fotos-en";

const foto = (src: string, alt = "Un aula") => ({ src, alt, foco: { x: 0.5, y: 0.5 } });

const documento = {
  hero: { tarjetas: [{ foto: foto("/fotos/a.webp") }, { foto: foto("/fotos/b.webp", "Otra") }] },
  mision: { titulo: "Misión", foto: foto("/fotos/a.webp", "La misma, otro alt") },
  seo: { imagenParaRedes: null },
  lamina: { foto: foto("/investigacion/l.webp"), sujecion: "clip", rotulo: "LÁMINA 01" },
};

test("encuentra cada foto con su camino, en el orden del documento", () => {
  assert.deepEqual(fotosEn(documento), [
    { camino: ["hero", "tarjetas", 0, "foto"], src: "/fotos/a.webp", alt: "Un aula" },
    { camino: ["hero", "tarjetas", 1, "foto"], src: "/fotos/b.webp", alt: "Otra" },
    { camino: ["mision", "foto"], src: "/fotos/a.webp", alt: "La misma, otro alt" },
    { camino: ["lamina", "foto"], src: "/investigacion/l.webp", alt: "Un aula" },
  ]);
});

test("una foto sin archivo todavía (un borrador a medias) no es un uso", () => {
  assert.deepEqual(fotosEn({ imagen: foto("") }), []);
  assert.deepEqual(fotosEn(null), []);
  assert.deepEqual(fotosEn("texto"), []);
});

test("cambiar el archivo toca solo el src de esa foto, en todos lados, y conserva el alt y el foco", () => {
  const { valor, cambio } = cambiarFoto(documento, "/fotos/a.webp", "https://x.public.blob.vercel-storage.com/fotos/n.webp");
  assert.equal(cambio, true);
  assert.deepEqual(
    fotosEn(valor).map((f) => [f.src, f.alt]),
    [
      ["https://x.public.blob.vercel-storage.com/fotos/n.webp", "Un aula"],
      ["/fotos/b.webp", "Otra"],
      ["https://x.public.blob.vercel-storage.com/fotos/n.webp", "La misma, otro alt"],
      ["/investigacion/l.webp", "Un aula"],
    ],
  );
  // El original no se toca, y lo que no cambió sigue siendo el mismo objeto.
  assert.equal(documento.hero.tarjetas[0].foto.src, "/fotos/a.webp");
  assert.equal((valor as typeof documento).lamina, documento.lamina);
});

test("sin esa foto, el mismo valor y sin cambios", () => {
  const r = cambiarFoto(documento, "/fotos/no-esta.webp", "/fotos/otra.webp");
  assert.equal(r.cambio, false);
  assert.equal(r.valor, documento);
});
