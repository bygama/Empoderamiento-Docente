// Contenido de Qué hacemos (sitemap pág. 02: Hero → Nuestro enfoque → Cómo
// trabajamos → Líneas de acción → Niveles → Proyectos y aplicaciones → Cierre).
//
// Las líneas de acción usan el COPY OFICIAL del cliente — misma fuente que
// LineasAccion del home (frase = línea destacada en verde, detalle = la
// descripción). Si el cliente actualiza ese copy, cambiarlo en los dos lados.
// La torre las publica fusionadas en cinco (ver TAMBORES).
// Enfoque (diferenciales de Dani jun 2026), pasos de trabajo, niveles y
// proyectos → armados desde el brief y el modelo conceptual, PENDIENTES de
// validación fina con cliente.

export type Tambor = {
  id: string;
  /** Texto que gira envuelto en el tambor (corto y en una idea). */
  tambor: string;
  /** Título completo oficial — se muestra en el bloque de apoyo. */
  titulo: string;
  /** Frase destacada (verde-concepto). */
  frase: string;
  /** Descripción. */
  detalle: string;
  /** Foto que flota dentro del tambor (placeholder del pool de marca). */
  foto: string;
  /**
   * Acento de la estación. Todas estaban en el mismo navy y el viaje se
   * sentía monocromo; con color propio se nota que avanzás. Solo paleta de
   * marca y NUNCA naranja: está reservado a los CTA.
   */
  acento: string;
};

// La torre publica CINCO líneas: las 7 del copy oficial fusionadas de a
// pares donde el propio contenido ya las juntaba (decisión de Mateo,
// 2026-09-02; ver docs/content/arquitectura-que-hacemos.md §6):
//   02 = Materiales + Currículo  (como en «Proyectos y aplicaciones»)
//   05 = Fortalecimiento + Sistemas educativos (como en el doc maestro: sus
//        frases eran casi la misma)
// Los DOS párrafos de detalle fusionados son una síntesis de las oraciones
// oficiales, no copy nuevo: VALIDAR con ED. Títulos y frases se conservan
// literales. El home sigue con las 7 áreas hasta que ED valide la taxonomía.
export const TAMBORES: Tambor[] = [
  {
    id: "desarrollo-profesional",
    tambor: "Desarrollo profesional",
    titulo: "Desarrollo profesional docente",
    frase: "La experiencia como fuente de reflexión",
    detalle:
      "Impulsamos procesos de desarrollo profesional con sustento vivencial y acompañamiento que fortalecen la práctica, promueven la reflexión y resignifican las matemáticas.",
    foto: "/metodo/acompanamos.webp",
    acento: "var(--color-azul-principal)",
  },
  {
    // Fusión Materiales + Currículo. Se conserva la frase de currículo; la
    // de materiales («Cada tarea puede transformar la relación con las
    // matemáticas») queda fuera de la torre.
    id: "curriculo-materiales",
    tambor: "Currículo y materiales",
    titulo: "Currículo y materiales para la resignificación de las matemáticas",
    frase: "La coherencia hace posible el aprendizaje",
    // VALIDAR con ED: síntesis de los dos párrafos oficiales.
    detalle:
      "Diseñamos arquitecturas curriculares que articulan conocimiento, progresión y sentido, y materiales que median la relación entre docentes, matemáticas y aprendizaje e invitan a explorar, argumentar y resignificar.",
    foto: "/metodo/disenamos.webp",
    acento: "var(--color-verde-concepto-texto)",
  },
  {
    id: "evaluacion",
    tambor: "Evaluación",
    titulo: "Evaluación para la mejora educativa",
    frase: "Comprender permite decidir",
    detalle:
      "Desarrollamos sistemas de evaluación que generan evidencia situada para comprender los aprendizajes y orientar decisiones educativas.",
    foto: "/metodo/evaluamos.webp",
    acento: "var(--color-azul-medio)",
  },
  {
    id: "investigacion",
    tambor: "Investigación",
    titulo: "Investigación en Matemática Educativa",
    frase: "La práctica produce conocimiento",
    detalle:
      "Investigamos las prácticas educativas para producir conocimiento, compartirlo con la comunidad científica y seguir enriqueciendo el campo de la Matemática Educativa.",
    foto: "/hero/hero-2.webp",
    acento: "var(--color-azul-principal)",
  },
  {
    // Fusión Fortalecimiento institucional + Transformación de sistemas
    // educativos. «Fortalecimiento» en el tambor: «Sistemas educativos» ya
    // forzaba la letra más chica al cerrar la vuelta.
    id: "fortalecimiento",
    tambor: "Fortalecimiento",
    titulo: "Fortalecimiento de sistemas educativos",
    frase: "La continuidad hace posible las transformaciones",
    // VALIDAR con ED: síntesis de los dos párrafos oficiales.
    detalle:
      "Fortalecemos capacidades institucionales con políticas, estrategias y procesos que favorecen transformaciones coherentes y sostenibles, integrando las dimensiones del cambio educativo en soluciones pertinentes para cada realidad.",
    foto: "/hero/hero-6.webp",
    acento: "var(--color-verde-concepto-texto)",
  },
];

