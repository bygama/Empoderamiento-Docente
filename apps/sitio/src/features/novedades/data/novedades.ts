// Contenido de la página Novedades que todavía vive en el código: los
// momentos de «ED en movimiento» y los lanzamientos recientes. Las novedades
// mismas están en la base (tabla `novedades`) desde work/novedades-y-kit/.

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
  { id: "aulas", etiqueta: "EN LAS AULAS", frase: "Empieza en el aula.", acento: "el aula.", imagen: "/fotos/docentes-trabajan-aula.webp" },
  { id: "docentes", etiqueta: "CON DOCENTES", frase: "Junto a quienes enseñan.", acento: "quienes enseñan.", imagen: "/fotos/formadora-guia-taller.webp" },
  { id: "investigacion", etiqueta: "INVESTIGACIÓN", frase: "Investigamos lo que hacemos.", acento: "lo que hacemos.", imagen: "/fotos/pizarra-umce.webp" },
  { id: "diseno", etiqueta: "DISEÑO", frase: "Diseñamos tareas que importan.", acento: "tareas que importan.", imagen: "/fotos/cubos-mano.webp" },
  { id: "congresos", etiqueta: "CONGRESOS", frase: "Lo llevamos a la región.", acento: "a la región.", imagen: "/fotos/encuentro-mesas-rojas.webp" },
  { id: "paises", etiqueta: "CINCO PAÍSES", frase: "En cinco países, a la vez.", acento: "cinco países", imagen: "/fotos/grupo-al-aire-libre.webp" },
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
  { id: "l-libro", tipo: "Libro · Gedisa 2016", titulo: "Empoderamiento docente y Socioepistemología", imagen: "/fotos/conferencia-problematizacion.webp" },
  // contexto-significacion: la lámina que se ve es literalmente sobre
  // resignificación, y no se repite en la página (la destacada del mismo
  // artículo lleva la foto de Daniela exponiendo).
  { id: "l-relime", tipo: "Artículo · RELIME 2025", titulo: "Resignificación del conocimiento matemático escolar", imagen: "/fotos/contexto-significacion.webp" },
  { id: "l-bolema", tipo: "Artículo · Bolema 2025", titulo: "Problematizar la matemática escolar", imagen: "/fotos/grupo-en-ronda.webp" },
  { id: "l-oaxaca", tipo: "Artículo · Redalyc 2016", titulo: "Oaxaca: una transformación colectiva", imagen: "/fotos/cierre-encuentro-grupo.webp" },
  { id: "l-derivada", tipo: "Artículo · IE REDIECH 2024", titulo: "¿Qué significados de la derivada favorece un profesor?", imagen: "/fotos/graficas-de-datos.webp" },
];
