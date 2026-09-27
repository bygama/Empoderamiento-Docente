import { z } from "zod";
import { foto, grupo, listaFija, textoCorto } from "@/lib/contenido/campos";
import { fotoDeRuta } from "@/lib/contenido/fotos";

// «Recién salido»: el riel que lleva a la Biblioteca. Los destinos (la
// Biblioteca) quedan en código; se editan los textos y las tarjetas. Son
// cinco más la del final: el riel está medido para esa cantidad.

const LANZAMIENTOS = 5;

const lanzamiento = grupo({
  tipo: textoCorto({ maximo: 40, etiqueta: "Tipo", ayuda: "Chico, arriba del título: qué es y dónde salió («Libro · Gedisa 2016»)." }),
  titulo: textoCorto({ maximo: 80, etiqueta: "Título" }),
  foto: foto({ etiqueta: "Foto", ayuda: "Acá la foto es decorativa: el título dice qué es. El texto alternativo igual queda con la foto." }),
});

export const esquemaLanzamientosDeNovedades = z.object({
  titulo: textoCorto({ maximo: 40, etiqueta: "Título" }),
  enlace: textoCorto({ maximo: 24, etiqueta: "Link de arriba", ayuda: "Lleva a la Biblioteca." }),
  lanzamientos: listaFija(LANZAMIENTOS, lanzamiento, {
    etiqueta: "Lanzamientos",
    etiquetaDelItem: "Lanzamiento",
    ayuda: `Son ${LANZAMIENTOS}, en el orden del riel.`,
  }),
  final: grupo(
    { titulo: textoCorto({ maximo: 30, etiqueta: "Título" }), texto: textoCorto({ maximo: 100, etiqueta: "Texto" }) },
    { etiqueta: "Tarjeta del final", ayuda: "Cierra el riel y lleva a la Biblioteca." },
  ),
});

export type LanzamientosDeNovedades = z.infer<typeof esquemaLanzamientosDeNovedades>;

/** El contenido de hoy, tal cual está en el sitio. Los cinco son destacados de la Biblioteca. */
export const lanzamientosDeNovedadesInicial: LanzamientosDeNovedades = {
  titulo: "Recién salido, para el aula.",
  enlace: "Ir a Biblioteca",
  lanzamientos: [
    {
      tipo: "Libro · Gedisa 2016",
      titulo: "Empoderamiento docente y Socioepistemología",
      foto: fotoDeRuta("/fotos/conferencia-problematizacion.webp", "Exposición sobre la problematización de la matemática escolar"),
    },
    // contexto-significacion: la lámina que se ve es literalmente sobre
    // resignificación, y no se repite en la página (la destacada del mismo
    // artículo lleva la foto de Daniela exponiendo).
    {
      tipo: "Artículo · RELIME 2025",
      titulo: "Resignificación del conocimiento matemático escolar",
      foto: fotoDeRuta("/fotos/contexto-significacion.webp", "Una formadora presenta un cuadro sobre contextos de significación"),
    },
    { tipo: "Artículo · Bolema 2025", titulo: "Problematizar la matemática escolar", foto: fotoDeRuta("/fotos/grupo-en-ronda.webp", "Un grupo discute una tarea sentado en ronda") },
    {
      tipo: "Artículo · Redalyc 2016",
      titulo: "Oaxaca: una transformación colectiva",
      foto: fotoDeRuta("/fotos/cierre-encuentro-grupo.webp", "Docentes posan juntos en un aula al cierre de un encuentro"),
    },
    {
      tipo: "Artículo · IE REDIECH 2024",
      titulo: "¿Qué significados de la derivada favorece un profesor?",
      foto: fotoDeRuta("/fotos/graficas-de-datos.webp", "Una formadora explica gráficas de datos proyectadas en una pantalla"),
    },
  ],
  final: { titulo: "Toda la biblioteca", texto: "Publicaciones, materiales y proyectos, abiertos para llevar al aula." },
};
