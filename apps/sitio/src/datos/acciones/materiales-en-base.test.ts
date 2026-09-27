import { test } from "node:test";
import assert from "node:assert/strict";
import { esquemaBorrador } from "@/features/biblioteca/contenido/material";
import { borradorVacio } from "@/features/biblioteca/contenido/modelo";
import { problemasDeMaterial, sinForma } from "./materiales-en-base";

// Lo que contesta una escritura de un material cuando el pedido no pasa el
// esquema: en llano y en español, siempre.

/** Los problemas de ese contenido, como los contesta la acción. */
function problemas(contenido: unknown) {
  const r = esquemaBorrador.safeParse(contenido, sinForma);
  assert.equal(r.success, false);
  return problemasDeMaterial(r.error!, "prueba");
}

test("un pedido que el formulario no pudo armar contesta en llano, sin el inglés de Zod", (t) => {
  t.mock.method(console, "warn", () => {});
  for (const contenido of ["texto", null, { ...borradorVacio(), titulo: 5 }, { ...borradorVacio(), paginas: "doce" }, { ...borradorVacio(), autorias: "Ana" }]) {
    const fallo = problemas(contenido);
    assert.equal(fallo.detalle, "El pedido no tiene la forma esperada. Recargá la página y probá de nuevo.", JSON.stringify(contenido));
    assert.equal(fallo.errores, undefined);
  }
});

test("el detalle técnico va al log: el camino y el código, sin los valores", (t) => {
  const avisos = t.mock.method(console, "warn", () => {});
  problemas({ ...borradorVacio(), titulo: "un secreto" as unknown as number, paginas: "doce" });
  const linea = avisos.mock.calls.map((c) => c.arguments.join(" ")).join("\n");
  assert.match(linea, /paginas invalid_type/);
  assert.doesNotMatch(linea, /doce|secreto/);
});

test("lo que el formulario sí puede mandar mal sigue en su campo, con el mensaje del esquema", () => {
  const fallo = problemas({ ...borradorVacio(), fecha: "ayer" });
  assert.equal(fallo.errores?.[0]?.camino, "fecha");
  assert.equal(fallo.errores?.[0]?.mensaje, "La fecha de un material va con el año y, si se sabe, el mes.");
});
