import { z } from "zod";
import { grupo, listaFija, textoCorto } from "@/lib/contenido/campos";
import { unaResaltada } from "./comunes";

// «Líneas de investigación»: la carpeta de la hoja 02 con las seis preguntas.
// Taxonomía de seis líneas del doc maestro, en su orden canónico; los nombres
// oficiales están para VALIDAR con ED antes del lanzamiento. Preguntas
// literales de docs/content/arquitectura-investigacion.md §5: solo nombre y
// pregunta, la protagonista es la pregunta (decisión 2026-09-14). El caso que
// abre cada línea no es de acá: va por su lugar en la lista (SPEC §4).

const linea = grupo({
  nombre: textoCorto({ maximo: 80, etiqueta: "Nombre", ayuda: "Chico, arriba de la pregunta." }),
  pregunta: unaResaltada({
    maximo: 190,
    etiqueta: "Pregunta",
    ayuda: "La protagonista del papel. La parte entre **dobles asteriscos** la subraya el marcador verde.",
  }),
});

export const esquemaLineas = z.object({
  antetitulo: textoCorto({ maximo: 40, etiqueta: "Antetítulo" }),
  titulo: unaResaltada({ maximo: 60, etiqueta: "Título", ayuda: "La parte entre **dobles asteriscos** lleva el marcador verde." }),
  bajada: textoCorto({ maximo: 40, etiqueta: "Bajada" }),
  boton: textoCorto({ maximo: 40, etiqueta: "Botón", ayuda: "Lleva a los casos." }),
  lineas: listaFija(6, linea, {
    etiqueta: "Líneas",
    etiquetaDelItem: "Línea",
    ayuda: "Son 6. El «Ver en acción» de cada una abre el caso que le toca por su lugar en la lista: si una línea cambia de tema, ese cruce se revisa en el código.",
  }),
});

export type Lineas = z.infer<typeof esquemaLineas>;

/** El contenido de hoy, tal cual está en el sitio. */
export const lineasInicial: Lineas = {
  antetitulo: "No son servicios. Son preguntas.",
  titulo: "Qué **estudiamos** y qué buscamos comprender.",
  bajada: "Los grandes temas que estudia ED",
  boton: "Mirá la investigación en acción",
  lineas: [
    {
      nombre: "Empoderamiento y desarrollo profesional docente",
      pregunta:
        "¿Cómo se transforma la relación de las y los docentes con el saber y qué condiciones fortalecen su autonomía y **capacidad de acción**?",
    },
    {
      nombre: "Socioepistemología y construcción social del conocimiento matemático",
      pregunta: "¿Cómo se construye, usa y **resignifica** el conocimiento matemático en prácticas sociales y contextos educativos?",
    },
    {
      nombre: "Discurso y problematización de la matemática escolar",
      pregunta:
        "¿Qué formas de presentar la matemática **se han naturalizado** y cómo pueden revisarse para ampliar sentidos, estrategias y posibilidades de aprendizaje?",
    },
    {
      nombre: "Desarrollo y funcionalidad del pensamiento matemático",
      pregunta:
        "¿Cómo pueden los contenidos escolares convertirse en **herramientas para decidir**, argumentar, interpretar información y actuar en el mundo?",
    },
    {
      nombre: "Escenarios, currículum y recursos para el aprendizaje",
      pregunta:
        "¿Qué condiciones, tareas, currículas y materiales habilitan participación, múltiples estrategias, debate y **construcción de sentido**?",
    },
    {
      nombre: "Evidencia, evaluación y mejora educativa",
      pregunta:
        "¿Qué evidencias permiten comprender una intervención, interpretar sus efectos y tomar mejores decisiones sin reducir el aprendizaje **a una cifra**?",
    },
  ],
};
