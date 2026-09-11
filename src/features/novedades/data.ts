// Contenido de Novedades.
//
// Hechos reales, nada más: las publicaciones recientes del equipo (las mismas
// del catálogo de la Biblioteca, con su DOI) y la alianza con UNESCO (carta
// de la Oficina Regional de Montevideo, docs/content/aliados-fuentes-drive.md).
// Reemplaza al listado inventado de eventos, convocatorias y prensa
// (Gastón, 2026-09-11): esas categorías quedan vacías hasta que el cliente
// mande material real; el filtro ya tiene su estado vacío. Las fotos son
// las del sitio, no de cada nota. Cuando haya CMS, esto se reemplaza por el
// fetch.

import type { ReactElement } from "react";
import {
  BookOpen,
  Users,
  Target,
  TrendingUp,
  Compass,
  type IconProps,
} from "@/components/ui/icons";

export type CategoriaKey =
  | "publicaciones"
  | "eventos"
  | "convocatorias"
  | "prensa"
  | "alianzas";

export type Categoria = {
  key: CategoriaKey;
  label: string;
  Icon: (props: IconProps) => ReactElement;
};

// Fecha ISO → "15 jul 2026". Acepta también "2026-07" ("jul 2026") y "2026"
// cuando la fuente no da el día (una revista dice el mes; un libro, el año).
// Sin libs de fecha ni locale del navegador, que rompería la hidratación.
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
export function fechaCorta(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!m) return `${y}`;
  return d ? `${d} ${MESES[m - 1]} ${y}` : `${MESES[m - 1]} ${y}`;
}

// El orden acá manda el orden de los chips de filtro.
export const CATEGORIAS: Categoria[] = [
  { key: "publicaciones", label: "Publicaciones", Icon: BookOpen },
  { key: "eventos", label: "Eventos", Icon: Users },
  { key: "convocatorias", label: "Convocatorias", Icon: Target },
  { key: "prensa", label: "Prensa", Icon: TrendingUp },
  { key: "alianzas", label: "Alianzas", Icon: Compass },
];

export const CATEGORIA_LABEL: Record<CategoriaKey, string> = Object.fromEntries(
  CATEGORIAS.map((c) => [c.key, c.label]),
) as Record<CategoriaKey, string>;

export type Novedad = {
  id: string;
  /** ISO: YYYY-MM-DD, YYYY-MM o YYYY, según la precisión de la fuente. */
  fecha: string;
  categoria: CategoriaKey;
  titulo: string;
  bajada: string;
  imagen: string;
  /** Solo una debería ser la de tapa. */
  destacada?: boolean;
  /**
   * Cuerpo de la nota en secciones tituladas: alimentan la "guía de la nota"
   * (índice lateral de la ficha). Solo las novedades con cuerpo tienen ficha
   * propia en /novedades/[id] y card clickeable. Piloto: el artículo de
   * RELIME, escrito a partir de su resumen; el cliente lo valida.
   */
  cuerpo?: NovedadSeccion[];
  /**
   * Título exacto de la publicación en el catálogo de la Biblioteca
   * (`biblioteca/data/materiales`): la ficha cierra con el botón que lleva
   * al archivo (DOI, revista o PDF), sin obligar a buscarlo (Gastón,
   * 2026-09-11).
   */
  publicacion?: string;
};

export type NovedadSeccion = {
  /** Ancla dentro de la ficha (kebab-case, única por nota). */
  id: string;
  titulo: string;
  parrafos: string[];
};