// ── Nuestro enfoque — diferenciales (palabras de Dani, jun 2026) ─────────────
export const DIFERENCIALES = [
  {
    k: "Partimos de lo que hay",
    d: "para potenciar — nunca desde lo que falta.",
  },
  {
    k: "Nada enlatado",
    d: "cada propuesta se piensa de manera singular, contemplando su contexto.",
  },
  {
    k: "El conocimiento no es neutro",
    d: "miramos el aprendizaje desde el género, los derechos humanos y la justicia social.",
  },
  {
    k: "Escenarios reales",
    d: "generamos escenarios de aprendizaje para que la transformación sea real.",
  },
] as const;

// ── Cómo trabajamos — el camino de un proyecto (4 pasos, viaje horizontal) ───
// Versión corta orientada a quien contrata; el método completo (5 pasos con
// copy oficial) vive en el home. PENDIENTE validar con cliente.
export const PASOS_TRABAJO = [
  {
    n: "01",
    verbo: "Dialogamos",
    texto:
      "Escuchamos tu contexto: qué pasa en tus aulas, qué buscás, desde dónde partimos.",
    foto: "/metodo/escuchamos.webp",
  },
  {
    n: "02",
    verbo: "Diseñamos",
    texto:
      "Armamos una propuesta a medida para ese contexto, con sustento en investigación.",
    foto: "/metodo/disenamos.webp",
  },
  {
    n: "03",
    verbo: "Acompañamos",
    texto:
      "Trabajamos junto a docentes y equipos, en el aula y en el territorio.",
    foto: "/metodo/acompanamos.webp",
  },
  {
    n: "04",
    verbo: "Evaluamos",
    texto:
      "Generamos evidencia del proceso; los hallazgos orientan el paso siguiente.",
    foto: "/metodo/evaluamos.webp",
  },
] as const;

// ── Niveles en los que intervenimos — ondas expansivas (5) ───────────────────
// Los 4 niveles de impacto del modelo conceptual + la red regional. El orden
// va de lo micro a lo macro: es el guion de la animación de anillos.
export const NIVELES = [
  { k: "Docentes", d: "Confianza y decisiones didácticas fundamentadas." },
  { k: "Estudiantes", d: "Pensamiento matemático y uso funcional del saber." },
  { k: "Escuelas", d: "Prácticas innovadoras y cultura de mejora continua." },
  { k: "Sistemas educativos", d: "Políticas y decisiones basadas en evidencia." },
  {
    k: "Redes en cinco países",
    d: "Comunidades e instituciones de América Latina.",
  },
] as const;

// ── Proyectos y aplicaciones — 5 áreas del modelo conceptual ─────────────────
// PENDIENTE: reemplazar por proyectos reales con nombre cuando el cliente
// pase el material. No inventar casos concretos.
export const PROYECTO_AREAS = [
  {
    titulo: "Desarrollo profesional docente",
    d: "Workshops, diplomados, acompañamiento y comunidades de práctica.",
    etiqueta: "Workshops · Diplomados",
  },
  {
    titulo: "Diseño curricular y pedagógico",
    d: "Currícula, materiales, guías didácticas y situaciones de aprendizaje.",
    etiqueta: "Guías didácticas",
  },
  {
    titulo: "Evaluación e investigación aplicada",
    d: "Instrumentos, análisis y evaluación de impacto.",
    etiqueta: "Evaluación de impacto",
  },
  {
    titulo: "Fortalecimiento de sistemas",
    d: "Acompañamiento a ministerios, redes escolares y escuelas técnicas.",
    etiqueta: "Ministerios · Redes",
  },
  {
    titulo: "Recursos y plataformas",
    d: "Baterías de pensamiento matemático y repositorios de prácticas.",
    etiqueta: "Baterías de pensamiento",
  },
] as const;

// Cinta continua con producción real de ED (dato concreto, no inventado).
export const CINTA = [
  "Artículo · RELIME 2025",
  "Capítulo · Bolema 2025",
  "Libro · Empoderamiento docente y Socioepistemología",
  "Cinco países de América Latina",
  "Congresos internacionales",
  "Redes de investigación",
] as const;
