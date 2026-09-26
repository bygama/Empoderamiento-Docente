import { z } from "zod";
import { grupo, listaFija, textoCorto } from "@/lib/contenido/campos";
import { resaltadoExacto, resaltadoValido } from "@/lib/contenido/resaltado";
import { enlace } from "./comunes";

// «Áreas de especialización» de Inicio: el abanico de siete cartas. Copy
// oficial del cliente [[ed-copy-oficial]]: la frase va sin punto final (queda
// más limpia en la carta), el detalle con punto. El número y el ícono de cada
// carta salen de su lugar en la lista: son estructura, no copy.

const area = grupo({
  titulo: textoCorto({ maximo: 60, etiqueta: "Título" }),
  frase: textoCorto({ maximo: 70, etiqueta: "Frase", ayuda: "Va en verde, debajo del título." }),
  // En cada detalle va en negrita UNA sola idea: la que distingue al área
  // (Gastón, 2026-09-14). Una frase del texto, no una palabra suelta.
  detalle: textoCorto({
    maximo: 210,
    etiqueta: "Detalle",
    ayuda: "Una sola idea en negrita, entre **dobles asteriscos**: la que distingue al área, una frase del texto y no una palabra suelta.",
  }).refine((texto) => resaltadoValido(texto, { exactamente: 1 }), resaltadoExacto(1)),
});

export const esquemaAreas = z.object({
  titulo: textoCorto({ maximo: 40, etiqueta: "Título" }),
  bajada: textoCorto({ maximo: 150, etiqueta: "Bajada" }),
  enlace: enlace({ maximo: 40, ayuda: "Aparece cuando termina de salir la última carta." }),
  areas: listaFija(7, area, {
    etiqueta: "Áreas",
    etiquetaDelItem: "Área",
    ayuda: "Son 7: el abanico está armado para siete. Qué hacemos tiene su propia versión de las áreas: si cambiás una acá, revisala allá.",
  }),
});

export type Areas = z.infer<typeof esquemaAreas>;

/** El contenido de hoy, tal cual está en el sitio. */
export const areasInicial: Areas = {
  titulo: "Áreas de especialización",
  bajada: "Los ámbitos desde los cuales diseñamos soluciones educativas fundamentadas en la investigación y construidas para cada realidad.",
  // Salida → Investigación, que es el archivo de casos: las áreas puestas en
  // práctica. El copy lo dice, si no el salto no se entendía (Gastón, 2026-09-11).
  enlace: { texto: "Mirá los casos donde lo aplicamos", ruta: "/investigacion" },
  areas: [
    {
      titulo: "Desarrollo profesional docente",
      frase: "La experiencia como fuente de reflexión",
      detalle:
        "Impulsamos procesos de desarrollo profesional con **sustento vivencial y acompañamiento** que fortalecen la práctica, promueven la reflexión y resignifican las matemáticas.",
    },
    {
      titulo: "Materiales para la resignificación de las matemáticas",
      frase: "Cada tarea puede transformar la relación con las matemáticas",
      detalle:
        "Diseñamos materiales que median la relación entre docentes, matemáticas y aprendizaje, generando **rupturas productivas** que invitan a explorar, argumentar y resignificar.",
    },
    {
      titulo: "Currículo y arquitectura pedagógica",
      frase: "La coherencia hace posible el aprendizaje",
      detalle: "Diseñamos arquitecturas curriculares que articulan **conocimiento, progresión y sentido** para orientar trayectorias de aprendizaje.",
    },
    {
      titulo: "Evaluación para la mejora educativa",
      frase: "Comprender permite decidir",
      detalle: "Desarrollamos sistemas de evaluación que generan **evidencia situada** para comprender los aprendizajes y orientar decisiones educativas.",
    },
    {
      titulo: "Investigación en Matemática Educativa",
      frase: "La práctica produce conocimiento",
      detalle:
        "Investigamos **las prácticas educativas** para producir conocimiento, compartirlo con la comunidad científica y seguir enriqueciendo el campo de la Matemática Educativa.",
    },
    {
      titulo: "Fortalecimiento institucional",
      frase: "La continuidad hace posible las transformaciones",
      detalle:
        "Fortalecemos **capacidades institucionales** mediante el diseño de políticas, estrategias y procesos que favorecen transformaciones coherentes, sostenibles y perdurables.",
    },
    {
      titulo: "Transformación de sistemas educativos",
      frase: "La articulación hace posible las transformaciones sistémicas",
      detalle:
        "Integramos **todas las dimensiones del cambio educativo** para construir soluciones coherentes, sostenibles y pertinentes para cada realidad.",
    },
  ],
};
