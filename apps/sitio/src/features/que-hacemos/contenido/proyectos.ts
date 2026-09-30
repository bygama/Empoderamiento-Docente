import { z } from "zod";
import { grupo, listaFija, textoCorto } from "@/lib/contenido/campos";
import { RESALTADO_SIN_CERRAR, resaltadoExacto, resaltadoValido } from "@/lib/contenido/resaltado";
import { ESTRUCTURA } from "../components/proyectos-aplicaciones/fichas";

// «Proyectos y aplicaciones» de Qué hacemos: la sección 6 del sitemap («Líneas
// aplicadas en proyectos reales»), contada como un ARCHIVO DE FICHAS
// (2026-09-09): dos capítulos y un remate, una ficha por proyecto real con el
// número como protagonista y una sola frase. Los capítulos son los tipos de
// aplicación del doc maestro §12; los proyectos y sus cifras salen del CV de
// Daniela (2020 y 2025) y del PPTX Estructura ED
// (docs/content/que-hace-ed-fuentes.md §6).
//
// Nombres propios: solo los que el sitio ya publicaba (CENEVAL, Ciudad de
// Buenos Aires, Aprender Matemática) y los aliados autorizados (Techint).
// SEMS-SEP, OEI y el Ministerio de Educación de Argentina no se nombran: sin
// autorización (AGENTS.md §5.4). Bloom y UNESCO entran como fichas cuando
// Daniela confirme nombre y palabras. VALIDAR todo con Raquel y Daniela antes
// de producción. Los países y el pictograma de cada ficha son estructura
// (components/proyectos-aplicaciones/fichas.ts).

const ficha = grupo({
  sello: textoCorto({
    maximo: 40,
    etiqueta: "Sello",
    ayuda: "Con quién y cuándo, arriba a la derecha y en mayúsculas. Lo que separes con « · » va en renglones distintos.",
  }),
  cifra: textoCorto({ maximo: 12, etiqueta: "Cifra", ayuda: "El número que prueba el proyecto, en grande: «75.000»." }),
  unidad: textoCorto({ maximo: 28, etiqueta: "Unidad", ayuda: "Debajo de la cifra, en verde: «docentes»." }),
  nombre: textoCorto({ maximo: 60, etiqueta: "Nombre del proyecto" }),
  texto: textoCorto({ maximo: 170, etiqueta: "Texto", ayuda: "Una sola frase, de veinticinco palabras como mucho." }),
});

/** Un capítulo con la cantidad de fichas que le da el archivo. */
function capitulo(indice: number, etiqueta: string) {
  const cantidad = ESTRUCTURA[indice].fichas.length;
  return grupo(
    {
      titulo: textoCorto({ maximo: 50, etiqueta: "Título" }),
      bajada: textoCorto({
        maximo: 130,
        etiqueta: "Bajada",
        ayuda: "La idea que ordena el capítulo, entre **dobles asteriscos**, va en negrita.",
      }).refine((texto) => resaltadoValido(texto, { exactamente: 1 }), resaltadoExacto(1)),
      fichas: listaFija(cantidad, ficha, {
        etiqueta: "Fichas",
        etiquetaDelItem: "Ficha",
        ayuda: `${cantidad === 1 ? "Es una ficha" : `Son ${cantidad} fichas`}: el archivo está armado para esa cantidad. La bandera y el dibujo de cada una no se editan acá.`,
      }),
    },
    { etiqueta },
  );
}

export const esquemaProyectos = z.object({
  volanta: textoCorto({
    maximo: 40,
    etiqueta: "Volanta",
    ayuda: "El nombre de la sección, arriba. Lo que va entre **dobles asteriscos** va en azul.",
  }).refine((texto) => resaltadoValido(texto), RESALTADO_SIN_CERRAR),
  titulo: textoCorto({
    maximo: 40,
    etiqueta: "Título",
    ayuda: "El título grande de la apertura. El arranque va en azul y en su propio renglón: marcalo entre **dobles asteriscos**.",
  }).refine((texto) => resaltadoValido(texto, { exactamente: 1 }), resaltadoExacto(1)),
  capitulos: grupo(
    {
      primero: capitulo(0, "Primer capítulo"),
      segundo: capitulo(1, "Segundo capítulo"),
      tercero: capitulo(2, "Tercer capítulo (el remate)"),
    },
    { etiqueta: "Capítulos", ayuda: "El primero va de un lado del archivo; el segundo y el remate, del otro." },
  ),
});