// Listado de novedades, de la más nueva a la más vieja. La `destacada: true`
// es la nota de tapa.
export const NOVEDADES: Novedad[] = [
  {
    id: "unesco-montevideo",
    fecha: "2026-08-26",
    categoria: "alianzas",
    titulo: "UNESCO Montevideo se suma a las alianzas de ED",
    bajada:
      "La Oficina Regional de UNESCO en Montevideo autorizó el uso de su logo en los materiales de difusión de la colaboración con Empoderamiento Docente. Ya acompaña a Techint, Bloom, la UCSH y Science Up en nuestra tira de aliados.",
    // El logo blanco sobre el navy de marca: la carta autoriza el logo en los
    // materiales de difusión de la colaboración, y una foto de aula no decía
    // nada de UNESCO (Gastón, 2026-09-11).
    imagen: "/novedades/alianza-unesco.webp",
    cuerpo: [
      {
        id: "que-dice-la-carta",
        titulo: "Qué dice la carta",
        parrafos: [
          "El 26 de agosto de 2026 la Oficina Regional de UNESCO en Montevideo autorizó por carta a Empoderamiento Docente a usar su logo en los materiales informativos y de difusión vinculados a esta colaboración.",
        ],
      },
      {
        id: "donde-se-ve",
        titulo: "Dónde se ve",
        parrafos: [
          "Desde entonces el logo acompaña a los de Techint, Bloom, la Universidad Católica Silva Henríquez y Science Up en la tira de aliados del sitio. Solo publicamos los logos con autorización expresa de cada organización.",
        ],
      },
    ],
  },
  {
    id: "pedagogia-y-saberes-2026",
    fecha: "2026-07",
    categoria: "publicaciones",
    titulo: "Educación matemática y ciudadanía, en Pedagogía y Saberes",
    bajada:
      "Paola Balda, con Elizabeth Torres-Puentes y Claudia Salazar-Amaya, publica un artículo de reflexión sobre subjetividad, creatividad y ética como categorías que configuran las prácticas educativas con las matemáticas.",
    imagen: "/quienes-somos/origen-01-aulas.webp",
  },
  {
    id: "numeros-circulos-matematicos",
    fecha: "2026-02",
    categoria: "publicaciones",
    titulo: "Círculos matemáticos con estudiantes de Argentina y Colombia",
    bajada:
      "Paola Balda y Romina Busain describen en la revista Números la experiencia de dos grupos resolviendo problemas con la metodología de los círculos matemáticos: un estudio de casos con registros en video.",
    imagen: "/metodo/acompanamos.webp",
  },
  {
    id: "rmf-sistema-solar",
    fecha: "2026-01",
    categoria: "publicaciones",
    titulo: "Un taller sobre el Sistema Solar para chicas y chicos de 8 a 13 años",
    bajada:
      "Luis Cabrera firma, en la Revista Mexicana de Física E, el diseño y la evaluación de un taller semanal con historietas, modelos de bajo costo y juegos de mesa. En más del 90 % de las sesiones, más de la mitad del grupo alcanzó los aprendizajes esperados.",
    imagen: "/hero/hero-10.webp",
  },
  {
    id: "somidem-formacion-2026",
    fecha: "2026",
    categoria: "publicaciones",
    titulo: "Judith Hernández coedita un libro sobre formación de profesores de matemáticas",
    bajada:
      "Editado por SOMIDEM junto a David Páez y Lilia Aké: cómo llevar las investigaciones en Educación Matemática a la formación inicial y continua del profesorado.",
    imagen: "/metodo/disenamos.webp",
  },
  {
    id: "relime-2025",
    fecha: "2025-12",
    categoria: "publicaciones",
    titulo: "Resignificar el saber matemático escolar: nuevo artículo en RELIME",
    bajada:
      "Daniela Reyes-Gasperini y Karla Gómez Osalde publican en la Revista Latinoamericana de Investigación en Matemática Educativa cómo se resignifica el conocimiento matemático escolar dentro de un programa de desarrollo profesional docente.",
    imagen: "/quienes-somos/origen-03-pregunta.webp",
    publicacion:
      "Resignificación del conocimiento matemático escolar en un espacio de desarrollo profesional docente",
    destacada: true,
    cuerpo: [
      {
        id: "que-estudia",
        titulo: "Qué estudia",
        parrafos: [
          "El artículo sigue a docentes en servicio durante un programa de desarrollo profesional orientado al empoderamiento docente, y mira qué pasa con el conocimiento matemático escolar cuando se lo pone en discusión. Las dos autoras firman con filiación Empoderamiento Docente: es la investigación más reciente del equipo.",
          "El análisis se apoya en dos episodios, uno de pensamiento algebraico y otro de pensamiento geométrico, tomados del trabajo con el grupo.",
        ],
      },
      {
        id: "que-encuentra",
        titulo: "Qué encuentra",
        parrafos: [
          "La resignificación aparece como un proceso cíclico, colectivo y progresivo: no ocurre de una vez ni en soledad, y se vuelve parte constitutiva de la profesión docente en matemáticas. Es la idea que sostiene cómo trabajamos: el cambio de relación con la matemática escolar se construye con otras y otros, en el tiempo.",
        ],
      },
      {
        id: "donde-leerlo",
        titulo: "Dónde leerlo",
        parrafos: [
          "Es de acceso abierto en RELIME y está en nuestra Biblioteca, entre los destacados.",
        ],
      },
    ],
  },
  {
    id: "bolema-2025",
    fecha: "2025",
    categoria: "publicaciones",
    titulo: "Problematizar la matemática escolar, en Bolema",
    bajada:
      "Mayra Báez, Rebeca Flores-García y Daniela Reyes-Gasperini argumentan cómo la problematización de la matemática escolar contribuye al desarrollo profesional docente, con dos episodios analizados con el modelo reflexivo de la matemática escolar.",
    imagen: "/metodo/escuchamos.webp",
  },
  {
    id: "aiem-derivada-2025",
    fecha: "2025-05",
    categoria: "publicaciones",
    titulo: "Los criterios de la derivada desde la variación, en AIEM",
    bajada:
      "José David Zaldívar, Luis Cabrera y Alma Jiménez proponen situaciones donde el cambio y la variación son el objeto de estudio, para darle significado a los criterios de la derivada más allá de su aplicación algorítmica.",
    imagen: "/metodo/evaluamos.webp",
  },
  {
    id: "somidem-rubrica-2024",
    fecha: "2024",
    categoria: "publicaciones",
    titulo: "Una rúbrica para evaluar el pensamiento y lenguaje variacional",
    bajada:
      "Luis Cabrera presenta, en un capítulo editado por SOMIDEM, un esquema y una rúbrica analítica validada por expertos para promover y evaluar el desarrollo del pensamiento y lenguaje variacional.",
    imagen: "/hero/hero-9.webp",
  },
];

