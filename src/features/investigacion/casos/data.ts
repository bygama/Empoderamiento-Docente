/**
 * Casos de investigación — DATOS DEMO desacoplados del diseño.
 *
 * Los tres casos son CONTENIDO PROVISIONAL (esDemo: true) para probar la
 * estructura del expediente con longitudes distintas. Para reemplazar un
 * caso demo por uno real: editar este archivo (textos, evidencias, lámina
 * y recursos), sin tocar componentes ni animaciones. Las láminas viven en
 * /public/investigacion/. El campo `slug` queda reservado para una futura
 * ficha individual (hoy no genera rutas).
 */

/** Tinte de carpeta — mapeado a tokens del design system en los componentes. */
export type TinteCarpeta = "navy" | "medio" | "claro" | "verde";

export type EvidenciaCaso = {
  id: string;
  /** Rótulo chico tipo expediente ("EVIDENCIA 01"). */
  rotulo: string;
  /** Título del artefacto ("REGISTRO DE AULA"). Placeholder reemplazable. */
  titulo: string;
  /** Bajada breve del contenido que representará el archivo real. */
  descripcion: string;
  /** Si puede arrastrarse en desktop (no todas: el texto esencial nunca). */
  movible: boolean;
};

export type RecursoRelacionado = {
  titulo: string;
  href: string;
};

/** Lámina visual del expediente (ilustración/registro), sujeta a la hoja. */
export type LaminaCaso = {
  src: string;
  alt: string;
  /** Cómo está sujeta a la hoja: clip metálico, cinta o esquinas de foto. */
  sujecion: "clip" | "cinta" | "esquinas";
  rotulo: string;
};

/** Ficha catalográfica: la línea de identidad del expediente abierto. */
export type FichaCaso = {
  periodo: string;
  ambito: string;
  estado: "EN CURSO" | "CERRADO";
};

export type CasoInvestigacion = {
  id: string;
  slug: string;
  numero: string;
  esDemo: boolean;
  /** Pregunta-título: el elemento editorial principal del caso. */
  pregunta: string;
  eje: string;
  /** Frase-anzuelo ultracorta del bloque de anticipación (hover cerrado). */
  indicio: string;
  ficha: FichaCaso;
  tinte: TinteCarpeta;
  contexto: string;
  preguntaInvestigacion: string;
  lamina: LaminaCaso;
  evidencias: EvidenciaCaso[];
  analisis: string;
  /** Se muestra como nota manuscrita al margen: corta y humana. */
  aprendizaje: string;
  queCambio: string;
  produccionRelacionada: RecursoRelacionado[];
  aclaracion?: string;
};

export const ETIQUETA_DEMO = "CASO DEMO — CONTENIDO PROVISIONAL";

