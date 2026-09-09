// Catálogo de la Biblioteca: las dieciséis publicaciones con PDF que juntó ED
// en Drive (inventario y fuentes en docs/content/publicaciones-fuentes-drive.md).
// Reemplaza al catálogo inventado el 2026-09-09.
//
// Cada ítem lleva a la revista o editorial (al DOI cuando hay): son
// publicaciones de acceso abierto y lo prolijo es linkear, no alojar. Dos
// excepciones: el libro de Gedisa es de editorial comercial y va solo con
// ficha y link a la editorial; la tesis doctoral figura como «no publicada»
// en el CV de Daniela y por ahora se aloja en public/biblioteca hasta que
// ella confirme (Facundo, 2026-09-09: «publicalas todas, después resolvemos
// esos detalles»). Las portadas son tipográficas, generadas con la ficha de
// cada publicación (public/biblioteca/portadas); si el equipo consigue las
// tapas reales, se reemplazan por archivo.
//
// Cuando exista un catálogo real (CMS o Supabase), esta data se reemplaza por
// el fetch y los tipos se comparten con el listado y el riel de categorías.

export const TIPOS = [
  "Artículos",
  "Capítulos de libro",
  "Libros",
  "Tesis",
  "Actas de congreso",
] as const;

export const TEMAS = [
  "Desarrollo profesional docente",
  "Pensamiento variacional",
  "Geometría",
  "Tecnología y modelación",
  "Estadística y probabilidad",
  "Divulgación científica",
] as const;

export const PUBLICOS = [
  "Docentes",
  "Formadoras y formadores",
  "Equipos directivos",
  "Investigadoras e investigadores",
] as const;

export type Material = {
  titulo: string;
  autores: string;
  descripcion: string;
  tipo: (typeof TIPOS)[number];
  tema: (typeof TEMAS)[number];
  publico: (typeof PUBLICOS)[number];
  /** Año solo (para el filtro); `fecha` es la forma mostrada ("Dic 2025"). */
  anio: number;
  fecha: string;
  formato: "PDF" | "ZIP" | "Video";
  /** Solo para materiales paginados (PDF); videos y carpetas no lo llevan. */
  paginas?: number;
  portada: string;
  /** Adónde lleva la acción: la revista o editorial (DOI cuando hay) o un PDF propio. */
  url: string;
  /** Dónde se lee, para la etiqueta de la acción («Leer en RELIME»). */
  fuente: string;
};

const PORTADAS = "/biblioteca/portadas";

