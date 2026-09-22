import { test } from "node:test";
import assert from "node:assert/strict";
import type { Descripcion } from "./descripcion";
import { resumirItem } from "./resumen";

// Con la forma de las tarjetas del hero, escrita a mano: el resumen no sabe
// nada del hero, solo recorre la descripción.
const foto: Descripcion = { tipo: "foto", etiqueta: "Foto" };
const tarjeta: Descripcion = {
  tipo: "grupo",
  etiqueta: "Tarjeta",
  campos: [
    { clave: "foto", descripcion: foto },
    {
      clave: "cartel",
      descripcion: {
        tipo: "opcional",
        etiqueta: "Cartel",
        de: {
          tipo: "grupo",
          etiqueta: "Cartel",
          campos: [
            { clave: "titulo", descripcion: { tipo: "textoCorto", etiqueta: "Título", maximo: 30 } },
            { clave: "descripcion", descripcion: { tipo: "textoCorto", etiqueta: "Descripción", maximo: 60 } },
          ],
        },
      },
    },
  ],
};
const aula = { src: "/fotos/aula.webp", alt: "Docentes en un aula", foco: { x: 0.3, y: 0.6 } };

test("una tarjeta con cartel: su foto y el título del cartel", () => {
  const valor = { foto: aula, cartel: { titulo: "En el aula", descripcion: "Acompañamos el aprendizaje" } };
  assert.deepEqual(resumirItem(tarjeta, valor), { foto: aula, texto: "En el aula" });
});

test("un texto vacío no cuenta: pasa al siguiente", () => {
  const valor = { foto: aula, cartel: { titulo: "  ", descripcion: "Acompañamos el aprendizaje" } };
  assert.equal(resumirItem(tarjeta, valor).texto, "Acompañamos el aprendizaje");
});

test("una tarjeta sin cartel: el texto es el alt de su foto", () => {
  assert.deepEqual(resumirItem(tarjeta, { foto: aula, cartel: null }), { foto: aula, texto: "Docentes en un aula" });
});

test("un ítem sin foto: solo el texto", () => {
  const boton: Descripcion = {
    tipo: "grupo",
    etiqueta: "Botón",
    campos: [
      { clave: "texto", descripcion: { tipo: "textoCorto", etiqueta: "Texto", maximo: 18 } },
      { clave: "ruta", descripcion: { tipo: "rutaInterna", etiqueta: "Adónde lleva", opciones: ["/", "/contacto"] } },
    ],
  };
  assert.deepEqual(resumirItem(boton, { texto: "Contactanos", ruta: "/contacto" }), { foto: null, texto: "Contactanos" });
});

test("una tarjeta de celular: solo foto, y el texto es su alt", () => {
  const celular: Descripcion = { tipo: "grupo", etiqueta: "Tarjeta", campos: [{ clave: "foto", descripcion: foto }] };
  assert.deepEqual(resumirItem(celular, { foto: aula }), { foto: aula, texto: "Docentes en un aula" });
});

test("una foto sin src no es una foto, y un valor roto no tira", () => {
  const vacia = { src: "", alt: "", foco: { x: 0.5, y: 0.5 } };
  assert.deepEqual(resumirItem(tarjeta, { foto: vacia, cartel: null }), { foto: null, texto: "" });
  assert.deepEqual(resumirItem(tarjeta, null), { foto: null, texto: "" });
});
