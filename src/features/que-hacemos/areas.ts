// Qué hace ED, en texto plano. Es lo que la web tiene que decir antes de
// cualquier animación.
//
// Las SEIS áreas son las del cartel oficial de la oficina (2026): ese orden y
// esos nombres. Cada una lleva la frase «en verde» y la descripción que
// escribió Raquel en julio de 2026 («cambios en la página»), y lo que hay
// documentado de entregables y proyectos (docs/content/que-hace-ed-fuentes.md,
// §3 y §6). Los «hechos» con nombre y número salen del CV de Daniela y del
// PPTX institucional: VALIDAR con Raquel y Daniela antes del lanzamiento
// (docs/content/copy-que-hacemos.md es la versión para que corrijan).
//
// Copy: sustantivos abarcativos, «Matemáticas» con S cuando es el sustantivo,
// sin punto final en las líneas cortas (pedido de Raquel).

export type Area = {
  /** Ancla en /que-hacemos (#area-<id>) y clave estable. */
  id: string;
  /** Nombre tal cual el cartel. */
  nombre: string;
  /**
   * Rótulo para el ÍNDICE, cuando el nombre completo se parte en dos
   * renglones. El artículo sigue mostrando `nombre`: los nombres de las seis
   * áreas son los del cartel oficial de ED y no se rebautizan para que entren
   * en una columna.
   */
  nombreCorto?: string;
  /** Frase «en verde»: la idea fuerza del área. */
  idea: string;
  /** Qué es, en una o dos oraciones. */
  queEs: string;
  /** Qué recibe concretamente quien contrata. */
  teLlevas: readonly string[];
  /** Para quién es esta área. */
  paraQuien: string;
  /**
   * Proyectos hechos que la ilustran.
   *
   * NO SE PUBLICAN desde el 2026-09-09: eran chips al pie de cada área y
   * salieron a pedido del owner. El dato se conserva —está levantado del CV
   * de Daniela y del PPTX institucional— para cuando se decida dónde va.
   * Ojo: nunca pasó por la validación que este mismo comentario pedía, así
   * que republicarlo sin que Raquel y Daniela lo confirmen sería volver al
   * problema, no arreglarlo.
   */
  hechos: readonly string[];
  /** Foto del pool de marca (reusa las que ya están en public/). */
  foto: string;
  alt: string;
};

export const DESCRIPTOR =
  "Consultora especializada en la transformación del aprendizaje matemático.";

export const BAJADA =
  "Investigamos, diseñamos e implementamos soluciones para la transformación educativa en Matemáticas, junto a ministerios, redes de escuelas, instituciones y equipos docentes. No capacitamos docentes: transformamos la relación con las matemáticas.";

/** Intro de las áreas, textual de Raquel (jul 2026). */
export const AREAS_INTRO =
  "Los ámbitos desde los cuales diseñamos soluciones educativas fundamentadas en la investigación y construidas para cada realidad.";