export type ProyectosDeQueHacemos = z.infer<typeof esquemaProyectos>;

/** El contenido de hoy, tal cual está en el sitio. */
export const proyectosInicial: ProyectosDeQueHacemos = {
  volanta: "Proyectos y **aplicaciones**",
  titulo: "**Así se ve** en la práctica.",
  capitulos: {
    primero: {
      titulo: "Desarrollo profesional y acompañamiento",
      bajada: "Procesos sostenidos que dejan **capacidad instalada** en los equipos docentes.",
      fichas: [
        {
          sello: "Plan nacional · 2019",
          cifra: "75.000",
          unidad: "docentes",
          nombre: "Plan Nacional Aprender Matemática",
          texto: "Desarrollo profesional semipresencial de 500 formadoras y formadores, diseño y coordinación de 10 materiales para el aula.",
        },
        {
          sello: "2018 – 2020",
          cifra: "11.000",
          unidad: "docentes",
          nombre: "Cursos para docentes de educación media superior",
          texto: "Cursos virtuales sobre empoderamiento docente y problematización de la matemática escolar, con 400 facilitadoras y facilitadores.",
        },
        {
          sello: "2018 – 2020",
          cifra: "3.500",
          unidad: "docentes",
          nombre: "Comunidad de acompañamiento en Matemáticas",
          texto: "Una comunidad web de acceso libre para seguir el trabajo después del curso.",
        },
        {
          sello: "Monterrey · 2020",
          cifra: "300",
          unidad: "horas",
          nombre: "Líderes de Fortalecimiento",
          texto: "15 docentes formados como líderes para trabajar con más de 400 estudiantes de escuelas públicas.",
        },
      ],
    },
    segundo: {
      titulo: "Currículo, evaluación y materiales",
      bajada: "Qué se enseña, cómo se evalúa y con qué materiales, **con investigación detrás**.",
      fichas: [
        {
          sello: "CENEVAL · 2020",
          cifra: "3",
          unidad: "niveles educativos",
          nombre: "Exámenes Nacionales de Matemáticas (EXANI)",
          texto: "Diseño de marco de referencia, especificaciones y reactivos para educación media superior, superior y posgrados.",
        },
        {
          sello: "Ciudad de Buenos Aires · 2023 – 2027",
          cifra: "1.º a 7.º",
          unidad: "grado",
          nombre: "Asesoría en Matemáticas del Plan Buenos Aires Aprende",
          texto: "Colección Matemática en Red, materiales de primer ciclo, revisión de libros de texto y encuentros con coordinaciones.",
        },
        {
          sello: "Escuelas Techint · desde 2020",
          cifra: "2",
          unidad: "países, una currícula",
          nombre: "Currícula homologada de Matemáticas",
          texto: "Programas comunes entre sedes de Argentina y México, exámenes de ingreso y egreso y análisis de ganancia educativa.",
        },
      ],
    },
    tercero: {
      titulo: "Y a veces, todo junto.",
      bajada: "Cuando **un mismo proceso** articula currículo, evaluación, materiales y desarrollo profesional.",
      fichas: [
        {
          sello: "Techint Group · desde 2020",
          cifra: "3",
          unidad: "países",
          nombre: "Asesoría general en Matemáticas",
          texto: "Desarrollo profesional docente, evaluaciones, materiales, acompañamiento a líderes, diseño instruccional de programas, estructura de diplomado docente, entre otras.",
        },
      ],
    },
  },
};
