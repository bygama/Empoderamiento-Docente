import { test } from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";
import { foto, grupo, listaFija, textoCorto } from "./campos";
import { describir } from "./describir";
import { caminoLegible } from "./descripcion";
import type { SeccionRegistrada } from "./documento";
import { primerProblema, problemasAlGuardar } from "./problemas";

const tarjeta = grupo({ titulo: textoCorto({ maximo: 10, etiqueta: "Título" }), foto: foto({ etiqueta: "Foto" }) });
const bloque: SeccionRegistrada = {
  nombre: "Bloque",
  esquema: z.object({
    titulo: textoCorto({ maximo: 10, etiqueta: "Título" }),
    tarjetas: listaFija(2, tarjeta, { etiqueta: "Tarjetas", etiquetaDelItem: "Tarjeta" }),
  }),
  inicial: null,
};
const unaFoto = { src: "/fotos/a.webp", alt: "Una foto", foco: { x: 0.5, y: 0.5 } };

function errorDe(valor: unknown): z.ZodError {
  const resultado = bloque.esquema.safeParse(valor);
  if (resultado.success) throw new Error("tenía que fallar");
  return resultado.error;
}

test("caminoLegible dice el camino con etiquetas, las partes de una foto incluidas", () => {
  const d = describir(bloque.esquema, bloque.nombre);
  assert.deepEqual(caminoLegible(d, ["tarjetas", 1, "foto", "alt"]), ["Tarjetas", "Tarjeta 2", "Foto", "Texto alternativo"]);
  assert.deepEqual(caminoLegible(d, ["titulo"]), ["Título"]);
  assert.deepEqual(caminoLegible(d, ["no-existe", "algo"]), []);
});

test("primerProblema nombra la parte y el campo, sin claves", () => {
  const error = errorDe({ titulo: "", tarjetas: [{ titulo: "a", foto: unaFoto }, { titulo: "b", foto: unaFoto }] });
  assert.equal(primerProblema(bloque, error), "Bloque › Título — Este texto no puede quedar vacío.");
});

test("problemasAlGuardar trae cada campo con su camino del formulario, uno por campo", () => {
  const error = errorDe({ titulo: "", tarjetas: [{ titulo: "a", foto: unaFoto }, { titulo: "b", foto: { ...unaFoto, alt: "" } }] });
  const { detalle, errores } = problemasAlGuardar("bloque", bloque, error);
  assert.deepEqual(
    errores.map((e) => e.camino),
    ["bloque.titulo", "bloque.tarjetas.1.foto.alt"],
  );
  assert.match(detalle, /^Hay 2 campos para revisar. El primero: Bloque › Título — /);
});
