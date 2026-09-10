// ── Proyectos y aplicaciones ──────────────────────────────────────────────────
// Sección 6 del sitemap de Qué hacemos («Líneas aplicadas en proyectos
// reales»), contada como un ARCHIVO DE FICHAS (2026-09-09): dos capítulos y
// un remate, y dentro de cada uno los proyectos reales, una ficha por
// proyecto con el número como protagonista y una sola frase. Los capítulos
// son los tipos de aplicación del doc maestro §12; los proyectos y sus
// cifras salen del CV de Daniela (2020 y 2025) y del PPTX Estructura ED
// (docs/content/que-hace-ed-fuentes.md §6).
//
// Nombres propios: solo los que el sitio ya publica en los chips «Ejemplos
// de trabajo» de Áreas (CENEVAL, Ciudad de Buenos Aires, Aprender
// Matemática) y los aliados autorizados (Techint). SEMS-SEP, OEI y el
// Ministerio de Educación de Argentina no se nombran: sin autorización
// (AGENTS.md §5.4). Bloom y UNESCO entran como fichas cuando Daniela
// confirme nombre y palabras. VALIDAR todo con Raquel y Daniela antes de
// producción.

export type PictoKey =
  | "cuadernillos"
  | "cursos"
  | "comunidad"
  | "lideres"
  | "examen"
  | "materiales"
  | "curricula"
  | "paises";

export type PaisKey = "ar" | "mx" | "br" | "cl";

/** Los países donde ED trabajó, con su bandera (`Bandera.tsx`). */
export const PAISES: Record<PaisKey, string> = {
  ar: "Argentina",
  mx: "México",
  br: "Brasil",
  cl: "Chile",
};

/** «México», «Argentina y México», «Argentina, México y Brasil». */
export function nombrarPaises(paises: readonly PaisKey[]) {
  const nombres = paises.map((p) => PAISES[p]);
  if (nombres.length <= 1) return nombres.join("");
  return `${nombres.slice(0, -1).join(", ")} y ${nombres[nombres.length - 1]}`;
}

export type Ficha = {
  id: string;
  /** Dónde: la bandera con el nombre del país encabeza la ficha (Gastón,
   *  2026-09-10: que lo internacional tome protagonismo). */
  paises: readonly PaisKey[];
  /** Con quién y cuándo: el sello mono al pie. */
  sello: string;
  /** El número que prueba el proyecto, en display grande. */
  cifra: string;
  unidad: string;
  nombre: string;
  /** Una sola frase, veinte palabras como máximo. */
  texto: string;
  picto: PictoKey;
};

export type Capitulo = {
  id: string;
  titulo: string;
  bajada: string;
  fichas: readonly Ficha[];
};

export const PROYECTOS_INTRO = {
  volanta: "Proyectos y aplicaciones",
  titulo: "Así se ve en la práctica.",
} as const;

export const CAPITULOS: readonly Capitulo[] = [
  {
    id: "desarrollo-profesional",
    titulo: "Desarrollo profesional y acompañamiento",
    bajada: "Procesos sostenidos que dejan capacidad instalada en los equipos docentes.",
    fichas: [
      {
        id: "aprender-matematica",
        paises: ["ar"],
        sello: "Plan nacional · 2019",
        cifra: "75.000",
        unidad: "docentes",
        nombre: "Plan Nacional Aprender Matemática",
        texto:
          "Formación semipresencial de 500 formadoras y formadores, y coordinación de los diez cuadernillos del plan.",
        picto: "cuadernillos",
      },
      {
        id: "media-superior",
        paises: ["mx"],
        sello: "2018 – 2020",
        cifra: "11.000",
        unidad: "docentes",
        nombre: "Cursos para docentes de educación media superior",
        texto:
          "Cursos virtuales sobre empoderamiento docente y problematización de la matemática escolar, con 400 facilitadoras y facilitadores.",
        picto: "cursos",
      },
      {
        id: "comunidad",
        paises: ["mx"],
        sello: "2018 – 2020",
        cifra: "3.500",
        unidad: "docentes",
        nombre: "Comunidad de acompañamiento en Matemáticas",
        texto: "Una comunidad web de acceso libre para seguir el trabajo después del curso.",
        picto: "comunidad",
      },
      {
        id: "lideres",
        paises: ["mx"],
        sello: "Pesquería · 2020",
        cifra: "300",
        unidad: "horas",
        nombre: "Líderes de Fortalecimiento",
        texto:
          "15 docentes formados como líderes para trabajar con más de 400 estudiantes de escuelas públicas.",
        picto: "lideres",
      },
    ],
  },
  {
    id: "curriculo-evaluacion-materiales",
    titulo: "Currículo, evaluación y materiales",
    bajada: "Qué se enseña, cómo se evalúa y con qué materiales, con investigación detrás.",
    fichas: [
      {
        id: "exani",
        paises: ["mx"],
        sello: "CENEVAL · 2020",
        cifra: "3",
        unidad: "niveles educativos",
        nombre: "Exámenes Nacionales de Matemáticas (EXANI)",
        texto:
          "Marco de referencia, especificaciones y reactivos para básica, media superior y superior.",
        picto: "examen",
      },
      {
        id: "buenos-aires-aprende",
        paises: ["ar"],
        sello: "Ciudad de Buenos Aires · 2023 – 2027",
        cifra: "1.º a 7.º",
        unidad: "grado",
        nombre: "Asesoría en Matemáticas del Plan Buenos Aires Aprende",
        texto:
          "Colección Matemática en Red, materiales de primer ciclo, revisión de libros de texto y encuentros con coordinaciones.",
        picto: "materiales",
      },
      {
        id: "curricula-homologada",
        paises: ["ar", "mx"],
        sello: "Escuelas Techint · desde 2020",
        cifra: "2",
        unidad: "países, una currícula",
        nombre: "Currícula homologada de Matemáticas",
        texto:
          "Programas comunes entre sedes de Argentina y México, exámenes de ingreso y egreso y análisis de ganancia educativa.",
        picto: "curricula",
      },
    ],
  },
  {
    id: "todo-junto",
    titulo: "Y a veces, todo junto.",
    bajada:
      "Cuando un mismo proceso articula currículo, evaluación, materiales y desarrollo profesional.",
    fichas: [
      {
        id: "techint",
        paises: ["ar", "mx", "br"],
        sello: "Techint Group · desde 2020",
        cifra: "3",
        unidad: "países",
        nombre: "Asesoría general en Matemáticas",
        texto:
          "Currícula, evaluaciones, materiales, acompañamiento a líderes, becas al mérito y la estructura de un diplomado docente.",
        picto: "paises",
      },
    ],
  },
];

/** Todas las fichas en orden, con el capítulo al que pertenecen. */
export const FICHAS = CAPITULOS.flatMap((cap, c) => cap.fichas.map((f) => ({ ...f, cap: c })));
