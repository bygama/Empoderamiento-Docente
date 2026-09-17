/**
 * Casos de investigación — datos desacoplados del diseño.
 *
 * Los casos 01 y 02 son REALES y están sostenidos por publicaciones con
 * arbitraje de ED (ver `produccionRelacionada` de cada uno). Todo dato de
 * esos dos sale de los papers: si algo no está publicado, no está acá.
 *
 * Los casos 03 y 04 son DEMO (`esDemo: true`): cubren las dos aplicaciones
 * que todavía no tienen caso real —evaluación y currículum— y llevan a la
 * vista la etiqueta «DEMO · PROVISIONAL» y la aclaración al pie.
 *
 * Para sumar un caso: editar este archivo (textos, evidencias, lámina y
 * recursos), sin tocar componentes ni animaciones. Las láminas viven en
 * /public/investigacion/. El campo `slug` queda reservado para una futura
 * ficha individual (hoy no genera rutas). `esDemo` sigue existiendo para
 * casos provisionales: prende la etiqueta «DEMO» y la aclaración al pie.
 *
 * PENDIENTES con el cliente:
 * - Las LÁMINAS siguen siendo las ilustraciones genéricas de los demos. Hay
 *   que reemplazarlas por registro real de esos procesos.
 * - El año de inicio del programa de escuelas técnicas: el paper no lo dice
 *   (se publicó en 2025 y está en curso). Confirmar con Dani.
 * - Si el aliado del caso 02 puede nombrarse. El paper no lo nombra y acá
 *   tampoco: se describe por el tipo de escuela y los países.
 * - `produccionRelacionada` apunta a /biblioteca, que todavía no tiene ficha
 *   por publicación. Los DOI son 10.12802/relime.2025.28.e805 (RELIME) y el
 *   artículo de Perfiles Educativos está en redalyc.org/articulo.oa?id=13250921004
 */

/** Tinte de carpeta — mapeado a tokens del design system en los componentes. */
export type TinteCarpeta = "navy" | "medio" | "claro" | "verde";

