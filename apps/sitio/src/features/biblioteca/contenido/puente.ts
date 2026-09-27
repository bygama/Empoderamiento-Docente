import { z } from "zod";
import { foto, grupo, listaFija, textoCorto } from "@/lib/contenido/campos";
import { fotoDeRuta } from "@/lib/contenido/fotos";

// «Puente a Investigación» de Biblioteca: la pila de lomos, un panel por tipo
// de recurso. Son cuatro porque la pila está armada para cuatro, y el color de
// cada panel sale de su lugar. El mapeo recurso → línea es inferido del
// modelo conceptual: VALIDAR con el cliente. Los destinos de los botones
// quedan en código (SPEC §4).

const recurso = grupo({
  nombre: textoCorto({
    maximo: 18,
    etiqueta: "Nombre",
    ayuda: "Va también en el lomo del panel, en vertical y en un renglón.",
  }),
  descripcion: textoCorto({ maximo: 170, etiqueta: "Descripción" }),
  linea: textoCorto({ maximo: 64, etiqueta: "Línea de la que nace", ayuda: "Debajo de «Nace de la línea»." }),
  foto: foto({
    etiqueta: "Foto",
    ayuda: "Acá la foto es decorativa: el lector de pantalla la saltea, porque el panel ya dice todo. El texto alternativo igual queda con la foto, para donde se use.",
  }),
});

export const esquemaPuente = z.object({
  titulo: textoCorto({ maximo: 55, etiqueta: "Título" }),
  botonPrincipal: textoCorto({ maximo: 25, etiqueta: "Botón principal", ayuda: "Lleva a Investigación." }),
  botonSecundario: textoCorto({ maximo: 25, etiqueta: "Botón secundario", ayuda: "Lleva a Novedades." }),
  recursos: listaFija(4, recurso, {
    etiqueta: "Recursos",
    etiquetaDelItem: "Recurso",
    ayuda: "Son 4: la pila de lomos está armada para cuatro. El color de cada panel sale de su lugar en la lista.",
  }),
});

export type Puente = z.infer<typeof esquemaPuente>;

/** El contenido de hoy, tal cual está en el sitio. */
export const puenteInicial: Puente = {
  titulo: "Detrás de cada recurso, una investigación.",
  botonPrincipal: "Ir a Investigación",
  botonSecundario: "Ver novedades",
  recursos: [
    {
      nombre: "Publicaciones",
      descripcion:
        "La producción académica que sostiene todo lo demás: artículos, capítulos y libros con lo que investigamos junto a escuelas y equipos docentes.",
      linea: "Resignificación del conocimiento matemático escolar",
      foto: fotoDeRuta("/fotos/contexto-significacion.webp", "Una formadora presenta un cuadro sobre contextos de significación"),
    },
    {
      nombre: "Materiales",
      descripcion: "Secuencias y tareas probadas en aulas reales, listas para adaptar y llevar a la propia práctica.",
      linea: "Tareas disruptivas y matemática funcional",
      foto: fotoDeRuta("/fotos/cubos-mano.webp", "Cubos de papel armados en la palma de una mano"),
    },
    {
      nombre: "Proyectos",
      descripcion: "El trabajo sostenido con escuelas y comunidades, documentado para que otros equipos puedan retomarlo.",
      linea: "Desarrollo profesional docente sostenido",
      foto: fotoDeRuta("/fotos/docentes-trabajan-aula.webp", "Docentes resuelven una tarea en un aula"),
    },
    {
      nombre: "Guías",
      descripcion: "Orientaciones paso a paso para llevar las ideas al aula sin perderse en el camino.",
      linea: "Desarrollo del pensamiento matemático",
      foto: fotoDeRuta("/fotos/formadora-recorre-aula.webp", "Una formadora recorre el aula y acompaña a docentes que resuelven una actividad"),
    },
  ],
};