export const AREAS: readonly Area[] = [
  {
    id: "investigacion",
    nombre: "Investigación",
    idea: "La práctica produce conocimiento",
    queEs:
      "Investigamos las prácticas educativas para producir conocimiento y devolverlo a las aulas en forma de currículo, materiales, formación y evaluación.",
    teLlevas: [
      "Estudios y sistematización de experiencias",
      "Evidencia para tomar decisiones",
      "Publicaciones y transferencia",
    ],
    paraQuien:
      "Ministerios, universidades y redes que necesitan evidencia de sus aulas",
    hechos: [
      "Siete líneas de investigación en Matemática Educativa",
      "Artículos en Bolema y RELIME (2025)",
      "Libro «Empoderamiento docente y Socioepistemología» (Gedisa)",
    ],
    foto: "/hero/hero-2.webp",
    alt: "Equipo de ED con una de sus publicaciones",
  },
  {
    id: "materiales",
    nombre: "Diseño de materiales didácticos",
    nombreCorto: "Diseño de materiales",
    idea: "Cada tarea puede transformar la relación con las matemáticas",
    queEs:
      "Diseñamos materiales que median entre el cuerpo docente, las matemáticas y el aprendizaje: tareas que invitan a explorar, argumentar y reconstruir significados.",
    teLlevas: [
      "Colecciones para docentes y estudiantes",
      "Situaciones de aprendizaje y guías docentes",
      "Recursos digitales",
    ],
    paraQuien:
      "Sistemas y redes que necesitan materiales propios para su contexto",
    hechos: [
      "Colección Matemática en Red (Ministerio de Educación de la Ciudad de Buenos Aires, 2024)",
      "Materiales para primer ciclo y guías de ingreso para escuelas técnicas",
      "Cuadernillos del Plan Nacional Aprender Matemática (Argentina, 2019)",
    ],
    foto: "/metodo/disenamos.webp",
    alt: "Materiales didácticos sobre una mesa de trabajo",
  },
  {
    id: "desarrollo-profesional",
    nombre: "Desarrollo profesional docente",
    nombreCorto: "Desarrollo profesional",
    idea: "La experiencia como fuente de reflexión",
    queEs:
      "Trayectos, talleres y diplomaturas donde cada docente vive una situación de aprendizaje, la lleva al aula y la analiza en comunidad, con material específico y acompañamiento de especialistas.",
    teLlevas: [
      "Dispositivo a medida: presencial, virtual o mixto",
      "Formación de quienes lideran y facilitan",
      "Seguimiento en el aula",
    ],
    paraQuien:
      "Ministerios, empresas, fundaciones y redes que forman a escala",
    hechos: [
      "Cursos y talleres para más de 11.000 docentes de educación media superior en México",
      "Formación de 500 formadores del Plan Nacional Aprender Matemática (Argentina)",
      "Workshops y acompañamiento a líderes en escuelas técnicas de Argentina, México y Brasil",
    ],
    foto: "/metodo/acompanamos.webp",
    alt: "Docentes trabajando en un taller",
  },
  {
    id: "acompanamiento",
    nombre: "Acompañamiento",
    idea: "Vivimos para hacer vivir",
    queEs:
      "Estamos cerca de equipos técnicos, coordinaciones y líderes pedagógicos mientras las propuestas se implementan: miramos las prácticas, analizamos evidencias y ajustamos el rumbo.",
    teLlevas: [
      "Encuentros sostenidos todo el año",
      "Asesoría técnico-pedagógica a equipos",
      "Acompañamiento por escuela o por sede",
    ],
    paraQuien:
      "Equipos con programas en marcha que necesitan sostenerlos",
    hechos: [
      "Encuentros con coordinaciones de primer ciclo de la Ciudad de Buenos Aires",
      "Acompañamiento a la implementación curricular en escuelas técnicas",
      "Comunidad virtual para 3.500 docentes (México)",
    ],
    foto: "/hero/hero-5.webp",
    alt: "Taller en un aula",
  },
  {
    id: "curriculo",
    nombre: "Currículo",
    idea: "La coherencia hace posible el aprendizaje",
    queEs:
      "Diseñamos arquitecturas curriculares que articulan conocimiento, progresión y sentido para orientar trayectorias de aprendizaje.",
    teLlevas: [
      "Marcos conceptuales y programas",
      "Homologación entre sedes y países",
      "Mapas de progresión y revisión de libros",
    ],
    paraQuien:
      "Ministerios y redes que necesitan coherencia entre qué, cómo y cuándo",
    hechos: [
      "Currícula homologada de Matemáticas para escuelas técnicas de Argentina y México",
      "Orientación conceptual del área de Matemática de la Ciudad de Buenos Aires",
      "Participación en el diseño del currículo de Matemáticas de la educación media superior de México",
    ],
    foto: "/quienes-somos/origen-03-pregunta.webp",
    alt: "Planificación curricular en equipo",
  },
  {
    id: "evaluacion",
    nombre: "Evaluación",
    idea: "Comprender permite decidir",
    queEs:
      "Desarrollamos sistemas de evaluación que generan evidencia situada para comprender los aprendizajes y orientar decisiones educativas.",
    teLlevas: [
      "Instrumentos diseñados y validados",
      "Análisis psicométrico y ganancia educativa",
      "Informes para decidir",
    ],
    paraQuien:
      "Instituciones que quieren decidir con evidencia sobre los aprendizajes",
    hechos: [
      "Marco de referencia y reactivos de exámenes nacionales (CENEVAL, México)",
      "Evaluaciones de egreso y de ingreso en escuelas técnicas",
      "Análisis de ganancia educativa entre generaciones",
    ],
    foto: "/metodo/evaluamos.webp",
    alt: "Análisis de resultados de evaluación",
  },
];

