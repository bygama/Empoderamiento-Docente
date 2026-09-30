import { z } from "zod";
import { foto, textoCorto } from "@/lib/contenido/campos";
import { fotoDeRuta } from "@/lib/contenido/fotos";
import { cuerpoConResaltado } from "./comunes";

// «Misión» de Inicio: el panel que revela el barrido verde, espejo de «¿Quiénes
// somos?». Frase-propósito del cliente más la misión oficial de ED
// [[ed-copy-oficial]]: se edita, pero no se parafrasea sin chequear con ED.

export const esquemaMision = z.object({
  titulo: textoCorto({ maximo: 30, etiqueta: "Título" }),
  cuerpo: cuerpoConResaltado(),
  foto: foto({ etiqueta: "Foto" }),
});

export type Mision = z.infer<typeof esquemaMision>;

/** El contenido de hoy, tal cual está en el sitio. */
export const misionInicial: Mision = {
  titulo: "Misión",
  cuerpo: [
    "Hacer que **las matemáticas** se conviertan en una oportunidad **para comprender, decidir y transformar el mundo.**",
    "Proponemos escenarios en los que las y los participantes vivan procesos de **empoderamiento,** reconocido como un **cambio de relación con la matemática escolar,** a través de estrategias basadas en la investigación y la teoría educativa, para promover la **transformación y la mejora educativa.**",
  ].join("\n\n"),
  foto: fotoDeRuta("/fotos/docentes-encuentro-formacion.webp", "Docentes participando de una propuesta de Empoderamiento Docente"),
};
