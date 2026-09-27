import { z } from "zod";
import { foto, grupo, listaFija, textoCorto } from "@/lib/contenido/campos";
import { fotoDeRuta } from "@/lib/contenido/fotos";
import { RESALTADO_SIN_CERRAR, resaltadoExacto, resaltadoValido } from "@/lib/contenido/resaltado";
import { ANCLAS_DE_AREAS } from "../components/areas/anclas";

// «Áreas de especialización» de Qué hacemos: las SIETE áreas, en el orden y
// con el copy que validó la dirección general (Daniela). Se llaman así y no
// «de desarrollo»: es el nombre de las fuentes —lo que escribió Raquel en
// julio y lo que validó Daniela, en docs/content/que-hace-ed-fuentes.md—, y
// el rename del 2026-09-12 quedó descartado (Mateo, 2026-09-15). Antes eran
// seis, las del cartel de la oficina: el 2026-09-09 la dirección validó las
// siete, entraron «Fortalecimiento institucional» y «Transformación de
// sistemas educativos» y salió «Acompañamiento», que sigue nombrado dentro de
// Desarrollo profesional.
//
// Lo específico de esta página —qué te llevás, para quién— viene de docs/content/que-hace-ed-fuentes.md
// §3 y §6. Los «hechos» con nombre y cifra que se mostraban al pie de cada
// área salieron el 2026-09-09 a pedido del owner y nunca pasaron la
// validación de Raquel y Daniela: no se editan ni se publican, y quedan
// textuales en docs/content/copy-que-hacemos.md §3 para cuando se decida.
//
// Copy: sustantivos abarcativos, «Matemáticas» con S cuando es el sustantivo,
// sin punto final en las líneas cortas (pedido de Raquel).

const area = grupo({
  titulo: textoCorto({ maximo: 60, etiqueta: "Título", ayuda: "El nombre completo del área, tal cual el cartel." }),
  nombreCorto: textoCorto({
    maximo: 24,
    etiqueta: "Nombre corto",
    ayuda: "En el índice de la izquierda y en los botones del hero: tiene que entrar en una columna angosta.",
  }),
  frase: textoCorto({ maximo: 70, etiqueta: "Frase", ayuda: "La idea fuerza, en verde, debajo del título." }),
  // Una sola idea marcada por detalle: la que distingue al área (Gastón,
  // 2026-09-14). Acá el detalle se lee entero, sin negrita.
  detalle: textoCorto({
    maximo: 210,
    etiqueta: "Detalle",
    ayuda: "Qué es el área, en una o dos oraciones. Una sola idea entre **dobles asteriscos**: la que distingue al área, una frase del texto y no una palabra suelta. Acá se lee sin negrita.",
  }).refine((texto) => resaltadoValido(texto, { exactamente: 1 }), resaltadoExacto(1)),
  teLlevas: listaFija(3, textoCorto({ maximo: 32, etiqueta: "Punto" }), {
    etiqueta: "Qué te llevás",
    etiquetaDelItem: "Punto",
    ayuda: "Tres puntos cortos, uno por renglón: la ficha está armada para tres y los siete paneles quedan del mismo alto.",
  }),
  paraQuien: textoCorto({ maximo: 90, etiqueta: "Para quién", ayuda: "Una frase, sin punto final." }),
  foto: foto({ etiqueta: "Foto" }),
});

export const esquemaAreas = z.object({
  titulo: textoCorto({
    maximo: 40,
    etiqueta: "Título",
    ayuda: "Arriba del índice, en gris. Lo que va entre **dobles asteriscos** va en azul.",
  }).refine((texto) => resaltadoValido(texto), RESALTADO_SIN_CERRAR),
  rotulos: grupo(
    {
      teLlevas: textoCorto({ maximo: 24, etiqueta: "Qué te llevás" }),
      paraQuien: textoCorto({ maximo: 24, etiqueta: "Para quién" }),
    },
    { etiqueta: "Rótulos de la ficha", ayuda: "Los dos títulos chicos del panel de cada área, en mayúsculas." },
  ),
  areas: listaFija(ANCLAS_DE_AREAS.length, area, {
    etiqueta: "Áreas",
    etiquetaDelItem: "Área",
    ayuda: `Son ${ANCLAS_DE_AREAS.length}, en este orden: el índice, los botones del hero y las anclas están armados para esa cantidad.`,
  }),
});

export type AreasDeQueHacemos = z.infer<typeof esquemaAreas>;
export type AreaDeQueHacemos = AreasDeQueHacemos["areas"][number];