export const MATERIALES: Material[] = [
  {
    titulo:
      "Taller de conceptos básicos del Sistema Solar adaptado a grupos de nivel primaria y secundaria",
    autores:
      "Rodrigo Rojas Viveros, Antonio Porras, Luis Manuel Cabrera Chim y Ma. Guadalupe Corona-Galindo",
    descripcion:
      "Diseño y evaluación de un taller semanal sobre el Sistema Solar para chicas y chicos de 8 a 13 años: historietas, modelos de cuerpos celestes con materiales de bajo costo y juegos de mesa para formular preguntas, leer, reflexionar y manipular. En más del 90 % de las sesiones, más de la mitad del grupo alcanzó los aprendizajes esperados.",
    tipo: "Artículos",
    tema: "Divulgación científica",
    publico: "Docentes",
    anio: 2026,
    fecha: "Ene 2026",
    formato: "PDF",
    paginas: 14,
    portada: `${PORTADAS}/16-taller-sistema-solar.webp`,
    url: "https://rmf.smf.mx/ojs/index.php/rmf-e/article/view/8047",
    fuente: "Revista Mexicana de Física E",
  },
  {
    titulo:
      "Formación y desarrollo profesional de profesores de matemáticas: implementación de las investigaciones en Educación Matemática",
    autores: "Judith Alejandra Hernández Sánchez, David Alfonso Páez y Lilia Patricia Aké Tec (editores)",
    descripcion:
      "Libro editado por tres especialistas en formación docente, entre ellas Judith Hernández, del equipo de ED, sobre cómo llevar las investigaciones en Educación Matemática a la formación inicial y continua del profesorado de matemáticas.",
    tipo: "Libros",
    tema: "Desarrollo profesional docente",
    publico: "Formadoras y formadores",
    anio: 2026,
    fecha: "2026",
    formato: "PDF",
    paginas: 132,
    portada: `${PORTADAS}/10-formacion-desarrollo-profesional-somidem.webp`,
    url: "https://editorialsomidem.org.mx/",
    fuente: "Editorial SOMIDEM",
  },
  {
    titulo:
      "Problemas de probabilidad de primero de secundaria resueltos mediante el uso de calculadora para medir el razonamiento estadístico",
    autores: "Brenda Azucena Rodríguez González, Eduardo Briceño Solís y Judith Alejandra Hernández Sánchez",
    descripcion:
      "Problemas de probabilidad para primer año de secundaria, resueltos con calculadora, como instrumento para medir el razonamiento estadístico del estudiantado. Capítulo del libro de jóvenes investigadoras e investigadores de SOMIDEM.",
    tipo: "Capítulos de libro",
    tema: "Estadística y probabilidad",
    publico: "Docentes",
    anio: 2026,
    fecha: "2026",
    formato: "PDF",
    paginas: 19,
    portada: `${PORTADAS}/09-probabilidad-calculadora-somidem.webp`,
    url: "https://doi.org/10.24844/SOMIDEM/S3/2026/01-05",
    fuente: "SOMIDEM",
  },
  {
    titulo:
      "Resignificación del conocimiento matemático escolar en un espacio de desarrollo profesional docente",
    autores: "Daniela Reyes-Gasperini y Karla Gómez-Osalde",
    descripcion:
      "Analiza cómo se resignifica el conocimiento matemático escolar en docentes en servicio durante un programa de desarrollo profesional orientado al empoderamiento docente, con dos episodios de pensamiento algebraico y geométrico. La resignificación aparece como un proceso cíclico, colectivo y progresivo, parte constitutiva de la profesión docente en matemáticas.",
    tipo: "Artículos",
    tema: "Desarrollo profesional docente",
    publico: "Investigadoras e investigadores",
    anio: 2025,
    fecha: "Dic 2025",
    formato: "PDF",
    paginas: 39,
    portada: `${PORTADAS}/02-resignificacion-cme-relime.webp`,
    url: "https://doi.org/10.12802/relime.2025.28.e805",
    fuente: "RELIME",
  },
  {
    titulo: "Una aproximación variacional para la significación de los criterios de la derivada",
    autores: "José David Zaldívar Rojas, Luis Manuel Cabrera Chim y Alma Verónica Jiménez Villalpando",
    descripcion:
      "Una aproximación variacional para darle significado a los criterios de la derivada más allá de su aplicación algorítmica: situaciones donde el cambio y la variación son el objeto de estudio y lo que se estudia es cómo varía una cantidad, no solo qué regla aplicar.",
    tipo: "Artículos",
    tema: "Pensamiento variacional",
    publico: "Investigadoras e investigadores",
    anio: 2025,
    fecha: "May 2025",
    formato: "PDF",
    paginas: 24,
    portada: `${PORTADAS}/14-criterios-derivada-variacional.webp`,
    url: "https://doi.org/10.35763/aiem27.6157",
    fuente: "AIEM",
  },
  {
    titulo: "Referentes teóricos para el diseño de situaciones variacionales",
    autores: "Luis Manuel Cabrera Chim",
    descripcion:
      "Qué principios sostienen el diseño de situaciones variacionales: tareas donde el cambio y la variación son lo que se estudia. Capítulo del libro del taller Tendencias en la Educación Matemática Basada en la Investigación (BUAP), editado por SOMIDEM.",
    tipo: "Capítulos de libro",
    tema: "Pensamiento variacional",
    publico: "Formadoras y formadores",
    anio: 2025,
    fecha: "2025",
    formato: "PDF",
    paginas: 30,
    portada: `${PORTADAS}/15-situaciones-variacionales-somidem.webp`,
    url: "https://editorialsomidem.org.mx/?view=viewpub&id=1048",
    fuente: "Editorial SOMIDEM",
  },
  {
    titulo: "¿Qué significados de la derivada favorece un profesor en su planeación de clase?",
    autores: "Eduardo Carlos Briceño Solís, Judith Alejandra Hernández Sánchez y Jonathan Adrián Morales de la Cruz",
    descripcion:
      "Análisis de contenido de las planeaciones de cuatro docentes sobre la enseñanza de la derivada: cómo articulan y organizan sus significados, y la distancia entre lo que propone el programa de estudios y lo que llega a la planeación, donde predomina lo algorítmico y simbólico.",
    tipo: "Artículos",
    tema: "Pensamiento variacional",
    publico: "Docentes",
    anio: 2024,
    fecha: "2024",
    formato: "PDF",
    paginas: 32,
    portada: `${PORTADAS}/13-significados-derivada-planeacion.webp`,
    url: "https://doi.org/10.33010/ie_rie_rediech.v15i0.1975",
    fuente: "IE REDIECH",
  },
  {
    titulo:
      "Implementación del manual «Álgebra dinámica» y el software GeoGebra como recurso didáctico para el aprendizaje de álgebra elemental en el nivel medio superior",
    autores: "María Sofía Valero Cazarez y Judith Alejandra Hernández Sánchez",
    descripcion:
      "Cómo se implementó el manual «Álgebra dinámica» con GeoGebra como recurso para aprender álgebra elemental en el nivel medio superior. Capítulo del libro Intervenciones educativas para la incidencia social (UASLP).",
    tipo: "Capítulos de libro",
    tema: "Tecnología y modelación",
    publico: "Docentes",
    anio: 2024,
    fecha: "2024",
    formato: "PDF",
    paginas: 48,
    portada: `${PORTADAS}/08-algebra-dinamica-geogebra.webp`,
    url: "https://www.researchgate.net/publication/389785466_INTERVENCIONES_EDUCATIVAS_PARA_LA_INCIDENCIA_SOCIAL",
    fuente: "ResearchGate",
  },
  {
    titulo: "Dimensiones tecnológicas en tareas de libros de texto de matemáticas",
    autores: "Judith Alejandra Hernández Sánchez, Cinthya Adriana Elizabeth Padilla Márquez y Eduardo Carlos Briceño Solís",
    descripcion:
      "Analiza 189 tareas con tecnología de ocho libros de texto de secundaria y las clasifica según la dimensión tecnológica que promueven (informática, técnica o didáctica). Hay diferencias entre los modelos SEP 2011 y 2017 y entre ejes temáticos, y una tendencia favorable a un uso razonado de la tecnología en las aulas.",
    tipo: "Artículos",
    tema: "Tecnología y modelación",
    publico: "Docentes",
    anio: 2023,
    fecha: "2023",
    formato: "PDF",
    paginas: 17,
    portada: `${PORTADAS}/07-dimensiones-tecnologicas-redie.webp`,
    url: "https://doi.org/10.24320/redie.2023.25.e19.4527",
    fuente: "REDIE",
  },
  {
    titulo:
      "Análisis de interpretaciones de gráficas de movimiento y sus implicaciones didácticas. Un estudio de caso",
    autores: "Eduardo Carlos Briceño Solís",
    descripcion:
      "Reanálisis del significado que un estudiante de bachillerato construye sobre gráficas de movimiento con tecnología digital: sus explicaciones revelan usos de las gráficas y, a partir de ellos, se proponen actividades para enseñar gráficas cartesianas.",
    tipo: "Artículos",
    tema: "Pensamiento variacional",
    publico: "Docentes",
    anio: 2022,
    fecha: "May 2022",
    formato: "PDF",
    paginas: 24,
    portada: `${PORTADAS}/12-graficas-de-movimiento.webp`,
    url: "https://www.scielo.org.mx/scielo.php?script=sci_arttext&pid=S1665-26732022000200097",
    fuente: "SciELO",
  },
  {
    titulo:
      "Experiencias de aprendizaje y reconceptualización geométrica: una propuesta para la reorganización de la práctica docente",
    autores: "Karla Gómez Osalde y Landy Sosa Moguel",
    descripcion:
      "Propuesta para reorganizar la práctica docente a partir de experiencias de aprendizaje que reconceptualizan la geometría escolar. Capítulo del libro Prospecção de Problemas e Soluções nas Ciências Matemáticas 3 (Atena Editora, Brasil).",
    tipo: "Capítulos de libro",
    tema: "Geometría",
    publico: "Docentes",
    anio: 2020,
    fecha: "2020",
    formato: "PDF",
    paginas: 33,
    portada: `${PORTADAS}/05-reconceptualizacion-geometrica.webp`,
    url: "https://atenaeditora.com.br/catalogo/ebook/prospeccao-de-problemas-e-solucoes-nas-ciencias-matematicas-3",
    fuente: "Atena Editora",
  },
  {
    titulo: "Conceptual and procedural learning in pre-service mathematics teachers during a conversation",
    autores: "Karla Gómez Osalde, Eddie Aparicio Landa y Landy Sosa Moguel",
    descripcion:
      "Estudio con doce futuros docentes y su instructor sobre el paso del aprendizaje procedimental al conceptual en una tarea geométrica, desde un enfoque de aprendizaje conversacional: al confrontar procedimientos y comprensiones en la conversación, pasan de usar la fórmula del área a darle significado a las figuras por las relaciones entre sus dimensiones.",
    tipo: "Actas de congreso",
    tema: "Geometría",
    publico: "Formadoras y formadores",
    anio: 2020,
    fecha: "2020",
    formato: "PDF",
    paginas: 9,
    portada: `${PORTADAS}/06-conceptual-procedural-pme-na.webp`,
    url: "https://eric.ed.gov/?id=ED629884",
    fuente: "ERIC",
  },
  {
    titulo: "La modelación matemática en los procesos de formación inicial y continua de docentes",
    autores: "Eduardo Carlos Briceño Solís y Lizbet Alamillo Sánchez",
    descripcion:
      "Propone la modelación matemática como eje de la formación inicial y continua: docentes que viven y resuelven, en el rol de estudiantes, una situación de contexto biológico cuyas tareas recorren las etapas del proceso de modelación, con una herramienta tecnológica que facilita pasar del problema al modelo.",
    tipo: "Artículos",
    tema: "Tecnología y modelación",
    publico: "Formadoras y formadores",
    anio: 2017,
    fecha: "Oct 2017",
    formato: "PDF",
    paginas: 26,
    portada: `${PORTADAS}/11-modelacion-formacion-docentes.webp`,
    url: "https://www.redalyc.org/journal/5216/521653370007/html/",
    fuente: "Redalyc",
  },
  {
    titulo: "Empoderamiento docente y Socioepistemología. Un estudio sobre la transformación educativa en Matemáticas",
    autores: "Daniela Reyes-Gasperini",
    descripcion:
      "El libro que le da nombre a ED: cómo el constructo de empoderamiento, tomado de la psicología social, entra en la Matemática Educativa desde la línea del desarrollo profesional docente. El cambio de relación con el conocimiento matemático, a través de la problematización de la matemática escolar, favorece autonomía y liderazgo para transformarse y transformar el entorno.",
    tipo: "Libros",
    tema: "Desarrollo profesional docente",
    publico: "Formadoras y formadores",
    anio: 2016,
    fecha: "Oct 2016",
    formato: "PDF",
    paginas: 216,
    portada: `${PORTADAS}/04-libro-empoderamiento-docente.webp`,
    url: "https://books.google.com/books?vid=ISBN9788416919437",
    fuente: "Google Books",
  },
  {
    titulo: "Oaxaca: una transformación colectiva con impacto social y educativo",
    autores: "Daniela Reyes-Gasperini",
    descripcion:
      "Muestra cómo, en condiciones adversas, el profesorado oaxaqueño asume una actitud de transformación. Caracteriza el dispositivo de la Maestría en Enseñanza de las Matemáticas en la Educación Secundaria en Oaxaca, que potencia las fortalezas docentes sobre la base de la problematización de la matemática escolar, con el seminario sobre lo proporcional como ejemplo.",
    tipo: "Artículos",
    tema: "Desarrollo profesional docente",
    publico: "Equipos directivos",
    anio: 2016,
    fecha: "2016",
    formato: "PDF",
    paginas: 31,
    portada: `${PORTADAS}/01-oaxaca-transformacion-colectiva.webp`,
    url: "https://www.redalyc.org/articulo.oa?id=13250921004",
    fuente: "Redalyc",
  },
  {
    titulo:
      "Empoderamiento docente desde una visión socioepistemológica: una alternativa de intervención para la transformación y la mejora educativa",
    autores: "Daniela Reyes-Gasperini",
    descripcion:
      "La tesis doctoral en el Cinvestav, dirigida por Ricardo Cantoral y Gisela Montiel, que fundamenta el empoderamiento docente como alternativa de intervención para la transformación y la mejora educativa: el marco socioepistemológico, el dispositivo de trabajo con docentes y la evidencia del cambio de relación con la matemática escolar.",
    tipo: "Tesis",
    tema: "Desarrollo profesional docente",
    publico: "Investigadoras e investigadores",
    anio: 2016,
    fecha: "Ago 2016",
    formato: "PDF",
    paginas: 598,
    portada: `${PORTADAS}/03-tesis-empoderamiento-docente.webp`,
    url: "/biblioteca/reyes-gasperini-2016-tesis-doctoral.pdf",
    fuente: "PDF",
  },
];

