// Catálogo mock de la Biblioteca. Cuando exista el catálogo real (CMS o
// Supabase), esta data se reemplaza por el fetch y los tipos se comparten
// con el listado y el riel de categorías (ver nota en CategoriasRail).
//
// Las portadas reusan fotos reales del hero como placeholder: la idea es que
// cada material pueda llevar CUALQUIER foto que el equipo quiera (no un
// ícono de PDF), así que el mock ya ejercita ese layout.

export const TIPOS = [
  "Producción académica",
  "Recurso didáctico",
  "Proyectos",
  "Guías y cuadernos",
  "Evaluación",
  "Charlas y seminarios",
] as const;

export const TEMAS = [
  "Pensamiento matemático",
  "Matemática Educativa",
  "Evaluación situada",
  "Desarrollo profesional docente",
] as const;

export const PUBLICOS = [
  "Docentes",
  "Formadoras y formadores",
  "Equipos directivos",
  "Familias",
] as const;

export type Material = {
  titulo: string;
  descripcion: string;
  tipo: (typeof TIPOS)[number];
  tema: (typeof TEMAS)[number];
  publico: (typeof PUBLICOS)[number];
  /** Año solo (para el filtro); `fecha` es la forma mostrada ("Abr 2024"). */
  anio: number;
  fecha: string;
  formato: "PDF" | "ZIP" | "Video";
  /** Solo para materiales paginados (PDF); videos y carpetas no lo llevan. */
  paginas?: number;
  portada: string;
};

export const MATERIALES: Material[] = [
  {
    titulo: "Rúbricas para retroalimentar sin calificar",
    descripcion:
      "Set de rúbricas de retroalimentación formativa para acompañar procesos sin convertir cada producción en una calificación.",
    tipo: "Evaluación",
    tema: "Evaluación situada",
    publico: "Docentes",
    anio: 2025,
    fecha: "Jun 2025",
    formato: "PDF",
    paginas: 16,
    portada: "/hero/hero-1.webp",
  },
  {
    titulo: "Secuencias didácticas abiertas: fracciones y reparto",
    descripcion:
      "Colección editable de secuencias sobre fracciones a partir de situaciones de reparto, listas para adaptar a cada grupo.",
    tipo: "Recurso didáctico",
    tema: "Pensamiento matemático",
    publico: "Docentes",
    anio: 2025,
    fecha: "Mar 2025",
    formato: "ZIP",
    portada: "/hero/hero-8.webp",
  },
  {
    titulo: "Seminario: las matemáticas más allá del cálculo",
    descripcion:
      "Registro del seminario sobre el pensamiento matemático como forma de razonar: argumentar, descomponer problemas y validar con evidencia.",
    tipo: "Charlas y seminarios",
    tema: "Matemática Educativa",
    publico: "Docentes",
    anio: 2024,
    fecha: "Sep 2024",
    formato: "Video",
    portada: "/hero/hero-11.webp",
  },
  {
    titulo: "Pensamiento matemático en el aula",
    descripcion:
      "Guía práctica con situaciones para que las y los estudiantes conjeturen, argumenten y validen sus ideas antes de llegar al algoritmo.",
    tipo: "Guías y cuadernos",
    tema: "Pensamiento matemático",
    publico: "Docentes",
    anio: 2024,
    fecha: "Abr 2024",
    formato: "PDF",
    paginas: 36,
    portada: "/hero/hero-4.webp",
  },
  {
    titulo: "Bitácora del acompañamiento en escuelas rurales",
    descripcion:
      "Recorrido documentado de un año de acompañamiento a comunidades educativas rurales: decisiones, obstáculos y aprendizajes del equipo.",
    tipo: "Proyectos",
    tema: "Desarrollo profesional docente",
    publico: "Equipos directivos",
    anio: 2023,
    fecha: "Oct 2023",
    formato: "PDF",
    paginas: 64,
    portada: "/hero/hero-3.webp",
  },
  {
    titulo: "Marco de evaluación situada",
    descripcion:
      "Criterios e instrumentos para mirar el aprendizaje en contexto: qué observar, cómo registrarlo y cómo devolverlo sin reducirlo a una nota.",
    tipo: "Evaluación",
    tema: "Evaluación situada",
    publico: "Equipos directivos",
    anio: 2023,
    fecha: "Feb 2023",
    formato: "PDF",
    paginas: 24,
    portada: "/hero/hero-6.webp",
  },
  {
    titulo: "Cuaderno de exploración matemática para el hogar",
    descripcion:
      "Actividades breves para explorar patrones, formas y juegos de conteo en familia, sin necesidad de saberes previos.",
    tipo: "Guías y cuadernos",
    tema: "Pensamiento matemático",
    publico: "Familias",
    anio: 2022,
    fecha: "Jul 2022",
    formato: "PDF",
    paginas: 20,
    portada: "/hero/hero-10.webp",
  },
  {
    titulo: "Formación de formadores: diseño del trayecto",
    descripcion:
      "Fundamentos y estructura de un trayecto formativo pensado para quienes forman a otras y otros profesionales de la educación.",
    tipo: "Producción académica",
    tema: "Desarrollo profesional docente",
    publico: "Formadoras y formadores",
    anio: 2021,
    fecha: "May 2021",
    formato: "PDF",
    paginas: 52,
    portada: "/hero/hero-5.webp",
  },
  {
    titulo: "Charla: profesionales de la educación, no ejecutores",
    descripcion:
      "Conversación abierta sobre qué significa entender la docencia como profesión: autonomía, juicio pedagógico y trabajo colectivo.",
    tipo: "Charlas y seminarios",
    tema: "Desarrollo profesional docente",
    publico: "Docentes",
    anio: 2021,
    fecha: "Ago 2021",
    formato: "Video",
    portada: "/hero/hero-7.webp",
  },
  {
    titulo: "Empoderamiento docente desde la proporcionalidad",
    descripcion:
      "Investigación sobre cómo el estudio de la proporcionalidad puede transformar la relación de las y los docentes con el saber matemático que enseñan.",
    tipo: "Producción académica",
    tema: "Matemática Educativa",
    publico: "Formadoras y formadores",
    anio: 2020,
    fecha: "Nov 2020",
    formato: "PDF",
    paginas: 148,
    portada: "/hero/hero-2.webp",
  },
];

