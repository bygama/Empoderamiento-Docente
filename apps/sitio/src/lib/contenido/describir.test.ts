import { test } from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";
import { foto, grupo, listaFija, rutaInterna, textoCorto } from "./campos";
import { describir } from "./describir";
import { humanizar, valorVacio } from "./descripcion";

const esquema = z.object({
  titulo: textoCorto({ maximo: 20, etiqueta: "Título", ayuda: "Un renglón." }),
  boton: grupo({ texto: textoCorto({ maximo: 8 }), ruta: rutaInterna(["/", "/contacto"]) }, { etiqueta: "Botón" }),
  tarjetas: listaFija(2, grupo({ foto: foto(), cartel: grupo({ titulo: textoCorto({ maximo: 5 }) }).nullable() }), { etiquetaDelItem: "Tarjeta" }),
});

test("describir arma el árbol del formulario, sin Zod adentro", () => {
  assert.deepEqual(describir(esquema, "Hero"), {
    tipo: "grupo",
    etiqueta: "Hero",
    campos: [
      { clave: "titulo", descripcion: { tipo: "textoCorto", etiqueta: "Título", ayuda: "Un renglón.", maximo: 20 } },
      {
        clave: "boton",
        descripcion: {
          tipo: "grupo",
          etiqueta: "Botón",
          campos: [
            { clave: "texto", descripcion: { tipo: "textoCorto", etiqueta: "Texto", maximo: 8 } },
            { clave: "ruta", descripcion: { tipo: "rutaInterna", etiqueta: "Ruta", opciones: ["/", "/contacto"] } },
          ],
        },
      },
      {
        clave: "tarjetas",
        descripcion: {
          tipo: "listaFija",
          etiqueta: "Tarjetas",
          cantidad: 2,
          item: {
            tipo: "grupo",
            etiqueta: "Tarjeta",
            campos: [
              { clave: "foto", descripcion: { tipo: "foto", etiqueta: "Foto" } },
              {
                clave: "cartel",
                descripcion: {
                  tipo: "opcional",
                  etiqueta: "Cartel",
                  de: { tipo: "grupo", etiqueta: "Cartel", campos: [{ clave: "titulo", descripcion: { tipo: "textoCorto", etiqueta: "Titulo", maximo: 5 } }] },
                },
              },
            ],
          },
        },
      },
    ],
  });
});

test("lo que no salió de campos.ts no se sabe dibujar", () => {
  assert.throws(() => describir(z.number(), "Edad"), /No sé dibujar/);
});

test(".optional() y .nullish() dan el mismo nodo opcional que .nullable()", () => {
  const esperado = { tipo: "opcional", etiqueta: "Campo", de: { tipo: "textoCorto", etiqueta: "Campo", maximo: 5 } };
  assert.deepEqual(describir(textoCorto({ maximo: 5 }).optional(), "Campo"), esperado);
  assert.deepEqual(describir(textoCorto({ maximo: 5 }).nullish(), "Campo"), esperado);
  assert.throws(() => describir(z.number().optional(), "Edad"), /No sé dibujar/);
});

test("humanizar y valorVacio", () => {
  assert.equal(humanizar("botonPrincipal"), "Boton principal");
  // El `as` es del test: valorVacio devuelve unknown a propósito y acá se sabe qué esquema se describió.
  const vacio = valorVacio(describir(esquema, "Hero")) as {
    titulo: string;
    boton: { ruta: string };
    tarjetas: Array<{ cartel: unknown; foto: { alt: string } }>;
  };
  assert.equal(vacio.titulo, "");
  assert.equal(vacio.boton.ruta, "/");
  assert.equal(vacio.tarjetas.length, 2);
  assert.equal(vacio.tarjetas[0].cartel, null);
  assert.equal(vacio.tarjetas[1].foto.alt, "");
});