/** Años presentes en el catálogo, de más nuevo a más viejo (para el filtro). */
export const ANIOS = [...new Set(MATERIALES.map((m) => m.anio))].sort(
  (a, b) => b - a,
);

/**
 * Etiqueta de la acción: dice adónde lleva. Un PDF propio se abre acá; lo
 * demás se lee en la revista o la editorial que lo publicó.
 */
export function accionDe(m: Material): string {
  return m.url.startsWith("/") ? "Abrir el PDF" : `Leer en ${m.fuente}`;
}

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
    titulo:
      "Resignificación del conocimiento matemático escolar en un espacio de desarrollo profesional docente",
    rotulo: "RELIME 2025",
    tagline: "La resignificación como parte de la profesión docente.",
    detalle:
      "Las dos autoras firman con filiación Empoderamiento Docente: es la investigación más reciente del equipo y muestra, con episodios de aula, cómo se configura el cambio de relación con la matemática escolar dentro de un programa de desarrollo profesional.",
  },
  {
    titulo: "Empoderamiento docente y Socioepistemología. Un estudio sobre la transformación educativa en Matemáticas",
    rotulo: "El libro",
    tagline: "La investigación que le da nombre a ED.",
    detalle:
      "Publicado por Gedisa en 2016, recoge el estudio doctoral sobre el empoderamiento docente desde la Socioepistemología: por qué problematizar la matemática escolar cambia la relación con el saber y abre autonomía y liderazgo en el profesorado.",
  },
  {
    titulo: "Oaxaca: una transformación colectiva con impacto social y educativo",
    rotulo: "Oaxaca",
    tagline: "Una transformación colectiva con impacto social.",
    detalle:
      "El caso que ED usa para explicar que escalar una política de formación no es replicar un formato: un dispositivo situado que potenció las fortalezas del profesorado oaxaqueño y llegó a sus aulas.",
  },
  {
    titulo: "¿Qué significados de la derivada favorece un profesor en su planeación de clase?",
    rotulo: "La derivada",
    tagline: "Qué se planifica y qué dice el programa.",
    detalle:
      "Dos integrantes del equipo analizan planeaciones reales de clase sobre la derivada y muestran la distancia entre los significados del programa de estudios y los que llegan al aula.",
  },
];

// DESTACADOS referencia materiales del catálogo por título; si un título no
// matchea (typo al editar la data), el destacado simplemente no se lista.
export const ITEMS_DESTACADOS = DESTACADOS.flatMap((d) => {
  const material = MATERIALES.find((m) => m.titulo === d.titulo);
  return material ? [{ ...d, material }] : [];
});

export type ItemDestacado = (typeof ITEMS_DESTACADOS)[number];