export type EvidenciaCaso = {
  id: string;
  /** Rótulo chico tipo expediente ("EVIDENCIA 01"). */
  rotulo: string;
  /** Título del artefacto, como se rotularía en un archivo real. */
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
    slug: "oaxaca-transformacion-colectiva",
    numero: "01",
    esDemo: false,
    pregunta:
      "¿Qué pasa cuando una generación docente problematiza durante dos años la matemática que enseña?",
    eje: "Empoderamiento y desarrollo profesional docente",
    indicio: "De cursar la maestría a tutorear la siguiente",
    ficha: {
      periodo: "2011 — 2013",
      ambito: "Oaxaca, México · Secundaria",
      estado: "CERRADO",
    },
    tinte: "navy",
    contexto:
      "Veintiocho profesoras y profesores de secundaria cursan la Maestría en la Enseñanza de las Matemáticas en la Educación Secundaria del Instituto Estatal de Educación Pública de Oaxaca. Cuatrocientas ochenta horas institucionales, en encuentros de fin de semana, donde se problematizan lo trigonométrico, lo proporcional, lo exponencial, lo geométrico y lo variacional.",
    preguntaInvestigacion:
      "¿Cómo se transforma la relación de un cuerpo docente con el saber matemático cuando la intervención parte de potenciar sus fortalezas y no de señalar sus carencias?",
    lamina: {
      src: "/investigacion/caso-01-lamina.webp",
      alt: "Ilustración de un equipo docente analizando una tarea de geometría alrededor de una mesa de trabajo",
      sujecion: "clip",
      rotulo: "LÁMINA 01 · SEMINARIO DE PROBLEMATIZACIÓN",
    },
    evidencias: [
      {
        id: "c1-e1",
        rotulo: "EVIDENCIA 01",
        titulo: "SEMINARIOS DE PROBLEMATIZACIÓN",
        descripcion:
          "Cuarenta horas reloj por saber; alguno se extendió a ochenta.",
        movible: true,
      },
      {
        id: "c1-e2",
        rotulo: "EVIDENCIA 02",
        titulo: "REGISTRO DE TUTORÍAS",
        descripcion:
          "Ocho episodios de trabajo con la segunda generación, unas cien horas.",
        movible: true,
      },
      {
        id: "c1-e3",
        rotulo: "EVIDENCIA 03",
        titulo: "DISEÑO: COLOR Y PROPORCIÓN",
        descripcion:
          "Rebeca funde matemática y arte con los colores primarios y secundarios.",
        movible: true,
      },
      {
        id: "c1-e4",
        rotulo: "EVIDENCIA 04",
        titulo: "DISEÑO: LA JÍCARA",
        descripcion:
          "Rigoberto Díaz construye volumen y capacidad desde una unidad de medida propia.",
        movible: true,
      },
      {
        id: "c1-e5",
        rotulo: "EVIDENCIA 05",
        titulo: "DISEÑO: EL PAPALOTE",
        descripcion:
          "Isabel Sánchez explicita el pensamiento trigonométrico de algo que ya hacía en clase.",
        movible: false,
      },
    ],
    analisis:
      "El dispositivo no lleva una propuesta para aplicar: pone el saber matemático en discusión y deja que cada docente diseñe desde su contexto. Por eso los diseños que salen no se parecen entre sí — una jícara, un papalote, una paleta de colores— y sin embargo todos problematizan lo mismo.",
    aprendizaje: "El acompañamiento no termina con el curso: ahí recién empieza.",
    queCambio:
      "Dos docentes de la primera generación pasaron a tutorear la segunda. Algunos convirtieron sus diseños en tesis; la mayoría transformó su práctica y sigue en contacto con la comunidad.",
    produccionRelacionada: [
      { titulo: "Reyes-Gasperini (2016) · Perfiles Educativos", href: "/biblioteca" },
      { titulo: "Empoderamiento docente y Socioepistemología (Gedisa)", href: "/biblioteca" },
    ],
  },
  {
    id: "caso-02",
    slug: "resignificacion-escuelas-tecnicas",
    numero: "02",
    esDemo: false,
    pregunta:
      "¿Cómo cambia la relación de una docente con el saber que enseña, ciclo tras ciclo?",
    eje: "Resignificación del conocimiento matemático",
    indicio: "Vivir la tarea antes de darla",
    ficha: {
      periodo: "2025",
      ambito: "Escuelas técnicas · Argentina, México, Brasil y Colombia",
      estado: "EN CURSO",
    },
    tinte: "medio",
    contexto:
      "Un programa sostenido con docentes en servicio de escuelas técnicas públicas de cuatro países. Cada ciclo revisa un pensamiento matemático y dura entre tres y cinco meses: primero el cuerpo docente atraviesa las tareas, después las lleva al aula y por último analiza en conjunto lo que ocurrió.",
    preguntaInvestigacion:
      "¿Cómo se configura la resignificación del conocimiento matemático escolar en un espacio sostenido de desarrollo profesional docente?",
    lamina: {
      src: "/investigacion/caso-03-lamina.webp",
      alt: "Ilustración de una carpeta de anillas con esquemas de geometría y una docente pensando en conexiones",
      sujecion: "esquinas",
      rotulo: "LÁMINA 02 · GUÍA DE TAREAS DISRUPTIVAS",
    },
    evidencias: [
      {
        id: "c2-e1",
        rotulo: "EVIDENCIA 01",
        titulo: "GUÍA DE TAREAS DISRUPTIVAS",
        descripcion: "Entre siete y diez tareas por año escolar, en dos versiones.",
        movible: true,
      },
      {
        id: "c2-e2",
        rotulo: "EVIDENCIA 02",
        titulo: "VERSIÓN DOCENTE",
        descripcion:
          "Intencionalidad didáctica, estrategias posibles, errores esperados y bibliografía.",
        movible: true,
      },
      {
        id: "c2-e3",
        rotulo: "EVIDENCIA 03",
        titulo: "PRE-TEST Y CIERRE",
        descripcion: "Cinco preguntas al abrir y cinco al cerrar, que se confrontan.",
        movible: true,
      },
      {
        id: "c2-e4",
        rotulo: "EVIDENCIA 04",
        titulo: "EPISODIO ALGEBRAICO",
        descripcion: "Una experiencia de secundaria en Argentina.",
        movible: true,
      },
      {
        id: "c2-e5",
        rotulo: "EVIDENCIA 05",
        titulo: "EPISODIO GEOMÉTRICO",
        descripcion: "Una experiencia de secundaria en Colombia.",
        movible: false,
      },
    ],
    analisis:
      "Los indicadores rastrean tres cosas distintas: cuándo hay confrontación, cuándo hay resignificación y cuándo cambia de verdad la relación con el saber. Lo epistémico aparece con fuerza en la fase experiencial; lo didáctico se consolida recién en las que siguen.",
    aprendizaje: "Resignificar no es un estado al que se llega: es lo que se vuelve a andar cada ciclo.",
    queCambio:
      "El conocimiento matemático escolar pasa a ser objeto de discusión profesional dentro del espacio de formación, y los resultados de cada ciclo sostienen las decisiones del siguiente.",
    produccionRelacionada: [
      { titulo: "Reyes-Gasperini y Gómez-Osalde (2025) · RELIME", href: "/biblioteca" },
    ],
  },
  {
    id: "caso-03",
    slug: "evaluacion-mas-alla-del-puntaje",
    numero: "03",
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
      rotulo: "LÁMINA 03 · LECTURA DE RESULTADOS",
    },
    evidencias: [
      {
        id: "c3-e1",
        rotulo: "EVIDENCIA 01",
        titulo: "INSTRUMENTO DE EVALUACIÓN",
        descripcion: "Fragmento del instrumento y sus consignas.",
        movible: true,
      },
      {
        id: "c3-e2",
        rotulo: "EVIDENCIA 02",
        titulo: "RESPUESTAS SELECCIONADAS",
        descripcion: "Estrategias, errores y razonamientos que asoman.",
        movible: true,
      },
      {
        id: "c3-e3",
        rotulo: "EVIDENCIA 03",
        titulo: "COMPARACIÓN DE ESTRATEGIAS",
        descripcion: "Caminos distintos hacia una misma respuesta.",
        movible: true,
      },
      {
        id: "c3-e4",
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
    aclaracion:
      "Simulación editorial para probar la estructura. No representa todavía un proyecto específico de Empoderamiento Docente.",
  },
  {
    id: "caso-04",
    slug: "contenido-curricular-herramienta-pensamiento",
    numero: "04",
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
      src: "/investigacion/caso-01-lamina.webp",
      alt: "Ilustración de un equipo docente analizando una tarea de geometría alrededor de una mesa de trabajo",
      sujecion: "esquinas",
      rotulo: "LÁMINA 04 · MAPA DE PROGRESIONES",
    },
    evidencias: [
      {
        id: "c4-e1",
        rotulo: "EVIDENCIA 01",
        titulo: "MAPA CURRICULAR INICIAL",
        descripcion: "La organización vigente de contenidos.",
        movible: true,
      },
      {
        id: "c4-e2",
        rotulo: "EVIDENCIA 02",
        titulo: "ANÁLISIS DE PROGRESIONES",
        descripcion: "Cómo progresan las ideas entre grados y ciclos.",
        movible: true,
      },
      {
        id: "c4-e3",
        rotulo: "EVIDENCIA 03",
        titulo: "SITUACIONES DE APRENDIZAJE",
        descripcion: "Situaciones diseñadas para habilitar debate.",
        movible: true,
      },
      {
        id: "c4-e4",
        rotulo: "EVIDENCIA 04",
        titulo: "COMPARACIÓN DE FORMULACIONES",
        descripcion: "Una misma idea, formulada de dos maneras.",
        movible: true,
      },
      {
        id: "c4-e5",
        rotulo: "EVIDENCIA 05",
        titulo: "REGISTRO DE DECISIONES",
        descripcion: "Decisiones del equipo y sus fundamentos.",
        movible: true,
      },
      {
        id: "c4-e6",
        rotulo: "EVIDENCIA 06",
        titulo: "MATERIAL PARA DOCENTES",
        descripcion: "Orientaciones de trabajo para el aula.",
        movible: false,
      },
      {
        id: "c4-e7",
        rotulo: "EVIDENCIA 07",
        titulo: "MATERIAL PARA ESTUDIANTES",
        descripcion: "Actividades y tareas del recorrido.",
        movible: false,
      },
      {
        id: "c4-e8",
        rotulo: "EVIDENCIA 08",
        titulo: "SÍNTESIS DE HALLAZGOS",
        descripcion: "Qué aprendió el equipo en el proceso.",
        movible: false,
      },
      {
        id: "c4-e9",
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
    aclaracion:
      "Simulación editorial para probar la estructura. No representa todavía un proyecto específico de Empoderamiento Docente.",
  },
] as const;