// ── Cómo trabajamos: la mirada ED, en seis verbos ─────────────────────────────
// Son los seis pasos que ED comunica en redes desde agosto de 2026 («La mirada
// ED»), con la idea fuerza textual de cada uno y la descripción del documento
// de Raquel (jul 2026). La entrada («Siempre comenzamos con una
// conversación», textual del PPTX institucional) se sacó (Gastón,
// 2026-09-09): la idea ya está dicha en Inicio y en Contacto («Cada
// propuesta empieza con una conversación») y el primer verbo la repite.
export const MIRADA_INTRO = {
  titulo: "Cómo trabajamos",
  texto:
    "Los seis pasos que sigue cada proyecto, del primer diálogo a la transformación.",
} as const;

export const MIRADA = [
  {
    verbo: "Escuchar",
    idea: "Toda solución nace de una realidad comprendida",
    texto:
      "Dialogamos con las personas, comprendemos los contextos y construimos una lectura compartida que orienta cada decisión.",
  },
  {
    verbo: "Investigar",
    idea: "La práctica también produce conocimiento",
    texto:
      "Investigamos en diálogo con la práctica para comprender los desafíos de cada realidad y generar evidencia.",
  },
  {
    verbo: "Diseñar",
    idea: "Cada realidad inspira una solución distinta",
    texto:
      "Diseñamos soluciones que integran investigación, currículo, evaluación, materiales y desarrollo profesional docente.",
  },
  {
    verbo: "Acompañar",
    idea: "Vivimos para hacer vivir",
    texto:
      "Construimos procesos donde la experiencia, la implementación y la práctica reflexiva fortalecen el desarrollo profesional.",
  },
  {
    verbo: "Evaluar",
    idea: "La evidencia orienta cada nuevo paso",
    texto:
      "Analizamos procesos, interpretamos evidencias y generamos conocimiento para fortalecer decisiones.",
  },
  {
    verbo: "Transformar",
    idea: "Las transformaciones se construyen de manera sistémica",
    texto:
      "Cada decisión forma parte de un sistema: investigación, currículo, materiales, evaluación, desarrollo profesional e instituciones.",
  },
] as const;

// ── Con quién trabajamos ──────────────────────────────────────────────────────
// Los cuatro tipos de interlocutor que aparecen en el brief, la planilla de
// alianzas y los proyectos hechos. ED no vende cursos a docentes sueltos:
// trabaja con quienes deciden y sostienen la enseñanza.
export const INTERLOCUTORES = [
  {
    quien: "Ministerios y secretarías de educación",
    que: "Asesoría, currículo, materiales y acompañamiento a equipos técnicos",
  },
  {
    quien: "Empresas y fundaciones con programas educativos",
    que: "Currícula, evaluaciones, materiales y desarrollo profesional para sus redes de escuelas",
  },
  {
    quien: "Redes de escuelas e instituciones",
    que: "Procesos de transformación sostenidos en el tiempo, con acompañamiento",
  },
  {
    quien: "Consultoras, organismos y universidades",
    que: "Dispositivos masivos de desarrollo profesional, investigación y transferencia",
  },
] as const;