// ── "ED en movimiento" — la escena de profundidad (cards que se acercan) ──────
// Cada momento sale de la luz del faro en el horizonte y viene hacia el usuario
// con el scroll. La etiqueta (mono) es corta y va arriba de cada card; la frase
// es lo que aparece grande al centro cuando ese momento pasa cerca.
export type MomentoMovimiento = {
  id: string;
  etiqueta: string;
  frase: string;
  /**
   * Tramo de `frase` que va en verde-concepto (DESIGN §6: el verde nombra el
   * concepto, igual que "y recursos" en el hero de Biblioteca o "transformar."
   * en el de Investigación). Debe ser un substring EXACTO de `frase`; si no
   * matchea, la frase se muestra entera en blanco.
   */
  acento: string;
  imagen: string;
};

export const MOVIMIENTO: MomentoMovimiento[] = [
  { id: "aulas", etiqueta: "EN LAS AULAS", frase: "Empieza en el aula.", acento: "el aula.", imagen: "/quienes-somos/origen-01-aulas.webp" },
  { id: "docentes", etiqueta: "CON DOCENTES", frase: "Junto a quienes enseñan.", acento: "quienes enseñan.", imagen: "/metodo/escuchamos.webp" },
  { id: "investigacion", etiqueta: "INVESTIGACIÓN", frase: "Investigamos lo que hacemos.", acento: "lo que hacemos.", imagen: "/quienes-somos/origen-03-pregunta.webp" },
  { id: "diseno", etiqueta: "DISEÑO", frase: "Diseñamos tareas que importan.", acento: "tareas que importan.", imagen: "/metodo/disenamos.webp" },
  { id: "congresos", etiqueta: "CONGRESOS", frase: "Lo llevamos a la región.", acento: "a la región.", imagen: "/hero/hero-6.webp" },
  { id: "paises", etiqueta: "CINCO PAÍSES", frase: "En cinco países, a la vez.", acento: "cinco países", imagen: "/hero/hero-9.webp" },
];

// ── Lanzamientos y recursos recientes (puente a Biblioteca) ───────────────────
export type Lanzamiento = {
  id: string;
  tipo: string;
  titulo: string;
  imagen: string;
};

// Los mismos destacados de la Biblioteca (publicaciones reales).
export const LANZAMIENTOS: Lanzamiento[] = [
  { id: "l-libro", tipo: "Libro · Gedisa 2016", titulo: "Empoderamiento docente y Socioepistemología", imagen: "/hero/hero-2.webp" },
  { id: "l-relime", tipo: "Artículo · RELIME 2025", titulo: "Resignificación del conocimiento matemático escolar", imagen: "/quienes-somos/origen-03-pregunta.webp" },
  { id: "l-bolema", tipo: "Artículo · Bolema 2025", titulo: "Problematizar la matemática escolar", imagen: "/metodo/disenamos.webp" },
  { id: "l-oaxaca", tipo: "Artículo · Redalyc 2016", titulo: "Oaxaca: una transformación colectiva", imagen: "/quienes-somos/origen-01-aulas.webp" },
  { id: "l-derivada", tipo: "Artículo · IE REDIECH 2024", titulo: "¿Qué significados de la derivada favorece un profesor?", imagen: "/metodo/evaluamos.webp" },
];
