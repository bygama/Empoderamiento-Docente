import { test } from "node:test";
import assert from "node:assert/strict";
import { datosDe, esquemaDe, valoresDe, type CampoDeFormulario } from "./campos";

const CAMPOS: readonly CampoDeFormulario[] = [
  { clave: "nombre", etiqueta: "Nombre", tipo: "texto", obligatorio: true, largo: 10 },
  { clave: "correo", etiqueta: "Correo", tipo: "correo", obligatorio: true },
  { clave: "nivel", etiqueta: "Nivel", tipo: "opcion", obligatorio: true, opciones: ["Primaria", "Secundaria"] },
  { clave: "pais", etiqueta: "País", tipo: "opcion", obligatorio: false, opciones: ["Chile"] },
  { clave: "nota", etiqueta: "Nota", tipo: "parrafo", obligatorio: false },
];

const BIEN = { nombre: "  Ana  ", correo: "ana@ed.org", nivel: "Primaria", pais: "", nota: "" };

function primerError(entrada: Record<string, unknown>): string | undefined {
  const r = esquemaDe(CAMPOS).safeParse(entrada);
  return r.success ? undefined : r.error.issues[0]?.message;
}

test("acepta lo que la lista permite, sin espacios de más y sin lo que no nombra", () => {
  const r = esquemaDe(CAMPOS).parse({ ...BIEN, colado: "x" });
  assert.deepEqual(r, { nombre: "Ana", correo: "ana@ed.org", nivel: "Primaria", pais: "", nota: "" });
});

test("rechaza lo que la lista no permite, en llano", () => {
  assert.equal(primerError({ ...BIEN, nombre: "   " }), "Completá «Nombre».");
  assert.equal(primerError({ ...BIEN, nombre: "Ana María Pérez" }), "«Nombre» puede tener hasta 10 caracteres.");
  assert.equal(primerError({ ...BIEN, correo: "ana" }), "Revisá «Correo»: no parece un correo.");
  assert.equal(primerError({ ...BIEN, nivel: "Terciaria" }), "Elegí una opción de «Nivel».");
  assert.equal(primerError({ ...BIEN, pais: "Perú" }) !== undefined, true);
});

test("valoresDe da un string por campo, vacío si no vino", () => {
  const datos = new FormData();
  datos.set("nombre", "Ana");
  assert.deepEqual(valoresDe(CAMPOS, datos), { nombre: "Ana", correo: "", nivel: "", pais: "", nota: "" });
});

test("datosDe guarda lo que no va a una columna, en orden y sin los vacíos", () => {
  const valores = { nombre: "Ana", correo: "ana@ed.org", nivel: "Primaria", pais: "", nota: "Hola" };
  assert.deepEqual(datosDe(CAMPOS, valores, ["nombre", "correo"]), [
    { etiqueta: "Nivel", valor: "Primaria" },
    { etiqueta: "Nota", valor: "Hola" },
  ]);
});
