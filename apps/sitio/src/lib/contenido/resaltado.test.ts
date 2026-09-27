import { test } from "node:test";
import assert from "node:assert/strict";
import { fragmentos, parrafos, partirResaltado, resaltadoValido, sinMarcas } from "./resaltado";

test("fragmentos separa lo resaltado y conserva los espacios de afuera", () => {
  assert.deepEqual(fragmentos("Somos **una idea** hecha acción"), [
    { texto: "Somos ", resaltado: false },
    { texto: "una idea", resaltado: true },
    { texto: " hecha acción", resaltado: false },
  ]);
  assert.deepEqual(fragmentos("**Todo**"), [{ texto: "Todo", resaltado: true }]);
  assert.deepEqual(fragmentos("Sin marcas"), [{ texto: "Sin marcas", resaltado: false }]);
});

test("una marca sin cerrar se lee como texto, con sus asteriscos", () => {
  assert.deepEqual(fragmentos("Uno **dos** tres **cuatro"), [
    { texto: "Uno ", resaltado: false },
    { texto: "dos", resaltado: true },
    { texto: " tres **cuatro", resaltado: false },
  ]);
});

test("resaltadoValido pide las marcas cerradas y no vacías", () => {
  assert.equal(resaltadoValido("Somos **una idea**."), true);
  assert.equal(resaltadoValido("Sin resaltado."), true);
  assert.equal(resaltadoValido("Somos **una idea."), false);
  assert.equal(resaltadoValido("Vacío ****."), false);
});

test("resaltadoValido con exactamente cuenta las partes resaltadas", () => {
  assert.equal(resaltadoValido("Con **una** sola.", { exactamente: 1 }), true);
  assert.equal(resaltadoValido("Sin ninguna.", { exactamente: 1 }), false);
  assert.equal(resaltadoValido("**Una** y **otra**.", { exactamente: 1 }), false);
});

test("parrafos corta en cada renglón y saltea los vacíos", () => {
  assert.deepEqual(parrafos("Primero.\n\n  Segundo.  \r\nTercero.\n"), ["Primero.", "Segundo.", "Tercero."]);
});

test("sinMarcas deja el texto como se lee", () => {
  assert.equal(sinMarcas("Áreas de **especialización**"), "Áreas de especialización");
  assert.equal(sinMarcas("Sin marcas."), "Sin marcas.");
});

test("partirResaltado separa la primera parte resaltada con lo de antes y lo de después", () => {
  assert.deepEqual(partirResaltado("Es poder para **transformar**."), { antes: "Es poder para ", clave: "transformar", despues: "." });
  assert.deepEqual(partirResaltado("**Todo**"), { antes: "", clave: "Todo", despues: "" });
  assert.deepEqual(partirResaltado("Sin marca"), { antes: "Sin marca", clave: null, despues: "" });
});
