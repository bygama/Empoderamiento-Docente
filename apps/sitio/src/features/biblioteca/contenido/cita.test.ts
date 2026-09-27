import { test } from "node:test";
import assert from "node:assert/strict";
import { citaApa, iniciales, partirNombre } from "./cita";

test("los apellidos se deducen del nombre cuando la fuente no los separa", () => {
  assert.deepEqual(partirNombre("Daniela Reyes-Gasperini"), { apellidos: "Reyes-Gasperini", nombres: "Daniela" });
  assert.deepEqual(partirNombre("Karla Gómez Osalde"), { apellidos: "Gómez Osalde", nombres: "Karla" });
  assert.deepEqual(partirNombre("Luis Manuel Cabrera Chim"), { apellidos: "Cabrera Chim", nombres: "Luis Manuel" });
  assert.deepEqual(partirNombre("Ma. Guadalupe Corona-Galindo"), { apellidos: "Corona-Galindo", nombres: "Ma. Guadalupe" });
  assert.deepEqual(partirNombre("Jonathan Adrián Morales de la Cruz"), { apellidos: "Morales de la Cruz", nombres: "Jonathan Adrián" });
  assert.deepEqual(partirNombre("Romina"), { apellidos: "Romina", nombres: "" });
  assert.equal(iniciales("Luis Manuel"), "L. M.");
  assert.equal(iniciales("Ma. Guadalupe"), "M. G.");
  assert.equal(iniciales("Jean-Paul"), "J.-P.");
});

test("la cita APA en castellano, con DOI, con los datos de la revista y sin fecha", () => {
  const base = { fecha: "2025-12", titulo: "Resignificación del conocimiento matemático escolar", fuente: "Revista Latinoamericana de Investigación en Matemática Educativa", doi: "10.12802/relime.2025.28.e805", url: "" };
  assert.equal(
    citaApa({ ...base, autores: [{ nombre: "Daniela Reyes-Gasperini" }, { nombre: "Karla Gómez Osalde" }] }),
    "Reyes-Gasperini, D. y Gómez Osalde, K. (2025). Resignificación del conocimiento matemático escolar. Revista Latinoamericana de Investigación en Matemática Educativa. https://doi.org/10.12802/relime.2025.28.e805",
  );
  assert.equal(
    citaApa({ ...base, volumen: "28", numero: "1", paginas: "1–39", autores: [{ nombre: "x", apellidos: "Reyes-Gasperini", nombres: "Daniela" }] }),
    "Reyes-Gasperini, D. (2025). Resignificación del conocimiento matemático escolar. Revista Latinoamericana de Investigación en Matemática Educativa, 28(1), 1–39. https://doi.org/10.12802/relime.2025.28.e805",
  );
  const tres = citaApa({ ...base, fecha: "", doi: "", url: "https://ejemplo.org/a", titulo: "¿Qué, para qué, para quién?", autores: [{ nombre: "Ana Pérez" }, { nombre: "Beto Díaz" }, { nombre: "Carla Ruiz" }] });
  assert.equal(tres, "Pérez, A., Díaz, B. y Ruiz, C. (s. f.). ¿Qué, para qué, para quién? Revista Latinoamericana de Investigación en Matemática Educativa. https://ejemplo.org/a");
});
