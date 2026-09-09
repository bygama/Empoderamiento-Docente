// ── Proyectos y aplicaciones ──────────────────────────────────────────────────
// Sección 6 del sitemap de Qué hacemos («Líneas aplicadas en proyectos
// reales»). La estructura es la decisión editorial del doc maestro §12: tres
// TIPOS de aplicación, que se sostienen sin nombres propios. Dentro de cada
// tipo, los proyectos que lo muestran, tomados del CV de Daniela (2020 y
// 2025) y del PPTX Estructura ED (docs/content/que-hace-ed-fuentes.md §6).
//
// Nombres propios: solo los que el sitio ya publica en los chips «Ejemplos
// de trabajo» de Áreas (CENEVAL, Ciudad de Buenos Aires, Aprender
// Matemática) y los aliados autorizados (Techint). SEMS-SEP, OEI y el
// Ministerio de Educación de Argentina no se nombran: sin autorización
// (AGENTS.md §5.4). Los de 2018-2020 se hicieron desde el programa del
// Cinvestav que coordinaba Daniela. VALIDAR todo con Raquel y Daniela antes
// de producción.

export type Proyecto = {
  nombre: string;
  /** Con quién y dónde. */
  con: string;
  cuando?: string;
  que: string;
};

export type TipoAplicacion = {
  id: string;
  nombre: string;
  /** Cuándo una institución llega por acá (doc maestro §12). */
  texto: string;
  proyectos: readonly Proyecto[];
};

export const PROYECTOS_INTRO = {
  volanta: "Proyectos y aplicaciones",
  titulo: "Así se ve en la práctica.",
  texto:
    "Tres formas en que las instituciones nos convocan, y algunos de los proyectos que las muestran. Cada uno se diseñó para su contexto, con la investigación como respaldo.",
} as const;

export const TIPOS_APLICACION: readonly TipoAplicacion[] = [
  {
    id: "desarrollo-profesional",
    nombre: "Desarrollo profesional y acompañamiento",
    texto:
      "Instituciones y redes que buscan fortalecer a sus equipos docentes inician procesos sostenidos: experiencias formativas, comunidades de aprendizaje, trabajo con liderazgos y análisis de lo que ocurre en el aula. El acompañamiento continúa durante la implementación y deja capacidad instalada: criterios, herramientas y decisiones que el equipo sostiene por sí mismo.",
    proyectos: [
      {
        nombre: "Cursos y talleres para docentes de educación media superior",
        con: "México",
        cuando: "2018 – 2020",
        que: "Más de 11.000 docentes y 400 facilitadores en cursos virtuales sobre empoderamiento docente y problematización de la matemática escolar, más una comunidad web de acceso libre para 3.500 docentes.",
      },
      {
        nombre: "Plan Nacional Aprender Matemática",
        con: "Argentina",
        cuando: "2019",
        que: "Formación semipresencial de 500 formadores que llegaron a 75.000 docentes, y coordinación de los diez cuadernillos del plan.",
      },
      {
        nombre: "Líderes de Fortalecimiento",
        con: "Escuela técnica Techint · Pesquería, México",
        cuando: "2020",
        que: "Taller virtual de 300 horas para formar a 15 docentes como líderes que trabajan con más de 400 estudiantes de escuelas públicas cercanas.",
      },
    ],
  },
  {
    id: "curriculo-evaluacion-materiales",
    nombre: "Currículo, evaluación y materiales",
    texto:
      "Cuando el desafío pasa por qué se enseña y cómo se evalúa, diseñamos y revisamos currículas, progresiones y programas, construimos instrumentos de evaluación y producimos materiales que habilitan estrategias, argumentación y participación. Cada pieza se fundamenta en investigación y se ajusta con la evidencia de su uso real.",
    proyectos: [
      {
        nombre: "Exámenes Nacionales de Matemáticas (EXANI)",
        con: "CENEVAL · México",
        cuando: "2020",
        que: "Marco de referencia, especificaciones y reactivos para los niveles básico, medio superior y superior.",
      },
      {
        nombre: "Colección Matemática en Red",
        con: "Ministerio de Educación de la Ciudad de Buenos Aires",
        cuando: "2024",
        que: "Materiales para primer ciclo y orientación conceptual del área de Matemática, con encuentros de acompañamiento a las coordinaciones.",
      },
      {
        nombre: "Currícula homologada de Matemáticas",
        con: "Escuelas técnicas Techint · Argentina y México",
        cuando: "desde 2020",
        que: "Programas homologados entre sedes, exámenes de ingreso y de egreso, guías para estudiantes y análisis de ganancia educativa entre generaciones.",
      },
    ],
  },
  {
    id: "asesoria-integral",
    nombre: "Asesoría y proyectos institucionales integrales",
    texto:
      "Ministerios, fundaciones y organizaciones nos convocan para definir políticas, programas y modelos de intervención, o para articular una transformación completa: diagnóstico, desarrollo profesional, currículo, materiales, evaluación y seguimiento coordinados en un mismo proceso, con mirada situada y horizonte de sostenibilidad.",
    proyectos: [
      {
        nombre: "Asesoría general en Matemáticas",
        con: "Techint Group · Argentina, México y Brasil",
        cuando: "desde 2020",
        que: "Currículo, evaluaciones, materiales, workshops y acompañamiento a líderes, becas al mérito y la estructura de un diplomado docente, coordinados en un mismo proceso.",
      },
      {
        nombre: "Currículo de Matemáticas de la educación media superior",
        con: "México",
        que: "Participación en el diseño del currículo nacional de Matemáticas del nivel medio superior.",
      },
    ],
  },
];