/** Años presentes en el catálogo, de más nuevo a más viejo (para el filtro). */
export const ANIOS = [...new Set(MATERIALES.map((m) => m.anio))].sort(
  (a, b) => b - a,
);

/** Verbo de la acción según el formato (la etiqueta dice lo que pasa al usarla). */
export const ACCION: Record<Material["formato"], string> = {
  PDF: "Abrir documento",
  ZIP: "Descargar materiales",
  Video: "Ver grabación",
};

/**
 * Material destacado (sitemap): selección corta curada por el equipo, con
 * copy propio por encima del catálogo. `titulo` referencia al item de
 * MATERIALES (de ahí salen portada, descripción y metadata).
 */
export type Destacado = {
  /** Debe matchear el `titulo` de un item de MATERIALES. */
  titulo: string;
  /** Rótulo corto para el índice lateral. */
  rotulo: string;
  /** Bajada de una línea (el "subtítulo" del destacado). */
  tagline: string;
  /** Párrafo extra que amplía la descripción del catálogo. */
  detalle: string;
};

export const DESTACADOS: Destacado[] = [
  {
    titulo: "Empoderamiento docente desde la proporcionalidad",
    rotulo: "Proporcionalidad",
    tagline: "La investigación que le da nombre a ED.",
    detalle:
      "El estudio con docentes de secundaria que mostró que, al problematizar un saber tan cotidiano como la proporcionalidad, cambia la relación con la matemática que se enseña. De ahí nace el proyecto de Empoderamiento Docente.",
  },
  {
    titulo: "Pensamiento matemático en el aula",
    rotulo: "Pensamiento matemático",
    tagline: "Del algoritmo a la argumentación.",
    detalle:
      "Situaciones listas para el aula donde primero se conjetura y se discute, y recién después aparece la técnica. Incluye orientaciones para anticipar las respuestas de las y los estudiantes.",
  },
  {
    titulo: "Marco de evaluación situada",
    rotulo: "Evaluación situada",
    tagline: "Mirar el aprendizaje en contexto.",
    detalle:
      "Qué observar, cómo registrarlo y cómo devolverlo: un marco para que la evaluación acompañe el proceso en lugar de reducirlo a una nota.",
  },
  {
    titulo: "Secuencias didácticas abiertas: fracciones y reparto",
    rotulo: "Secuencias didácticas",
    tagline: "Listas para adaptar y llevar al aula.",
    detalle:
      "Una carpeta editable para planificar sin partir de cero: cada secuencia trae propósito, consigna y variantes según el grupo.",
  },
];