export const CASOS: readonly CasoInvestigacion[] = [
  {
    id: "caso-01",
    slug: "comunidad-docente-problematiza-tarea",
    numero: "01",
    esDemo: true,
    pregunta:
      "¿Qué cambia cuando una comunidad docente problematiza una tarea matemática?",
    eje: "Desarrollo profesional docente",
    indicio: "Una tarea conocida, mirada de nuevo",
    ficha: {
      periodo: "2022 — 2023",
      ambito: "Escuela primaria",
      estado: "CERRADO",
    },
    tinte: "navy",
    contexto:
      "Una comunidad docente vuelve a mirar una tarea que usa hace años: la resuelve, compara estrategias y discute qué habilita — y qué no — en el aula.",
    preguntaInvestigacion:
      "¿Cómo se transforma la lectura de una tarea cuando las y los docentes dejan de verla como un ejercicio y empiezan a problematizar sus sentidos?",
    lamina: {
      src: "/investigacion/caso-01-lamina.webp",
      alt: "Ilustración de un equipo docente analizando una tarea de geometría alrededor de una mesa de trabajo",
      sujecion: "clip",
      rotulo: "LÁMINA 01 · SESIÓN DE ANÁLISIS",
    },
    evidencias: [
      {
        id: "c1-e1",
        rotulo: "EVIDENCIA 01",
        titulo: "PRODUCCIONES Y ESTRATEGIAS",
        descripcion: "Resoluciones distintas frente a la misma tarea.",
        movible: true,
      },
      {
        id: "c1-e2",
        rotulo: "EVIDENCIA 02",
        titulo: "REGISTRO DE DISCUSIÓN",
        descripcion: "Argumentos, desacuerdos y acuerdos del grupo.",
        movible: true,
      },
      {
        id: "c1-e3",
        rotulo: "EVIDENCIA 03",
        titulo: "NOTA DE REFLEXIÓN DOCENTE",
        descripcion: "Qué habilita y qué limita la consigna original.",
        movible: true,
      },
      {
        id: "c1-e4",
        rotulo: "EVIDENCIA 04",
        titulo: "VERSIÓN INICIAL",
        descripcion: "La tarea tal como llegaba al aula.",
        movible: true,
      },
      {
        id: "c1-e5",
        rotulo: "EVIDENCIA 05",
        titulo: "VERSIÓN AJUSTADA",
        descripcion: "El rediseño y las decisiones que lo sostienen.",
        movible: false,
      },
    ],
    analisis:
      "La comparación de estrategias corre la pregunta de lugar: ya no importa solo si la tarea se resuelve, sino qué formas de pensar, argumentar y participar produce en quienes la transitan.",
    aprendizaje: "Una tarea no es su consigna: es todo lo que habilita.",
    queCambio:
      "La tarea se rediseña para admitir múltiples estrategias y dar a las y los estudiantes un rol más activo.",
    produccionRelacionada: [
      { titulo: "Publicación relacionada (placeholder)", href: "/biblioteca" },
      { titulo: "Material de aula (placeholder)", href: "/biblioteca" },
    ],
    aclaracion:
      "Simulación editorial para probar la estructura. No representa todavía un proyecto específico de Empoderamiento Docente.",
  },
  {
    id: "caso-02",
    slug: "evaluacion-mas-alla-del-puntaje",
    numero: "02",
    esDemo: true,
    pregunta: "¿Qué nos dice una evaluación más allá del puntaje?",
    eje: "Evaluación y evidencia educativa",
    indicio: "Lo que un 72 no cuenta",
    ficha: {
      periodo: "2023 — 2024",
      ambito: "Escuela secundaria",
      estado: "EN CURSO",
    },
    tinte: "claro",
    contexto:
      "Un equipo necesita leer resultados de aprendizaje sin reducir la experiencia educativa a una cifra aislada.",
    preguntaInvestigacion:
      "¿Qué evidencias permiten comprender estrategias, dificultades y formas de razonamiento detrás de un resultado?",
    lamina: {
      src: "/investigacion/caso-02-lamina.webp",
      alt: "Ilustración de una planilla de evaluación integral anotada a mano, con gráficos, notas y una lapicera",
      sujecion: "cinta",
      rotulo: "LÁMINA 02 · LECTURA DE RESULTADOS",
    },
    evidencias: [
      {
        id: "c2-e1",
        rotulo: "EVIDENCIA 01",
        titulo: "INSTRUMENTO DE EVALUACIÓN",
        descripcion: "Fragmento del instrumento y sus consignas.",
        movible: true,
      },
      {
        id: "c2-e2",
        rotulo: "EVIDENCIA 02",
        titulo: "RESPUESTAS SELECCIONADAS",
        descripcion: "Estrategias, errores y razonamientos que asoman.",
        movible: true,
      },
      {
        id: "c2-e3",
        rotulo: "EVIDENCIA 03",
        titulo: "COMPARACIÓN DE ESTRATEGIAS",
        descripcion: "Caminos distintos hacia una misma respuesta.",
        movible: true,
      },
      {
        id: "c2-e4",
        rotulo: "EVIDENCIA 04",
        titulo: "NOTA DE INTERPRETACIÓN",
        descripcion: "Qué dicen los resultados leídos en contexto.",
        movible: false,
      },
    ],
    analisis:
      "Los mismos puntajes esconden recorridos distintos: al mirar respuestas, estrategias y errores aparece información que la cifra final no muestra.",
    aprendizaje: "El progreso es más que un número.",
    queCambio:
      "La evaluación deja de funcionar como cierre y empieza a orientar nuevas decisiones pedagógicas.",
    produccionRelacionada: [
      { titulo: "Marco de evaluación (placeholder)", href: "/biblioteca" },
    ],
  },
  {
    id: "caso-03",
    slug: "contenido-curricular-herramienta-pensamiento",
    numero: "03",
    esDemo: true,
    pregunta:
      "¿Cómo puede un contenido curricular convertirse en una herramienta de pensamiento?",
    eje: "Currículum y pensamiento matemático",
    indicio: "Del listado de temas al mapa de relaciones",
    ficha: {
      periodo: "2024 — 2025",
      ambito: "Equipo curricular",
      estado: "EN CURSO",
    },
    tinte: "verde",
    contexto:
      "Una revisión curricular busca conectar contenidos, prácticas y progresiones con formas de actuar matemáticamente.",
    preguntaInvestigacion:
      "¿Cómo organizar una progresión que no se limite a enumerar contenidos y permita desarrollar estrategias, argumentación y toma de decisiones?",
    lamina: {
      src: "/investigacion/caso-03-lamina.webp",
      alt: "Ilustración de una carpeta de anillas con esquemas de geometría y una docente pensando en conexiones",
      sujecion: "esquinas",
      rotulo: "LÁMINA 03 · MAPA DE PROGRESIONES",
    },
    evidencias: [
      {
        id: "c3-e1",
        rotulo: "EVIDENCIA 01",
        titulo: "MAPA CURRICULAR INICIAL",
        descripcion: "La organización vigente de contenidos.",
        movible: true,
      },
      {
        id: "c3-e2",
        rotulo: "EVIDENCIA 02",
        titulo: "ANÁLISIS DE PROGRESIONES",
        descripcion: "Cómo progresan las ideas entre grados y ciclos.",
        movible: true,
      },
      {
        id: "c3-e3",
        rotulo: "EVIDENCIA 03",
        titulo: "SITUACIONES DE APRENDIZAJE",
        descripcion: "Situaciones diseñadas para habilitar debate.",
        movible: true,
      },
      {
        id: "c3-e4",
        rotulo: "EVIDENCIA 04",
        titulo: "COMPARACIÓN DE FORMULACIONES",
        descripcion: "Una misma idea, formulada de dos maneras.",
        movible: true,
      },
      {
        id: "c3-e5",
        rotulo: "EVIDENCIA 05",
        titulo: "REGISTRO DE DECISIONES",
        descripcion: "Decisiones del equipo y sus fundamentos.",
        movible: true,
      },
      {
        id: "c3-e6",
        rotulo: "EVIDENCIA 06",
        titulo: "MATERIAL PARA DOCENTES",
        descripcion: "Orientaciones de trabajo para el aula.",
        movible: false,
      },
      {
        id: "c3-e7",
        rotulo: "EVIDENCIA 07",
        titulo: "MATERIAL PARA ESTUDIANTES",
        descripcion: "Actividades y tareas del recorrido.",
        movible: false,
      },
      {
        id: "c3-e8",
        rotulo: "EVIDENCIA 08",
        titulo: "SÍNTESIS DE HALLAZGOS",
        descripcion: "Qué aprendió el equipo en el proceso.",
        movible: false,
      },
      {
        id: "c3-e9",
        rotulo: "EVIDENCIA 09",
        titulo: "RECORRIDO AJUSTADO",
        descripcion: "La progresión final, lista para implementarse.",
        movible: false,
      },
    ],
    analisis:
      "Al contrastar el mapa inicial con situaciones de aula, la secuencia temática queda corta: las decisiones reales piden relaciones entre contenidos, prácticas y problemas — no listas.",
    aprendizaje: "Una progresión potente conecta contenidos con problemas reales.",
    queCambio:
      "Los contenidos se reorganizan en torno a relaciones, prácticas y escenarios de aprendizaje.",
    produccionRelacionada: [
      { titulo: "Guía curricular (placeholder)", href: "/biblioteca" },
      { titulo: "Situaciones de aprendizaje (placeholder)", href: "/biblioteca" },
    ],
  },
] as const;