/** El contenido de hoy, tal cual está en el sitio. */
export const areasInicial: AreasDeQueHacemos = {
  titulo: "Áreas de **especialización**",
  rotulos: { teLlevas: "Qué te llevás", paraQuien: "Para quién" },
  areas: [
    {
      titulo: "Desarrollo profesional docente",
      nombreCorto: "Desarrollo profesional",
      frase: "La experiencia como fuente de reflexión",
      detalle:
        "Impulsamos procesos de desarrollo profesional con **sustento vivencial y acompañamiento** que fortalecen la práctica, promueven la reflexión y resignifican las matemáticas.",
      teLlevas: ["Dispositivo a tu medida", "Formación de liderazgos", "Seguimiento en el aula"],
      paraQuien: "Ministerios, empresas, fundaciones y redes que forman a escala",
      foto: fotoDeRuta("/fotos/formadora-mesas-redondas.webp", "Una formadora conversa con docentes sentados en mesas redondas"),
    },
    {
      titulo: "Materiales para la resignificación de las matemáticas",
      nombreCorto: "Materiales didácticos",
      frase: "Cada tarea puede transformar la relación con las matemáticas",
      detalle:
        "Diseñamos materiales que median la relación entre docentes, matemáticas y aprendizaje, generando **rupturas productivas** que invitan a explorar, argumentar y resignificar.",
      teLlevas: ["Colecciones didácticas", "Situaciones de aprendizaje", "Recursos digitales"],
      paraQuien: "Sistemas y redes que necesitan materiales propios para su contexto",
      foto: fotoDeRuta("/fotos/cubos-mano.webp", "Cubos de papel armados en la palma de una mano"),
    },
    {
      titulo: "Currículo y arquitectura pedagógica",
      nombreCorto: "Currículo",
      frase: "La coherencia hace posible el aprendizaje",
      detalle: "Diseñamos arquitecturas curriculares que articulan **conocimiento, progresión y sentido** para orientar trayectorias de aprendizaje.",
      teLlevas: ["Marcos y programas", "Homologación entre sedes", "Mapas de progresión"],
      paraQuien: "Ministerios y redes que necesitan coherencia entre qué, cómo y cuándo",
      foto: fotoDeRuta("/fotos/planilla-proyectada.webp", "Docentes trabajan en una mesa frente a una planilla proyectada"),
    },
    {
      titulo: "Evaluación para la mejora educativa",
      nombreCorto: "Evaluación",
      frase: "Comprender permite decidir",
      detalle: "Desarrollamos sistemas de evaluación que generan **evidencia situada** para comprender los aprendizajes y orientar decisiones educativas.",
      teLlevas: ["Instrumentos validados", "Análisis psicométrico", "Informes para decidir"],
      paraQuien: "Instituciones que quieren decidir con evidencia sobre los aprendizajes",
      foto: fotoDeRuta("/fotos/comparar-tareas-ronda.webp", "Docentes en ronda durante la actividad «Comparar tareas: ¿A o B?»"),
    },
    {
      titulo: "Investigación en Matemática Educativa",
      nombreCorto: "Investigación",
      frase: "La práctica produce conocimiento",
      detalle:
        "Investigamos **las prácticas educativas** para producir conocimiento, compartirlo con la comunidad científica y seguir enriqueciendo el campo de la Matemática Educativa.",
      teLlevas: ["Estudios y sistematización", "Evidencia para decidir", "Publicaciones y difusión"],
      paraQuien: "Ministerios, universidades y redes que necesitan evidencia de sus aulas",
      foto: fotoDeRuta("/fotos/contexto-significacion.webp", "Una formadora presenta un cuadro sobre contextos de significación"),
    },
    {
      titulo: "Fortalecimiento institucional",
      nombreCorto: "Fortalecimiento",
      frase: "La continuidad hace posible las transformaciones",
      detalle:
        "Fortalecemos **capacidades institucionales** mediante el diseño de políticas, estrategias y procesos que favorecen transformaciones coherentes, sostenibles y perdurables.",
      teLlevas: ["Asesoría a instituciones", "Diseño de políticas", "Gestión del cambio"],
      paraQuien: "Instituciones que necesitan sostener sus transformaciones en el tiempo",
      foto: fotoDeRuta("/fotos/encuentro-institucional.webp", "Docentes e instituciones reunidas en un encuentro en México"),
    },
    {
      titulo: "Transformación de sistemas educativos",
      nombreCorto: "Sistemas educativos",
      frase: "La articulación hace posible las transformaciones sistémicas",
      detalle:
        "Integramos **todas las dimensiones del cambio educativo** para construir soluciones coherentes, sostenibles y pertinentes para cada realidad.",
      teLlevas: ["Diagnóstico y diseño", "Implementación y monitoreo", "Evaluación de impacto"],
      paraQuien: "Sistemas educativos que articulan todas las dimensiones del cambio",
      foto: fotoDeRuta("/fotos/salon-mesas-redondas.webp", "Docentes trabajan en mesas redondas en un salón de encuentros"),
    },
  ],
};
