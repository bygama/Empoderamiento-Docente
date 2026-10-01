import { z } from "zod";
import { foto, grupo, listaFija, textoCorto } from "@/lib/contenido/campos";
import { fotoDeRuta } from "@/lib/contenido/fotos";

// «Recién salido»: el riel de lo último que salió. Cada tarjeta abre su
// artículo en otra pestaña y se edita entera, link incluido. El link es una
// copia del que tiene el material en la Biblioteca, no una referencia: si allá
// cambia, acá se cambia a mano. El link de arriba y la tarjeta del final van
// a la Biblioteca, y esos destinos sí quedan en código. Son cinco más la del
// final: el riel está medido para esa cantidad.

const LANZAMIENTOS = 5;

// Solo https, como el link de un aliado: la tarjeta abre afuera, y desde el
// admin no se tiene que poder colar un `javascript:` ni un link a medias.
function esLinkSeguro(url: string): boolean {
  return url.startsWith("https://") && URL.canParse(url);
}

const lanzamiento = grupo({
  tipo: textoCorto({ maximo: 40, etiqueta: "Tipo", ayuda: "Chico, arriba del título: qué es y dónde salió («Libro · Gedisa 2016»)." }),
  titulo: textoCorto({ maximo: 80, etiqueta: "Título" }),
  url: textoCorto({ maximo: 500, etiqueta: "Link", ayuda: "Adónde lleva la tarjeta: el artículo en la revista, la editorial o el DOI." }).refine(
    esLinkSeguro,
    "Un link completo, que empiece con https://.",
  ),
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

/** El contenido de hoy, tal cual está en el sitio. Los cinco son destacados de la Biblioteca, con el mismo link que tienen ahí. */
export const lanzamientosDeNovedadesInicial: LanzamientosDeNovedades = {
  titulo: "Recién salido, para el aula.",
  enlace: "Ir a Biblioteca",
  lanzamientos: [
    {
      tipo: "Libro · Gedisa 2016",
      titulo: "Empoderamiento docente y Socioepistemología",
      url: "https://books.google.com/books?vid=ISBN9788416919437",
      foto: fotoDeRuta("/fotos/conferencia-problematizacion.webp", "Exposición sobre la problematización de la matemática escolar"),
    },
    // contexto-significacion: la lámina que se ve es literalmente sobre
    // resignificación, y no se repite en la página (la destacada del mismo
    // artículo lleva la foto de Daniela exponiendo).
    {
      tipo: "Artículo · RELIME 2025",
      titulo: "Resignificación del conocimiento matemático escolar",
      url: "https://doi.org/10.12802/relime.2025.28.e805",
      foto: fotoDeRuta("/fotos/contexto-significacion.webp", "Una formadora presenta un cuadro sobre contextos de significación"),
    },
    {
      tipo: "Artículo · Bolema 2025",
      titulo: "Problematizar la matemática escolar",
      url: "https://doi.org/10.1590/1980-4415v39a230249",
      foto: fotoDeRuta("/fotos/grupo-en-ronda.webp", "Un grupo discute una tarea sentado en ronda"),
    },
    {
      tipo: "Artículo · Redalyc 2016",
      titulo: "Oaxaca: una transformación colectiva",
      url: "https://www.redalyc.org/articulo.oa?id=13250921004",
      foto: fotoDeRuta("/fotos/oaxaca-taller-grupo.webp", "El grupo del taller de Oaxaca posa al cierre de un encuentro"),
    },
    {
      tipo: "Artículo · IE REDIECH 2024",
      titulo: "¿Qué significados de la derivada favorece un profesor?",
      url: "https://doi.org/10.33010/ie_rie_rediech.v15i0.1975",
      foto: fotoDeRuta("/fotos/graficas-de-datos.webp", "Una formadora explica gráficas de datos proyectadas en una pantalla"),
    },
  ],
  final: { titulo: "Toda la biblioteca", texto: "Publicaciones, materiales y proyectos, abiertos para llevar al aula." },
};
