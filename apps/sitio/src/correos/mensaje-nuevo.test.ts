import { test } from "node:test";
import assert from "node:assert/strict";
import { mensajeNuevo } from "./mensaje-nuevo";

const ENLACE = "https://ed.test/admin/mensajes/cv/0b8f6c1e-8d57-4f3e-9d0b-6f2f3a4b5c6d";

test("el aviso dice qué bandeja, lleva a la ficha y dice dónde se apaga", () => {
  const cv = mensajeNuevo({ bandeja: "cv", enlace: ENLACE, nombre: "Raquel" });
  assert.equal(cv.asunto, "Llegó un CV nuevo");
  assert.match(cv.texto, /^Hola, Raquel:/);
  assert.ok(cv.texto.includes(ENLACE));
  assert.match(cv.texto, /aviso de CV\. Lo apagás en Mi cuenta/);
  assert.equal(mensajeNuevo({ bandeja: "contacto", enlace: ENLACE }).asunto, "Llegó un mensaje nuevo a Contacto");
});
